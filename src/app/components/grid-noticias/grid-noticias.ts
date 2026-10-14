import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Noticia } from '../../models/noticia';
import { NoticiasService } from '../../services/noticias.service';
import { Tarjeta } from '../tarjeta/tarjeta';

export interface MensajeVacio {
  titulo: string;
  texto: string;
  accion?: { ruta: string; texto: string };
}

/** Cuadrícula de tarjetas con estados de carga, error y vacío (antes: pintarGrid() + mostrarCargando()). */
@Component({
  selector: 'app-grid-noticias',
  imports: [Tarjeta, RouterLink],
  templateUrl: './grid-noticias.html',
})
export class GridNoticias {
  readonly noticias = input.required<Noticia[]>();
  readonly vacio = input.required<MensajeVacio>();
  protected readonly catalogo = inject(NoticiasService);
}
