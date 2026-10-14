import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GridNoticias, MensajeVacio } from '../../components/grid-noticias/grid-noticias';
import { FILTROS } from '../../models/noticia';
import { AuthService } from '../../services/auth.service';
import { NoticiasService } from '../../services/noticias.service';

@Component({
  selector: 'app-listado',
  imports: [RouterLink, GridNoticias],
  templateUrl: './listado.html',
})
export class Listado {
  private readonly catalogo = inject(NoticiasService);
  protected readonly auth = inject(AuthService);

  // Estado de los filtros (antes: variables `categoria` y `termino` dentro de vistaListado())
  protected readonly categoria = signal('Todas');
  protected readonly termino = signal('');

  protected readonly total = computed(() => this.catalogo.lista().length);

  /** Noticias que cumplen la categoría elegida y el término de búsqueda. */
  protected readonly filtradas = computed(() => {
    let lista = this.catalogo.lista();
    const categoria = this.categoria();
    const t = this.termino().toLowerCase();

    if (categoria !== 'Todas') lista = lista.filter(n => n.categoria === categoria);
    if (t) {
      lista = lista.filter(n =>
        n.titulo.toLowerCase().includes(t) ||
        n.descripcion.toLowerCase().includes(t) ||
        n.ubicacion.toLowerCase().includes(t));
    }
    return lista;
  });

  /** Chips de filtro con su contador: "Redes (2)". */
  protected readonly chips = computed(() => {
    const todas = this.catalogo.lista();
    return FILTROS.map(nombre => ({
      nombre,
      cantidad: nombre === 'Todas' ? todas.length : todas.filter(n => n.categoria === nombre).length,
    }));
  });

  protected readonly resumen = computed(() => {
    const mostradas = this.filtradas().length;
    const total = this.total();
    return mostradas === total
      ? `Mostrando ${total} publicaciones`
      : `Mostrando ${mostradas} de ${total} publicaciones`;
  });

  protected readonly vacio: MensajeVacio = {
    titulo: 'Sin resultados',
    texto: 'No encontramos publicaciones que coincidan con los filtros aplicados. Prueba con otra categoría o borra el término de búsqueda.',
  };
}
