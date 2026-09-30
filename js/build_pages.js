const fs = require('fs');

const topbar = `<div class="topbar">
  <div class="wrap">
    <span class="date">Martes, 15 de septiembre de 2026 · Bogotá, Colombia</span>
    <span class="topbar-links"><a href="login.html">Iniciar sesión</a></span>
  </div>
</div>`;

const masthead = `<header class="masthead">
  <div class="wrap">
    <div class="brand"><small>PLATAFORMA WEB DE EXPERIENCIAS</small>Crónica</div>
    <div class="masthead-tag">"Historias que se viven, no solo se leen"</div>
  </div>
</header>`;

function nav(active) {
  const items = [
    ['index.html', 'Inicio', 'home'],
    ['listado.html', 'Explorar noticias', 'listado'],
    ['favoritos.html', 'Favoritos <span class="fav-count">0</span>', 'favoritos'],
    ['contacto.html', 'Contacto', 'contacto'],
    ['admin.html', 'Administrar', 'admin']
  ];
  return `<nav class="nav">
  <div class="wrap">
    <ul>
${items.map(([href, label, key]) =>
  `      <li${key === 'admin' ? ' data-solo-sesion' : ''}><a href="${href}"${key === active ? ' class="active"' : ''}>${label}</a></li>`
).join('\n')}
    </ul>
  </div>
</nav>`;
}

const footer = `<footer class="footer">
  <div class="wrap">
    <div>
      <h4>Crónica</h4>
      <p>Plataforma web para explorar noticias y experiencias educativas, tecnológicas, turísticas y comerciales, con guardado de favoritos y contacto directo.</p>
    </div>
    <div>
      <h4>Navegación</h4>
      <ul>
        <li><a href="index.html">Inicio</a></li>
        <li><a href="listado.html">Explorar noticias</a></li>
        <li><a href="favoritos.html">Favoritos</a></li>
        <li><a href="contacto.html">Contacto</a></li>
      </ul>
    </div>
    <div>
      <h4>Categorías</h4>
      <ul>
        <li><a href="listado.html">Educativas</a></li>
        <li><a href="listado.html">Tecnológicas</a></li>
        <li><a href="listado.html">Turísticas</a></li>
        <li><a href="listado.html">Comerciales</a></li>
      </ul>
    </div>
    <div>
      <h4>Contacto</h4>
      <p>Calle 45 # 12-30, Bogotá<br>contacto@cronica.co<br>+57 601 555 0199</p>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© 2026 Crónica. Proyecto académico — Plataforma Web de Noticias.</span>
    <span>Hecho con HTML, CSS, JavaScript y Angular</span>
  </div>
</footer>`;

function page(opts) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body data-page="${opts.page}">

${topbar}

${masthead}

${nav(opts.page)}

${opts.body}

${footer}

<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>
`;
}

/* ---------------- HOME ---------------- */
fs.writeFileSync('index.html', page({
  title: 'Crónica — Noticias y experiencias',
  page: 'home',
  body: `<section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <div class="hero-eyebrow">EDICIÓN DESTACADA</div>
      <h1>Explora noticias y <em>experiencias</em> que valen la pena vivir</h1>
      <p>Un solo lugar para descubrir contenido educativo, tecnológico, turístico y comercial — explora el detalle de cada historia y guarda tus favoritas para volver a ellas cuando quieras.</p>
      <div class="hero-actions">
        <a href="listado.html" class="btn btn-primary">Ver noticias</a>
        <a href="contacto.html" class="btn btn-outline">Contáctanos</a>
      </div>
    </div>
    <div class="hero-media">
      <span class="tag">TECNOLOGÍA</span>
      <img src="img/hero.jpg" alt="Experiencia destacada">
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <h2>Noticias destacadas</h2>
      <a href="listado.html" class="see-all">Ver todas →</a>
    </div>
    <div class="grid" id="grid-destacadas"></div>
  </div>
</section>

<section class="cta-band">
  <div class="wrap">
    <h2>¿Tienes una noticia o experiencia para compartir?</h2>
    <p>Publica tu contenido, gestiona tus historias y llega a miles de lectores interesados.</p>
    <div class="hero-actions">
      <a href="listado.html" class="btn btn-primary">Explorar catálogo</a>
      <a href="contacto.html" class="btn btn-outline">Escríbenos</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>Lo que dicen nuestros lectores</h2></div>
    <div class="testimonials">
      <div class="testi">
        <p>Encontré una experiencia turística que no aparecía en ningún otro lado. La ficha de detalle tenía todo lo que necesitaba.</p>
        <div class="who">Laura M. — Lectora frecuente</div>
      </div>
      <div class="testi">
        <p>Uso la sección de favoritos para guardar noticias tecnológicas y revisarlas después del trabajo, sin perder nada.</p>
        <div class="who">Andrés R. — Estudiante de ingeniería</div>
      </div>
      <div class="testi">
        <p>El formulario de contacto es simple y directo. Recibí respuesta el mismo día sobre una experiencia comercial.</p>
        <div class="who">Camila S. — Emprendedora</div>
      </div>
    </div>
  </div>
