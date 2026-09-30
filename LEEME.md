# Crónica — Maqueta funcional

Plataforma web de noticias y experiencias. Primera entrega: maquetación
con las funcionalidades interactivas ya operativas en JavaScript.

## Cómo ejecutarla

Abre `index.html` directamente en el navegador (doble clic). No requiere
servidor ni instalación.

## Credenciales de demostración

    Usuario:    editor
    Contraseña: cronica2026

La sesión se guarda en **sessionStorage**, por lo que se cierra al salir
del navegador. Sin sesión, las opciones de administración no aparecen en
el menú y `admin.html` redirige a `login.html`.

## Páginas

| Archivo          | Contenido                                                  |
|------------------|------------------------------------------------------------|
| `index.html`     | Home: bienvenida, destacadas dinámicas, CTA, testimonios    |
| `listado.html`   | Catálogo con búsqueda y filtros por categoría               |
| `detalle.html`   | Vista de detalle, se abre con `detalle.html?id=n03`         |
| `favoritos.html` | Lista personalizada leída desde localStorage                |
| `contacto.html`  | Formulario con validaciones y mensaje de confirmación       |
| `login.html`     | Inicio de sesión (sessionStorage)                           |
| `admin.html`     | Mini CRUD: crear y eliminar noticias (requiere sesión)      |

## Archivos

| Archivo         | Función                                                     |
|-----------------|-------------------------------------------------------------|
| `data.js`       | Catálogo base de 9 noticias                                 |
| `noticias.json` | El mismo catálogo en JSON, para la fase de Angular          |
| `app.js`        | Servicios, renderizado y vistas                             |
| `styles.css`    | Sistema de diseño completo                                  |
| `build_pages.js`| Genera las 7 páginas con header y footer compartidos        |
| `test.js`       | 41 pruebas automatizadas (`npm install jsdom && node test.js`) |

## Almacenamiento usado

| Clave               | Almacén        | Contenido                          |
|---------------------|----------------|------------------------------------|
| `cronica_favoritos` | localStorage   | Ids de las noticias guardadas      |
| `cronica_noticias`  | localStorage   | Noticias creadas desde el CRUD     |
| `cronica_borradas`  | localStorage   | Ids de noticias base eliminadas    |
| `cronica_sesion`    | sessionStorage | Usuario autenticado                |

## Paso a Angular

`app.js` está organizado en tres servicios (`NoticiasService`,
`FavoritosService`, `AuthService`) que se trasladan a servicios inyectables,
y las funciones `vistaX()` corresponden a los componentes. `NOTICIAS_BASE`
se reemplaza por una petición HttpClient a `noticias.json`.
