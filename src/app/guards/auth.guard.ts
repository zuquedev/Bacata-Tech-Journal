import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protege /admin: sin sesión redirige a /login?volver=/admin (antes: AuthService.exigir()). */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.activa() ? true : router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
};
