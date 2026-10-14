import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GridNoticias, MensajeVacio } from '../../components/grid-noticias/grid-noticias';
import { NoticiasService } from '../../services/noticias.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, GridNoticias],
  templateUrl: './home.html',
})
export class Home {
  private readonly catalogo = inject(NoticiasService);

  /** Las tres primeras publicaciones del catálogo (antes: vistaHome()). */
  protected readonly destacadas = computed(() => this.catalogo.lista().slice(0, 3));

  protected readonly vacio: MensajeVacio = {
    titulo: 'Todavía no hay noticias publicadas',
    texto: 'Inicia sesión para crear la primera publicación del catálogo.',
    accion: { ruta: '/admin', texto: 'Crear noticia' },
  };
}
