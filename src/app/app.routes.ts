import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Rutas de la aplicación. Cada página se carga bajo demanda (lazy loading).
 *   antes: index.html / listado.html / detalle.html?id=n03 / favoritos.html / ...
 *   ahora: /               /listado       /noticia/n03        /favoritos
 */
const SUFIJO = ' — Bacatá Tech';

export const routes: Routes = [
  { path: '', title: 'Bacatá Tech — Noticias de tecnología', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'listado', title: 'Explorar noticias' + SUFIJO, loadComponent: () => import('./pages/listado/listado').then(m => m.Listado) },
  { path: 'noticia/:id', title: 'Detalle' + SUFIJO, loadComponent: () => import('./pages/detalle/detalle').then(m => m.Detalle) },
  { path: 'favoritos', title: 'Mis favoritos' + SUFIJO, loadComponent: () => import('./pages/favoritos/favoritos').then(m => m.Favoritos) },
  { path: 'contacto', title: 'Contacto' + SUFIJO, loadComponent: () => import('./pages/contacto/contacto').then(m => m.Contacto) },
  { path: 'login', title: 'Iniciar sesión' + SUFIJO, loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  {
    path: 'admin',
    title: 'Administrar noticias' + SUFIJO,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
  },
  { path: '**', redirectTo: '' },
];
