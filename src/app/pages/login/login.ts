import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Ruta a la que volver tras iniciar sesión (query param ?volver=/admin). */
  readonly volver = input<string>();

  protected readonly fallo = signal(false);
  protected readonly form = this.fb.group({ usuario: '', clave: '' });

  ngOnInit(): void {
    // Si ya hay sesión no tiene sentido mostrar el formulario
    if (this.auth.activa()) this.router.navigateByUrl('/admin');
  }

  protected entrar(): void {
    const { usuario, clave } = this.form.getRawValue();

    if (this.auth.entrar(usuario.trim(), clave)) {
      const destino = this.volver();
      // Solo rutas internas (evita redirigir a sitios externos)
      this.router.navigateByUrl(destino && destino.startsWith('/') ? destino : '/admin');
    } else {
      this.fallo.set(true);
    }
  }
}
