import { Injectable, computed, inject, signal } from '@angular/core';
import { K_FAVORITOS, escribir, leer } from '../utils/almacenamiento';
import { NoticiasService } from './noticias.service';

/** Lista de favoritos en localStorage (antes: FavoritosService de app.js). */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly catalogo = inject(NoticiasService);

  private readonly ids = signal<string[]>(leer<string[]>(localStorage, K_FAVORITOS, []));

  /** Cantidad de favoritos (contador del menú). */
  readonly total = computed(() => this.ids().length);

  /** Objetos completos de las noticias favoritas, no solo los ids. */
  readonly noticias = computed(() => {
    const ids = this.ids();
    return this.catalogo.lista().filter(n => ids.includes(n.id));
  });

  es(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Marca o desmarca. Devuelve true si la noticia quedó marcada. */
  alternar(id: string): boolean {
    const quedaMarcada = !this.es(id);
    this.guardar(quedaMarcada ? [...this.ids(), id] : this.ids().filter(f => f !== id));
    return quedaMarcada;
  }

  quitar(id: string): void {
    this.guardar(this.ids().filter(f => f !== id));
  }

  vaciar(): void {
    localStorage.removeItem(K_FAVORITOS);
    this.ids.set([]);
  }

  private guardar(ids: string[]): void {
    this.ids.set(ids);
    escribir(localStorage, K_FAVORITOS, ids);
  }
}
