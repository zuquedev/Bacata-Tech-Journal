import { Component, inject, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Noticia } from '../../models/noticia';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { FavoritosService } from '../../services/favoritos.service';

/** Tarjeta de una noticia (antes: plantillaTarjeta() de app.js). */
@Component({
  selector: 'app-tarjeta',
  imports: [RouterLink, UpperCasePipe, TiempoRelativoPipe],
  templateUrl: './tarjeta.html',
  styles: ':host { display: contents; }',
})
export class Tarjeta {
  readonly noticia = input.required<Noticia>();
  protected readonly favoritos = inject(FavoritosService);

  protected alternar(evento: Event): void {
    evento.preventDefault();
    this.favoritos.alternar(this.noticia().id);
  }
}
