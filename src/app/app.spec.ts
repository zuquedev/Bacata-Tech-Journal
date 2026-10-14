import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { App } from './app';
import { withComponentInputBinding } from '@angular/router';

const noticia = (id: string, categoria: string, titulo = 'Titular ' + id) => ({
  id, titulo, categoria, descripcion: 'Descripción de ' + id, contenido: 'Párrafo uno.\n\nPárrafo dos.',
  imagen: 'img/card1.jpg', fecha: '2026-09-15', ubicacion: 'Cali, Colombia', autor: 'Redacción',
});
const DATOS = [noticia('n1', 'Redes'), noticia('n2', 'Redes'), noticia('n3', 'Software'), noticia('n4', 'Ciberseguridad')];

async function iniciar(url: string) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes, withComponentInputBinding())],
  });
  const fixture = TestBed.createComponent(App);
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  TestBed.inject(HttpTestingController).expectOne('data/noticias.json').flush(DATOS);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement, router };
}

describe('App (páginas completas)', () => {
  beforeEach(() => {
    localStorage.clear(); sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();   // jsdom no lo implementa
  });

  it('el inicio muestra las 3 primeras noticias', async () => {
    const { el } = await iniciar('/');
    expect(el.querySelectorAll('.grid .card').length).toBe(3);
  });

  it('el listado filtra por categoría y por búsqueda, con contadores', async () => {
    const { fixture, el } = await iniciar('/listado');
    expect(el.querySelectorAll('.grid .card').length).toBe(4);

    const chips = Array.from(el.querySelectorAll<HTMLButtonElement>('.chip'));
    expect(chips.map(c => c.textContent!.trim())).toEqual(
      ['Todas (4)', 'Ciberseguridad (1)', 'Redes (2)', 'Software (1)', 'Internacional (0)']);

    chips.find(c => c.textContent!.includes('Redes'))!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.grid .card').length).toBe(2);
    expect(el.querySelector('.results-note')!.textContent).toContain('Mostrando 2 de 4');

    const buscar = el.querySelector<HTMLInputElement>('#buscar')!;
    buscar.value = 'zzz'; buscar.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('.empty h3')!.textContent).toContain('Sin resultados');
  });

  it('marcar favorito actualiza el contador del menú y la página de favoritos', async () => {
    const { fixture, el, router } = await iniciar('/listado');
    expect(el.querySelector('.fav-count')).toBeNull();
    el.querySelector<HTMLButtonElement>('.fav-btn')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.fav-count')!.textContent!.trim()).toBe('1');
    expect(el.querySelector('.fav-btn')!.classList).toContain('is-fav');

    await router.navigateByUrl('/favoritos');
    fixture.detectChanges();
    expect(el.querySelectorAll('.grid .card').length).toBe(1);
    el.querySelector<HTMLButtonElement>('.fav-btn')!.click();   // quitarlo retira la tarjeta
    fixture.detectChanges();
    expect(el.querySelector('.empty h3')!.textContent).toContain('Aún no has guardado');
  });

  it('el detalle muestra la noticia, sus párrafos y las relacionadas', async () => {
    const { el } = await iniciar('/noticia/n1');
    expect(el.querySelector('.detail h1')!.textContent).toBe('Titular n1');
    expect(el.querySelectorAll('.detail-body p').length).toBe(2);
    expect(el.querySelectorAll('.related-mini').length).toBe(1);   // n2 comparte categoría
    expect(el.querySelector('#fav-detalle, .btn-danger')).toBeNull(); // sin sesión no hay botón eliminar
  });

  it('un id inexistente muestra "Publicación no disponible"', async () => {
    const { el } = await iniciar('/noticia/nope');
    expect(el.querySelector('.empty h3')!.textContent).toContain('Publicación no disponible');
  });

  it('/admin sin sesión redirige a /login con ?volver', async () => {
    const { router } = await iniciar('/admin');
    expect(router.url).toBe('/login?volver=%2Fadmin');
  });

  it('login incorrecto muestra el aviso; login correcto lleva a /admin y muestra el menú Administrar', async () => {
    const { fixture, el, router } = await iniciar('/login');
    const rellenar = (u: string, c: string) => {
      const usuario = el.querySelector<HTMLInputElement>('#usuario')!;
      const clave = el.querySelector<HTMLInputElement>('#clave')!;
      usuario.value = u; usuario.dispatchEvent(new Event('input'));
      clave.value = c; clave.dispatchEvent(new Event('input'));
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
    };
    rellenar('editor', 'mala'); fixture.detectChanges();
    expect(el.querySelector<HTMLElement>('.confirm-box')!.style.display).toBe('flex');
    expect(router.url).toBe('/login');

    rellenar('editor', 'cronica2026');
    await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/admin');
    expect(el.querySelector('.topbar-links')!.textContent).toContain('Sesión: editor');
    expect(el.querySelector('.nav')!.textContent).toContain('Administrar');
  });

  it('admin: valida, crea y elimina publicaciones', async () => {
    TestBed.configureTestingModule({});
    sessionStorage.setItem('cronica_sesion', JSON.stringify({ usuario: 'editor', desde: 1 }));
    const { fixture, el } = await iniciar('/admin');
    const filas = () => el.querySelectorAll('.admin-table tr').length - 1;
    expect(filas()).toBe(4);

    const form = el.querySelector('form')!;
    const poner = (id: string, v: string) => { const c = el.querySelector<HTMLInputElement>('#' + id)!; c.value = v; c.dispatchEvent(new Event('input')); };

    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(el.querySelector('.confirm-box')!.textContent).toContain('Completa el título');

    poner('titulo', 'Mi noticia'); poner('descripcion', 'corta'); poner('contenido', 'texto');
    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(el.querySelector('.confirm-box')!.textContent).toContain('al menos 20 caracteres');

    poner('descripcion', 'Una descripción suficientemente larga');
    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(filas()).toBe(5);
    expect(el.querySelector('.admin-table')!.textContent).toContain('Creada por ti');

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    el.querySelector<HTMLButtonElement>('.btn-mini')!.click(); fixture.detectChanges();
    expect(filas()).toBe(4);
  });

  it('contacto: valida los tres campos y confirma el envío', async () => {
    const { fixture, el } = await iniciar('/contacto');
    const form = el.querySelector('form')!;
    const poner = (id: string, v: string) => { const c = el.querySelector<HTMLInputElement>('#' + id)!; c.value = v; c.dispatchEvent(new Event('input')); };

    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(el.querySelectorAll('.field.error').length).toBe(3);
    expect(el.querySelector<HTMLElement>('.confirm-box')!.style.display).toBe('none');

    poner('nombre', 'Ana'); poner('correo', 'ana@correo'); poner('mensaje', 'muy corto');
    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(el.querySelectorAll('.field.error').length).toBe(2);

    poner('correo', 'ana@correo.com'); poner('mensaje', 'Este mensaje tiene más de veinte caracteres.');
    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(el.querySelectorAll('.field.error').length).toBe(0);
    expect(el.querySelector<HTMLElement>('.confirm-box')!.style.display).toBe('flex');
    expect(el.querySelector<HTMLInputElement>('#nombre')!.value).toBe('');   // formulario limpio
  });

  it('la barra superior muestra la fecha en español con la ciudad', async () => {
    const { el } = await iniciar('/');
    expect(el.querySelector('.date')!.textContent).toMatch(/^[A-ZÁÉÍÓÚ][a-záéíóú]+, \d{1,2} de [a-záéíóú]+ de \d{4} · Bogotá, Colombia$/);
  });
});
