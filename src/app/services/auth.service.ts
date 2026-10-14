import { Injectable, computed, signal } from '@angular/core';
import { K_SESION, escribir, leer } from '../utils/almacenamiento';

interface Sesion { usuario: string; desde: number; }

/** Sesión del usuario guardada en sessionStorage (antes: AuthService de app.js). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Credenciales de demostración para la maqueta
  private readonly credenciales = { usuario: 'editor', clave: 'cronica2026' };

  private readonly sesion = signal<Sesion | null>(leer<Sesion | null>(sessionStorage, K_SESION, null));

  readonly activa  = computed(() => this.sesion() !== null);
  readonly usuario = computed(() => this.sesion()?.usuario ?? null);

  entrar(usuario: string, clave: string): boolean {
    if (usuario === this.credenciales.usuario && clave === this.credenciales.clave) {
      const sesion = { usuario, desde: Date.now() };
      escribir(sessionStorage, K_SESION, sesion);
      this.sesion.set(sesion);
      return true;
    }
    return false;
  }

  salir(): void {
    sessionStorage.removeItem(K_SESION);
    this.sesion.set(null);
  }
}