</section>`
}));

/* ---------------- LISTADO ---------------- */
fs.writeFileSync('listado.html', page({
  title: 'Explorar noticias — Crónica',
  page: 'listado',
  body: `<div class="wrap listado-head">
  <h1>Explorar noticias y experiencias</h1>
  <p>Filtra por categoría o busca por palabra clave para encontrar la noticia o experiencia que más te interese.</p>

  <div class="search-row">
    <input type="text" id="buscar" placeholder="Buscar por título, descripción o lugar…">
    <a href="admin.html" class="btn btn-outline" data-solo-sesion style="display:none">+ Nueva noticia</a>
  </div>

  <div class="filters" id="filtros"></div>
</div>

<div class="wrap">
  <p class="results-note" id="resultados"></p>
  <div class="grid" id="grid-listado"></div>
  <div style="height:56px"></div>
</div>`
}));

/* ---------------- DETALLE ---------------- */
fs.writeFileSync('detalle.html', page({
  title: 'Detalle — Crónica',
  page: 'detalle',
  body: `<div class="wrap" id="detalle"></div>`
}));

/* ---------------- FAVORITOS ---------------- */
fs.writeFileSync('favoritos.html', page({
  title: 'Mis favoritos — Crónica',
  page: 'favoritos',
  body: `<div class="wrap listado-head">
  <h1>Mis favoritos</h1>
  <p>Esta lista se guarda en tu navegador con localStorage, así que se conserva aunque cierres la pestaña o apagues el equipo.</p>
  <div class="fav-bar">
    <span class="results-note" id="fav-resumen"></span>
    <button class="btn btn-outline" id="vaciar-favoritos">Vaciar lista</button>
  </div>
</div>

<div class="wrap">
  <div class="grid" id="grid-favoritos"></div>
  <div style="height:56px"></div>
</div>`
}));

/* ---------------- LOGIN ---------------- */
fs.writeFileSync('login.html', page({
  title: 'Iniciar sesión — Crónica',
  page: 'login',
  body: `<div class="wrap auth-wrap">
  <div class="form-card">
    <h2>Iniciar sesión</h2>
    <p class="sub">Accede para crear y eliminar publicaciones del catálogo.</p>

    <div class="confirm-box" id="aviso-login" style="display:none"></div>

    <form id="form-login" novalidate>
      <div class="field">
        <label for="usuario">Usuario <span class="req">*</span></label>
        <input type="text" id="usuario" name="usuario" placeholder="editor" autocomplete="username">
      </div>
      <div class="field">
        <label for="clave">Contraseña <span class="req">*</span></label>
        <input type="password" id="clave" name="clave" placeholder="••••••••" autocomplete="current-password">
      </div>
      <button type="submit" class="btn btn-primary">Entrar</button>
    </form>

    <div class="demo-note">
      <strong>Credenciales de demostración</strong>
      <span>Usuario: <code>editor</code> · Contraseña: <code>cronica2026</code></span>
      <span>La sesión se guarda con sessionStorage y se cierra al salir del navegador.</span>
    </div>
  </div>
</div>`
}));

/* ---------------- ADMIN ---------------- */
fs.writeFileSync('admin.html', page({
  title: 'Administrar noticias — Crónica',
  page: 'admin',
  body: `<div class="wrap listado-head">
  <h1>Administrar noticias</h1>
  <p>Crea nuevas publicaciones o elimina las existentes. Los cambios se guardan en tu navegador con localStorage.</p>
</div>

