import { Component, computed, inject } from '@angular/core';
import { GridNoticias, MensajeVacio } from '../../components/grid-noticias/grid-noticias';
import { FavoritosService } from '../../services/favoritos.service';

@Component({
  selector: 'app-favoritos',
  imports: [GridNoticias],
  templateUrl: './favoritos.html',
})
export class Favoritos {
  protected readonly favoritos = inject(FavoritosService);

  protected readonly resumen = computed(() => {
    const n = this.favoritos.noticias().length;
    if (!n) return 'Tu lista está vacía';
    return n + (n === 1 ? ' publicación guardada' : ' publicaciones guardadas');
  });

  protected readonly vacio: MensajeVacio = {
    titulo: 'Aún no has guardado publicaciones',
    texto: 'Pulsa el corazón en cualquier tarjeta o en la vista de detalle para agregarla a esta lista. Se conserva en tu navegador aunque cierres la pestaña.',
    accion: { ruta: '/listado', texto: 'Explorar noticias' },
  };

  protected vaciar(): void {
    if (confirm('¿Vaciar toda tu lista de favoritos?')) this.favoritos.vaciar();
  }
}
