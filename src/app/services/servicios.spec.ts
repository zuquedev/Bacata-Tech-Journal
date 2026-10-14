import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { FavoritosService } from './favoritos.service';
import { NoticiasService } from './noticias.service';

const base = (id: string, categoria = 'Redes') => ({
  id, titulo: 'T' + id, categoria, descripcion: 'd', contenido: 'c', imagen: 'img/x.jpg', fecha: '2026-09-15', ubicacion: 'Bogotá',
});

function crearEntorno(respuesta: object | null, falla = false) {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const http = TestBed.inject(HttpTestingController);
  const noticias = TestBed.inject(NoticiasService);
  const req = http.expectOne('data/noticias.json');
  if (falla) req.error(new ProgressEvent('error')); else req.flush(respuesta);
  return noticias;
}

describe('Servicios', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  describe('NoticiasService', () => {
    it('carga el JSON y descarta registros incompletos', () => {
      const s = crearEntorno([base('a'), { id: 'roto' }, base('b')]);
      expect(s.lista().map(n => n.id)).toEqual(['a', 'b']);
      expect(s.cargando()).toBe(false);
      expect(s.error()).toBeNull();
    });

    it('informa un error si la petición falla', () => {
      const s = crearEntorno(null, true);
      expect(s.lista()).toEqual([]);
      expect(s.error()).toContain('No se pudo cargar');
    });

    it('informa un error si el JSON no trae noticias válidas', () => {
      const s = crearEntorno([{ id: 'x' }]);
      expect(s.error()).toBeTruthy();
    });

    it('crea una noticia propia al inicio del catálogo y la persiste', () => {
      const s = crearEntorno([base('a')]);
      TestBed.inject(AuthService).entrar('editor', 'cronica2026');
      const nueva = s.crear({ titulo: 'Nueva', categoria: 'Software', descripcion: 'x'.repeat(25), contenido: 'cuerpo' });
      expect(s.lista()[0].id).toBe(nueva.id);
      expect(nueva.propia).toBe(true);
      expect(nueva.autor).toBe('editor');
      expect(nueva.ubicacion).toBe('No especificada');
      expect(JSON.parse(localStorage.getItem('cronica_noticias')!).length).toBe(1);
    });

    it('elimina una noticia base (la marca como borrada) y una propia', () => {
      const s = crearEntorno([base('a'), base('b')]);
      const propia = s.crear({ titulo: 'P', categoria: 'Redes', descripcion: 'x'.repeat(25), contenido: 'c' });
      s.eliminar('a');
      s.eliminar(propia.id);
      expect(s.lista().map(n => n.id)).toEqual(['b']);
      expect(JSON.parse(localStorage.getItem('cronica_borradas')!)).toEqual(['a']);
    });

    it('restaurar devuelve el catálogo original', () => {
      const s = crearEntorno([base('a')]);
      s.crear({ titulo: 'P', categoria: 'Redes', descripcion: 'x'.repeat(25), contenido: 'c' });
      s.eliminar('a');
      s.restaurar();
      expect(s.lista().map(n => n.id)).toEqual(['a']);
    });
  });

  describe('FavoritosService', () => {
    it('alterna, cuenta y devuelve los objetos completos', () => {
      const s = crearEntorno([base('a'), base('b')]);
      const f = TestBed.inject(FavoritosService);
      expect(f.alternar('a')).toBe(true);
      expect(f.alternar('b')).toBe(true);
      expect(f.total()).toBe(2);
      expect(f.noticias().map(n => n.id)).toEqual(['a', 'b']);
      expect(f.alternar('a')).toBe(false);
      expect(f.es('a')).toBe(false);
      f.vaciar();
      expect(f.total()).toBe(0);
      expect(s).toBeTruthy();
    });

    it('al eliminar una noticia también se quita de favoritos', () => {
      const s = crearEntorno([base('a')]);
      const f = TestBed.inject(FavoritosService);
      f.alternar('a');
      s.eliminar('a');
      expect(f.total()).toBe(0);
    });

    it('conserva los favoritos entre sesiones (localStorage)', () => {
      crearEntorno([base('a')]);
      TestBed.inject(FavoritosService).alternar('a');
      expect(JSON.parse(localStorage.getItem('cronica_favoritos')!)).toEqual(['a']);
    });
  });

  describe('AuthService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('rechaza credenciales incorrectas y acepta las de demostración', () => {
      const a = TestBed.inject(AuthService);
      expect(a.entrar('editor', 'mala')).toBe(false);
      expect(a.activa()).toBe(false);
      expect(a.entrar('editor', 'cronica2026')).toBe(true);
      expect(a.activa()).toBe(true);
      expect(a.usuario()).toBe('editor');
      expect(sessionStorage.getItem('cronica_sesion')).toBeTruthy();
    });

    it('salir() cierra la sesión', () => {
      const a = TestBed.inject(AuthService);
      a.entrar('editor', 'cronica2026');
      a.salir();
      expect(a.activa()).toBe(false);
      expect(sessionStorage.getItem('cronica_sesion')).toBeNull();
    });
  });
});