<div class="wrap admin-wrap">
  <div class="form-card">
    <h2>Crear publicación</h2>
    <p class="sub">Los campos marcados con <span class="req">*</span> son obligatorios.</p>

    <div class="confirm-box" id="aviso-admin" style="display:none"></div>

    <form id="form-noticia" novalidate>
      <div class="field">
        <label for="titulo">Título <span class="req">*</span></label>
        <input type="text" id="titulo" name="titulo" placeholder="Titular de la publicación">
      </div>
      <div class="row-2">
        <div class="field">
          <label for="categoria">Categoría <span class="req">*</span></label>
          <select id="categoria" name="categoria">
            <option>Educativa</option>
            <option>Tecnológica</option>
            <option>Turística</option>
            <option>Comercial</option>
          </select>
        </div>
        <div class="field">
          <label for="ubicacion">Ubicación</label>
          <input type="text" id="ubicacion" name="ubicacion" placeholder="Ciudad, país">
        </div>
      </div>
      <div class="field">
        <label for="imagen">Imagen</label>
        <select id="imagen" name="imagen">
          <option value="img/card1.jpg">Educativa — apuntes</option>
          <option value="img/card2.jpg">Tecnológica — circuito</option>
          <option value="img/card3.jpg">Turística — paisaje</option>
          <option value="img/card4.jpg">Comercial — mercado</option>
        </select>
      </div>
      <div class="field">
        <label for="descripcion">Descripción breve <span class="req">*</span></label>
        <textarea id="descripcion" name="descripcion" placeholder="Resumen que aparece en la tarjeta (mínimo 20 caracteres)"></textarea>
      </div>
      <div class="field">
        <label for="contenido">Contenido completo <span class="req">*</span></label>
        <textarea id="contenido" name="contenido" style="min-height:150px" placeholder="Texto que aparece en la vista de detalle"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Publicar noticia</button>
    </form>
  </div>

  <div class="admin-side">
    <div class="side-box">
      <h4>Catálogo actual</h4>
      <p>Elimina cualquier publicación, propia o del catálogo base.</p>
      <table class="admin-table" id="tabla-noticias"></table>
      <button class="btn btn-outline" id="restaurar" style="margin-top:20px">Restaurar catálogo original</button>
    </div>
  </div>
</div>
<div style="height:40px"></div>`
}));

/* ---------------- CONTACTO ---------------- */
fs.writeFileSync('contacto.html', page({
  title: 'Contacto — Crónica',
  page: 'contacto',
  body: `<div class="wrap contact-wrap">
  <div class="contact-info">
    <h1>Hablemos</h1>
    <p>¿Tienes dudas sobre una noticia, quieres reportar un dato o proponer una experiencia? Escríbenos y te responderemos en menos de 48 horas.</p>

    <div class="info-row">
      <div class="ico">✉</div>
      <div><h4>Correo electrónico</h4><span>contacto@cronica.co</span></div>
    </div>
    <div class="info-row">
      <div class="ico">☎</div>
      <div><h4>Teléfono</h4><span>+57 601 555 0199</span></div>
    </div>
    <div class="info-row">
      <div class="ico">⚑</div>
      <div><h4>Oficina principal</h4><span>Calle 45 # 12-30, Bogotá, Colombia</span></div>
    </div>

    <div class="map-box">Mapa de ubicación</div>
  </div>

  <div class="form-card">
    <h2>Formulario de contacto</h2>
    <p class="sub">Los campos marcados con <span class="req">*</span> son obligatorios.</p>

    <div class="confirm-box" id="confirmacion" style="display:none">
      <div class="ico">✓</div>
      <div>
        <h4>Mensaje enviado con éxito</h4>
        <p>Gracias por escribirnos. Te contactaremos al correo registrado en un plazo máximo de 48 horas.</p>
      </div>
    </div>

    <form id="form-contacto" novalidate>
      <div class="row-2">
        <div class="field">
          <label for="nombre">Nombre completo <span class="req">*</span></label>
          <input type="text" id="nombre" name="nombre" placeholder="Escribe tu nombre">
          <span class="error-msg"></span>
        </div>
        <div class="field">
          <label for="correo">Correo electrónico <span class="req">*</span></label>
          <input type="email" id="correo" name="correo" placeholder="tucorreo@ejemplo.com">
          <span class="error-msg"></span>
        </div>
      </div>

      <div class="field">
        <label for="asunto">Asunto <span class="req">*</span></label>
        <select id="asunto" name="asunto">
          <option>Consulta general</option>
          <option>Reportar una noticia</option>
          <option>Proponer una experiencia</option>
          <option>Soporte técnico</option>
        </select>
      </div>

      <div class="field">
        <label for="mensaje">Mensaje <span class="req">*</span></label>
        <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos en qué podemos ayudarte…"></textarea>
        <span class="hint">Mínimo 20 caracteres.</span>
        <span class="error-msg"></span>
      </div>

      <button type="submit" class="btn btn-primary">Enviar mensaje</button>
    </form>
  </div>
</div>`
}));

console.log('Páginas generadas');
