# Bacatá Tech — Angular

Migración de la plataforma de noticias (HTML + CSS + JavaScript) a **Angular**: componentes, servicios inyectables con `HttpClient`, rutas con *lazy loading*, guard de autenticación, Reactive Forms y *signals*.

## Ejecutar

```bash
npm install
ng serve          # http://localhost:4200
ng test           # pruebas (Vitest)
ng build          # genera dist/ para desplegar
```

## Credenciales de demostración

    Usuario: editor    Contraseña: cronica2026

## Equivalencias con la versión anterior del proyecto

| Antes | Ahora |
|---|---|
| 7 archivos `.html` | 7 componentes en `src/app/pages/` + rutas en `app.routes.ts` |
| Menú, barra superior y pie copiados en cada HTML | `Header` y `Footer` (se escriben una sola vez) |
| `plantillaTarjeta()` + `pintarGrid()` | `Tarjeta` y `GridNoticias` |
| `NoticiasService`, `FavoritosService`, `AuthService` (objetos globales) | Servicios `@Injectable` en `src/app/services/` |
| `cargarNoticiasBase()` con `fetch()` | `NoticiasService.cargar()` con `HttpClient` |
| `AuthService.exigir()` | `authGuard` (`canActivate`) en la ruta `/admin` |
| `detalle.html?id=n03` | `/noticia/n03` (el id llega como `input()`) |
| `data-page` + `switch` en `iniciarApp()` | El router decide qué componente mostrar |
| `innerHTML` + `escapar()` | Plantillas de Angular (escapan el texto automáticamente) |
| `fecha.js` | `utils/fecha.ts` usado por `Header` |
| `tiempoRelativo()` | `TiempoRelativoPipe` |
| `tests/test.js` (jsdom) | `*.spec.ts` (21 pruebas) |
| `js/data.js` + `tools/sync-datos.js` | Ya no hacen falta (ver nota) |


## Almacenamiento en el navegador

| Clave | Almacén | Contenido |
|---|---|---|
| `cronica_favoritos` | localStorage | Ids de favoritos |
| `cronica_noticias` | localStorage | Noticias creadas |
| `cronica_borradas` | localStorage | Ids de noticias base eliminadas |
| `cronica_sesion` | sessionStorage | Usuario autenticado |
