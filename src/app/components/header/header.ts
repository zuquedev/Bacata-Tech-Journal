import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoritosService } from '../../services/favoritos.service';
import { fechaEdicion } from '../../utils/fecha';

/** Barra superior + cabecera + menú (se repetía en las 7 páginas HTML). */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  // display: contents → el componente no añade una caja extra y el menú sticky (si lo hay) sigue funcionando
  styles: ':host { display: contents; }',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly favoritos = inject(FavoritosService);
  private readonly router = inject(Router);

  protected readonly fecha = fechaEdicion();

  protected salir(evento: Event): void {
    evento.preventDefault();
    this.auth.salir();
    this.router.navigateByUrl('/');
  }
}
