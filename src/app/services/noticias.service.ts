import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Noticia, NuevaNoticia } from '../models/noticia';
import { K_BORRADAS, K_NOTICIAS, escribir, leer } from '../utils/almacenamiento';
import { AuthService } from './auth.service';
import { FavoritosService } from './favoritos.service';

// Ruta del catálogo base (vive en public/data/noticias.json)
const RUTA_JSON = 'data/noticias.json';

// Campos de texto que toda noticia debe traer para que las vistas no fallen.
const CAMPOS: (keyof Noticia)[] = ['id', 'titulo', 'categoria', 'descripcion', 'contenido', 'imagen', 'fecha', 'ubicacion'];

function esNoticiaValida(n: unknown): n is Noticia {
  if (!n || typeof n !== 'object') return false;
  const o = n as Record<string, unknown>;
  return CAMPOS.every(c => typeof o[c] === 'string' && (o[c] as string).trim() !== '');
}

/**
 * Catálogo de noticias (antes: cargarNoticiasBase() + NoticiasService de app.js).
 * Catálogo = base del JSON (menos las borradas) + las creadas por el usuario.
 */
@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);

  private readonly base     = signal<Noticia[]>([]);
  private readonly propias  = signal<Noticia[]>(leer<Noticia[]>(localStorage, K_NOTICIAS, []));
  private readonly borradas = signal<string[]>(leer<string[]>(localStorage, K_BORRADAS, []));

  readonly cargando = signal(true);
  readonly error    = signal<string | null>(null);

  /** Catálogo completo: primero las creadas por el usuario, luego las del JSON. */
  readonly lista = computed(() => {
    const borradas = this.borradas();
    return [...this.propias(), ...this.base().filter(n => !borradas.includes(n.id))];
  });

  constructor() {
    this.cargar();
  }

  /** Pide noticias.json con HttpClient y valida los registros. */
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.http.get<unknown>(RUTA_JSON).subscribe({
      next: datos => {
        const validas = Array.isArray(datos) ? datos.filter(esNoticiaValida) : [];
        if (!validas.length) {
          this.error.set('El archivo de noticias no contiene publicaciones válidas.');
        }
        this.base.set(validas);
        this.cargando.set(false);
      },
      error: e => {
        console.warn('No se pudo cargar ' + RUTA_JSON + ' (' + e.message + ').');
        this.error.set('No se pudo cargar el catálogo de noticias.');
        this.cargando.set(false);
      },
    });
  }

  obtener(id: string): Noticia | null {
    return this.lista().find(n => n.id === id) ?? null;
  }

  crear(datos: NuevaNoticia): Noticia {
    const nueva: Noticia = {
      id: 'u' + Date.now(),
      titulo: datos.titulo,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      contenido: datos.contenido,
      imagen: datos.imagen || 'img/card1.jpg',
      fecha: new Date().toISOString().slice(0, 10),
      ubicacion: datos.ubicacion || 'No especificada',
      autor: this.auth.usuario() || 'Usuario',
      destacada: false,
      propia: true,
    };
    const propias = [nueva, ...this.propias()];
    this.propias.set(propias);
    escribir(localStorage, K_NOTICIAS, propias);
    return nueva;
  }

  eliminar(id: string): void {
    const propias = this.propias();
    const restantes = propias.filter(n => n.id !== id);

    if (restantes.length !== propias.length) {
      this.propias.set(restantes);                       // era una noticia creada
      escribir(localStorage, K_NOTICIAS, restantes);
    } else if (!this.borradas().includes(id)) {
      const borradas = [...this.borradas(), id];         // era una noticia base
      this.borradas.set(borradas);
      escribir(localStorage, K_BORRADAS, borradas);
    }
    // No dejar favoritos huérfanos. Se obtiene "perezosamente" para evitar una dependencia circular.
    this.injector.get(FavoritosService).quitar(id);
  }

  restaurar(): void {
    localStorage.removeItem(K_NOTICIAS);
    localStorage.removeItem(K_BORRADAS);
    this.propias.set([]);
    this.borradas.set([]);
  }
}
