import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { FavoritosService } from '../../services/favoritos.service';
import { AuthService } from '../../services/auth.service';
import { NoticiasService } from '../../services/noticias.service';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './detalle.html',
})
export class Detalle {
  /** Llega desde la URL /noticia/:id gracias a withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly catalogo = inject(NoticiasService);
  protected readonly favoritos = inject(FavoritosService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly titulo = inject(Title);

  protected readonly noticia = computed(() => this.catalogo.obtener(this.id()));

  /** Texto dividido en párrafos (se ignoran las líneas vacías). */
  protected readonly parrafos = computed(() =>
    (this.noticia()?.contenido ?? '').split('\n').filter(p => p.trim() !== ''));

  /** Hasta dos publicaciones de la misma categoría. */
  protected readonly relacionadas = computed(() => {
    const n = this.noticia();
    if (!n) return [];
    return this.catalogo.lista().filter(x => x.categoria === n.categoria && x.id !== n.id).slice(0, 2);
  });

  constructor() {
    // El título de la pestaña cambia según la noticia abierta
    effect(() => {
      const n = this.noticia();
      if (n) this.titulo.setTitle(n.titulo + ' — Bacatá Tech');
    });
  }

  protected eliminar(): void {
    const n = this.noticia();
    if (n && confirm('¿Eliminar "' + n.titulo + '" del catálogo?')) {
      this.catalogo.eliminar(n.id);
      this.router.navigateByUrl('/listado');
    }
  }
}
