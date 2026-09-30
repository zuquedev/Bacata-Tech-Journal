/* ============================================================
   Crónica — Lógica de la aplicación
   ------------------------------------------------------------
   Capas:
   0. Datos           → noticias.json, solicitado con fetch() al iniciar
                        (data.js queda como respaldo si la petición falla)
   1. Almacenamiento  → localStorage (noticias creadas, favoritos)
                        sessionStorage (sesión del usuario)
   2. Servicios       → NoticiasService, FavoritosService, AuthService
   3. Renderizado     → funciones que pintan el DOM dinámicamente
   4. Arranque        → carga el JSON y luego decide qué pintar según
                        el data-page del <body>
   ============================================================ */

/* ---------- 0. Fuente de datos: noticias.json ---------- */

// Ruta del archivo JSON con el catálogo base.
// Si el proyecto se reorganiza (por ejemplo a 'data/noticias.json'), solo se cambia esta línea.
const RUTA_JSON = 'data/noticias.json';

// Catálogo base en memoria. Empieza vacío y se llena cuando termina la carga del JSON.
let NOTICIAS_BASE = [];

// Registra de dónde salieron los datos: 'json' (fetch) o 'respaldo' (data.js).
let ORIGEN_DATOS = 'ninguno';

// Campos de texto que toda noticia debe traer para que las vistas no fallen.
const CAMPOS_NOTICIA = ['id', 'titulo', 'categoria', 'descripcion', 'contenido', 'imagen', 'fecha', 'ubicacion'];

// Devuelve true si el registro es un objeto con todos los campos de texto obligatorios.
function esNoticiaValida(n) {
  return !!n && typeof n === 'object' &&
    CAMPOS_NOTICIA.every(campo => typeof n[campo] === 'string' && n[campo].trim() !== '');
}

// Solicita noticias.json y llena NOTICIAS_BASE.
// Si algo sale mal (sin servidor, archivo ausente, JSON dañado), usa NOTICIAS_RESPALDO de data.js.
async function cargarNoticiasBase() {
  try {
    const respuesta = await fetch(RUTA_JSON);                        // petición HTTP al archivo JSON
    if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);  // 404, 500, etc.

    const datos = await respuesta.json();                            // convierte el texto en objetos JS
    if (!Array.isArray(datos)) throw new Error('El JSON no contiene un arreglo de noticias');

    const validas = datos.filter(esNoticiaValida);                   // descarta registros incompletos
    if (!validas.length) throw new Error('El JSON no contiene noticias válidas');

    NOTICIAS_BASE = validas;                                         // el catálogo ahora viene del JSON
    ORIGEN_DATOS = 'json';
  } catch (e) {
    console.warn('No se pudo cargar ' + RUTA_JSON + ' (' + e.message + '). Se usa el catálogo de respaldo.');
    NOTICIAS_BASE = NOTICIAS_RESPALDO;                               // plan B: arreglo de data.js
    ORIGEN_DATOS = 'respaldo';
  }
}

// Páginas que necesitan el catálogo (las demás no piden el JSON).
const PAGINAS_CON_DATOS = ['home', 'listado', 'detalle', 'favoritos', 'admin'];

// Muestra un aviso de carga en las zonas donde luego se pintarán las noticias.
function mostrarCargando() {
  document.querySelectorAll('.grid').forEach(g => {
    g.innerHTML = '<p class="results-note" style="grid-column:1/-1">Cargando noticias…</p>';
  });
  const detalle = document.querySelector('#detalle');
  if (detalle) detalle.innerHTML = '<p class="results-note">Cargando publicación…</p>';
}

/* ---------- 1. Claves de almacenamiento ---------- */
const K_NOTICIAS  = 'cronica_noticias';   // localStorage  — noticias creadas por el usuario
const K_BORRADAS  = 'cronica_borradas';   // localStorage  — ids de noticias base eliminadas
const K_FAVORITOS = 'cronica_favoritos';  // localStorage  — ids marcados como favoritos
const K_SESION    = 'cronica_sesion';     // sessionStorage — usuario autenticado

function leer(almacen, clave, porDefecto) {
  try {
    const valor = almacen.getItem(clave);
    return valor ? JSON.parse(valor) : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

function escribir(almacen, clave, valor) {
  try { almacen.setItem(clave, JSON.stringify(valor)); }
  catch (e) { console.warn('No se pudo guardar en el almacenamiento:', e); }
}

/* ---------- 2a. NoticiasService ---------- */
const NoticiasService = {

  // Catálogo completo = base (menos las borradas) + las creadas por el usuario
  listar() {
    const borradas = leer(localStorage, K_BORRADAS, []);
    const propias  = leer(localStorage, K_NOTICIAS, []);
    const base = NOTICIAS_BASE.filter(n => borradas.indexOf(n.id) === -1);
    return propias.concat(base);
  },

  obtener(id) {
    return this.listar().filter(n => n.id === id)[0] || null;
  },

  crear(datos) {
    const propias = leer(localStorage, K_NOTICIAS, []);
    const nueva = {
      id: 'u' + Date.now(),
      titulo: datos.titulo,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      contenido: datos.contenido,
      imagen: datos.imagen || 'img/card1.jpg',
      fecha: new Date().toISOString().slice(0, 10),
      ubicacion: datos.ubicacion || 'No especificada',
      autor: AuthService.usuario() || 'Usuario',
      destacada: false,
      propia: true
    };
    propias.unshift(nueva);
    escribir(localStorage, K_NOTICIAS, propias);
    return nueva;
  },

  eliminar(id) {
    const propias = leer(localStorage, K_NOTICIAS, []);
    const restantes = propias.filter(n => n.id !== id);

    if (restantes.length !== propias.length) {
      escribir(localStorage, K_NOTICIAS, restantes);   // era una noticia creada
    } else {
      const borradas = leer(localStorage, K_BORRADAS, []);
      if (borradas.indexOf(id) === -1) borradas.push(id);
      escribir(localStorage, K_BORRADAS, borradas);    // era una noticia base
    }
    FavoritosService.quitar(id); // no dejar favoritos huérfanos
  },

  esPropia(id) {
    return leer(localStorage, K_NOTICIAS, []).some(n => n.id === id);
  },

  restaurar() {
    localStorage.removeItem(K_NOTICIAS);
    localStorage.removeItem(K_BORRADAS);
  }
};

/* ---------- 2b. FavoritosService ---------- */
const FavoritosService = {
  listar()      { return leer(localStorage, K_FAVORITOS, []); },
  es(id)        { return this.listar().indexOf(id) !== -1; },
  total()       { return this.listar().length; },

  alternar(id) {
    const favs = this.listar();
    const i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    escribir(localStorage, K_FAVORITOS, favs);
    actualizarContador();
    return i === -1; // true si quedó marcado
  },

  quitar(id) {
    const favs = this.listar().filter(f => f !== id);
    escribir(localStorage, K_FAVORITOS, favs);
    actualizarContador();
  },

  vaciar() {
    localStorage.removeItem(K_FAVORITOS);
    actualizarContador();
  },

  // Devuelve los objetos completos, no solo los ids
  noticias() {
    const favs = this.listar();
    return NoticiasService.listar().filter(n => favs.indexOf(n.id) !== -1);
  }
};

/* ---------- 2c. AuthService (sessionStorage) ---------- */
const AuthService = {
  // Credenciales de demostración para la maqueta
  CREDENCIALES: { usuario: 'editor', clave: 'cronica2026' },

  entrar(usuario, clave) {
    if (usuario === this.CREDENCIALES.usuario && clave === this.CREDENCIALES.clave) {
      escribir(sessionStorage, K_SESION, { usuario: usuario, desde: Date.now() });
      return true;
    }
    return false;
  },

  salir()      { sessionStorage.removeItem(K_SESION); },
  activa()     { return leer(sessionStorage, K_SESION, null) !== null; },
  usuario()    { const s = leer(sessionStorage, K_SESION, null); return s ? s.usuario : null; },

  // Protege las páginas de administración
  exigir() {
    if (!this.activa()) {
      window.location.href = 'login.html?volver=' +
        encodeURIComponent(window.location.pathname.split('/').pop());
      return false;
    }
    return true;
  }
};

/* ---------- 3. Utilidades de presentación ---------- */
function escapar(texto) {
  const d = document.createElement('div');
  d.textContent = texto == null ? '' : String(texto);
  return d.innerHTML;
}

function tiempoRelativo(fechaISO) {
  const dias = Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
  if (dias <= 0) return 'Hoy';
  if (dias === 1) return 'Hace 1 día';
  return 'Hace ' + dias + ' días';
}

function actualizarContador() {
  const total = FavoritosService.total();
  document.querySelectorAll('.fav-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? '' : 'none';
  });
}

/* Pinta el estado de sesión en el menú superior */
function pintarSesion() {
  const zona = document.querySelector('.topbar-links');
  if (!zona) return;

  if (AuthService.activa()) {
    zona.innerHTML =
      '<span>Sesión: <strong>' + escapar(AuthService.usuario()) + '</strong></span>' +
      '<a href="admin.html">Administrar</a>' +
      '<a href="#" id="salir">Cerrar sesión</a>';
    const salir = document.getElementById('salir');
    if (salir) salir.addEventListener('click', function (e) {
      e.preventDefault();
      AuthService.salir();
      window.location.href = 'index.html';
    });
  } else {
    zona.innerHTML = '<a href="login.html">Iniciar sesión</a><a href="login.html">Crear cuenta</a>';
  }

  // El enlace "Administrar" del menú solo aparece con sesión activa
  document.querySelectorAll('[data-solo-sesion]').forEach(el => {
    el.style.display = AuthService.activa() ? '' : 'none';
  });
}

/* ---------- 4. Componente tarjeta ---------- */
function plantillaTarjeta(n) {
  const esFav = FavoritosService.es(n.id);
  return '' +
    '<article class="card" data-id="' + n.id + '">' +
      '<div class="card-media">' +
        '<span class="card-cat">' + escapar(n.categoria.toUpperCase()) + '</span>' +
        (n.propia ? '<span class="card-own">Tuya</span>' : '') +
        '<button class="fav-btn' + (esFav ? ' is-fav' : '') + '" ' +
          'aria-pressed="' + esFav + '" title="Guardar en favoritos">' +
          (esFav ? '♥' : '♡') +
        '</button>' +
        '<img src="' + escapar(n.imagen) + '" alt="' + escapar(n.titulo) + '">' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + escapar(n.titulo) + '</h3>' +
        '<p>' + escapar(n.descripcion) + '</p>' +
        '<div class="card-foot">' +
          '<a href="detalle.html?id=' + n.id + '" class="card-link">Ver más</a>' +
          '<span class="card-meta">' + tiempoRelativo(n.fecha) + '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
}

/* Pinta una lista de noticias dentro de un contenedor .grid */
function pintarGrid(contenedor, noticias, mensajeVacio) {
  if (!contenedor) return;

  if (!noticias.length) {
    contenedor.innerHTML =
      '<div class="empty">' +
        '<h3>' + escapar(mensajeVacio.titulo) + '</h3>' +
        '<p>' + escapar(mensajeVacio.texto) + '</p>' +
        (mensajeVacio.accion
          ? '<a href="' + mensajeVacio.accion.url + '" class="btn btn-primary">' +
              escapar(mensajeVacio.accion.texto) + '</a>'
          : '') +
      '</div>';
    return;
  }

  contenedor.innerHTML = noticias.map(plantillaTarjeta).join('');
  contenedor.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const id = btn.closest('[data-id]').dataset.id;
      const quedo = FavoritosService.alternar(id);
      btn.classList.toggle('is-fav', quedo);
      btn.textContent = quedo ? '♥' : '♡';
      btn.setAttribute('aria-pressed', quedo);

      // En la vista de favoritos, quitar también retira la tarjeta
      if (document.body.dataset.page === 'favoritos' && !quedo) vistaFavoritos();
    });
  });
}

/* ---------- 5. Vistas ---------- */

function vistaHome() {
  const destacadas = NoticiasService.listar().slice(0, 3);
  pintarGrid(document.querySelector('#grid-destacadas'), destacadas, {
    titulo: 'Todavía no hay noticias publicadas',
    texto: 'Inicia sesión para crear la primera publicación del catálogo.',
    accion: { url: 'admin.html', texto: 'Crear noticia' }
  });
}

function vistaListado() {
  const grid    = document.querySelector('#grid-listado');
  const chips   = document.querySelector('#filtros');
  const buscar  = document.querySelector('#buscar');
  const nota    = document.querySelector('#resultados');
  let categoria = 'Todas';
  let termino   = '';

  function filtrar() {
    let lista = NoticiasService.listar();
    if (categoria !== 'Todas') lista = lista.filter(n => n.categoria === categoria);
    if (termino) {
      const t = termino.toLowerCase();
      lista = lista.filter(n =>
        n.titulo.toLowerCase().indexOf(t) !== -1 ||
        n.descripcion.toLowerCase().indexOf(t) !== -1 ||
        n.ubicacion.toLowerCase().indexOf(t) !== -1
      );
    }
    return lista;
  }

  function pintarChips() {
    const todas = NoticiasService.listar();
    const cats  = ['Todas', 'Ciberseguridad', 'Redes', 'Software', 'Internacional'];
    chips.innerHTML = cats.map(c => {
      const n = c === 'Todas' ? todas.length : todas.filter(x => x.categoria === c).length;
      return '<button class="chip' + (c === categoria ? ' active' : '') + '" data-cat="' + c + '">' +
             c + ' (' + n + ')</button>';
    }).join('');

    chips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', function () {
        categoria = chip.dataset.cat;
        refrescar();
      });
    });
  }

  function refrescar() {
    pintarChips();
    const lista = filtrar();
    const total = NoticiasService.listar().length;
    if (nota) {
      nota.textContent = lista.length === total
        ? 'Mostrando ' + total + ' publicaciones'
        : 'Mostrando ' + lista.length + ' de ' + total + ' publicaciones';
    }
    pintarGrid(grid, lista, {
      titulo: 'Sin resultados',
      texto: 'No encontramos publicaciones que coincidan con los filtros aplicados. Prueba con otra categoría o borra el término de búsqueda.'
    });
  }

  if (buscar) {
    buscar.addEventListener('input', function () {
      termino = buscar.value.trim();
      refrescar();
    });
  }

  refrescar();
}

function vistaFavoritos() {
  const lista = FavoritosService.noticias();
  const nota  = document.querySelector('#fav-resumen');
  if (nota) {
    nota.textContent = lista.length
      ? lista.length + (lista.length === 1 ? ' publicación guardada' : ' publicaciones guardadas')
      : 'Tu lista está vacía';
  }

  const vaciar = document.querySelector('#vaciar-favoritos');
  if (vaciar) vaciar.style.display = lista.length ? '' : 'none';

  pintarGrid(document.querySelector('#grid-favoritos'), lista, {
    titulo: 'Aún no has guardado publicaciones',
    texto: 'Pulsa el corazón en cualquier tarjeta o en la vista de detalle para agregarla a esta lista. Se conserva en tu navegador aunque cierres la pestaña.',
    accion: { url: 'listado.html', texto: 'Explorar noticias' }
  });
}

function vistaDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'n03';
  const n  = NoticiasService.obtener(id);
  const cont = document.querySelector('#detalle');
  if (!cont) return;

  if (!n) {
    cont.innerHTML =
      '<div class="empty">' +
        '<h3>Publicación no disponible</h3>' +
        '<p>La noticia que buscas no existe o fue eliminada del catálogo.</p>' +
        '<a href="listado.html" class="btn btn-primary">Volver al listado</a>' +
      '</div>';
    return;
  }

  const esFav = FavoritosService.es(n.id);
  const relacionadas = NoticiasService.listar()
    .filter(x => x.categoria === n.categoria && x.id !== n.id)
    .slice(0, 2);

  document.title = n.titulo + ' — Crónica';

  cont.innerHTML = '' +
    '<div class="breadcrumb"><a href="index.html">Inicio</a> / ' +
      '<a href="listado.html">' + escapar(n.categoria) + '</a> / ' + escapar(n.titulo) + '</div>' +
    '<div class="detail">' +
      '<div class="detail-head">' +
        '<div class="detail-cat">' + escapar(n.categoria.toUpperCase()) + '</div>' +
        '<h1>' + escapar(n.titulo) + '</h1>' +
        '<p class="detail-lede">' + escapar(n.descripcion) + '</p>' +
        '<div class="detail-meta">' +
          '<span>Publicado el ' + escapar(n.fecha) + '</span>' +
          '<span>Categoría: ' + escapar(n.categoria) + '</span>' +
          '<span>Ubicación: ' + escapar(n.ubicacion) + '</span>' +
          '<span>Por ' + escapar(n.autor) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="detail-media"><img src="' + escapar(n.imagen) + '" alt="' + escapar(n.titulo) + '"></div>' +
      '<div class="detail-layout">' +
        '<div class="detail-body">' +
          n.contenido.split('\n').map(p => '<p>' + escapar(p) + '</p>').join('') +
        '</div>' +
        '<aside class="detail-sidebar">' +
          '<div class="side-box">' +
            '<h4>¿Te interesa esta publicación?</h4>' +
            '<p>Guárdala en tus favoritos o escríbenos para saber más.</p>' +
            '<button class="btn btn-gold" id="fav-detalle">' +
              (esFav ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos') +
            '</button>' +
            '<a href="contacto.html" class="btn btn-outline">Contactar</a>' +
            (AuthService.activa()
              ? '<button class="btn btn-danger" id="borrar-detalle">Eliminar publicación</button>'
              : '') +
          '</div>' +
          (relacionadas.length
            ? '<div class="side-box"><h4>Publicaciones relacionadas</h4>' +
              relacionadas.map(r =>
                '<a class="related-mini" href="detalle.html?id=' + r.id + '">' +
                  '<div class="thumb"><img src="' + escapar(r.imagen) + '" alt=""></div>' +
                  '<div><h5>' + escapar(r.titulo) + '</h5><span>' + escapar(r.categoria) + '</span></div>' +
                '</a>').join('') +
              '</div>'
            : '') +
        '</aside>' +
      '</div>' +
    '</div>';

  document.getElementById('fav-detalle').addEventListener('click', function () {
    const quedo = FavoritosService.alternar(n.id);
    this.textContent = quedo ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos';
  });

  const borrar = document.getElementById('borrar-detalle');
  if (borrar) borrar.addEventListener('click', function () {
    if (confirm('¿Eliminar "' + n.titulo + '" del catálogo?')) {
      NoticiasService.eliminar(n.id);
      window.location.href = 'listado.html';
    }
  });
}

function vistaAdmin() {
  if (!AuthService.exigir()) return;

  const form  = document.querySelector('#form-noticia');
  const tabla = document.querySelector('#tabla-noticias');
  const aviso = document.querySelector('#aviso-admin');

  function pintarTabla() {
    const lista = NoticiasService.listar();
    tabla.innerHTML =
      '<tr><th>Título</th><th>Categoría</th><th>Fecha</th><th>Origen</th><th>Acción</th></tr>' +
      lista.map(n =>
        '<tr>' +
          '<td><a href="detalle.html?id=' + n.id + '">' + escapar(n.titulo) + '</a></td>' +
          '<td>' + escapar(n.categoria) + '</td>' +
          '<td>' + escapar(n.fecha) + '</td>' +
          '<td>' + (n.propia ? 'Creada por ti' : 'Catálogo base') + '</td>' +
          '<td><button class="btn-mini" data-borrar="' + n.id + '">Eliminar</button></td>' +
        '</tr>').join('');

    tabla.querySelectorAll('[data-borrar]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = btn.dataset.borrar;
        const n = NoticiasService.obtener(id);
        if (confirm('¿Eliminar "' + n.titulo + '"?')) {
          NoticiasService.eliminar(id);
          pintarTabla();
          mostrarAviso('Publicación eliminada del catálogo.', 'ok');
        }
      });
    });
  }

  function mostrarAviso(texto, tipo) {
    aviso.className = 'confirm-box' + (tipo === 'error' ? ' is-error' : '');
    aviso.style.display = 'flex';
    aviso.innerHTML = '<div class="ico">' + (tipo === 'error' ? '!' : '✓') + '</div>' +
                      '<div><p>' + escapar(texto) + '</p></div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const c = form.elements;
    const datos = {
      titulo:      c.titulo.value.trim(),
      categoria:   c.categoria.value,
      descripcion: c.descripcion.value.trim(),
      contenido:   c.contenido.value.trim(),
      ubicacion:   c.ubicacion.value.trim(),
      imagen:      c.imagen.value
    };

    if (!datos.titulo || !datos.descripcion || !datos.contenido) {
      mostrarAviso('Completa el título, la descripción breve y el contenido.', 'error');
      return;
    }
    if (datos.descripcion.length < 20) {
      mostrarAviso('La descripción breve debe tener al menos 20 caracteres.', 'error');
      return;
    }

    NoticiasService.crear(datos);
    form.reset();
    pintarTabla();
    mostrarAviso('Publicación creada. Ya aparece en el catálogo y en el inicio.', 'ok');
  });

  const restaurar = document.querySelector('#restaurar');
  if (restaurar) restaurar.addEventListener('click', function () {
    if (confirm('Esto elimina tus publicaciones y restaura el catálogo original. ¿Continuar?')) {
      NoticiasService.restaurar();
      pintarTabla();
      mostrarAviso('Catálogo restaurado a su estado inicial.', 'ok');
    }
  });

  pintarTabla();
}

function vistaLogin() {
  const form  = document.querySelector('#form-login');
  const aviso = document.querySelector('#aviso-login');
  if (!form) return;

  if (AuthService.activa()) {
    window.location.href = 'admin.html';
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const ok = AuthService.entrar(form.elements.usuario.value.trim(), form.elements.clave.value);
    if (ok) {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('volver') || 'admin.html';
    } else {
      aviso.style.display = 'flex';
      aviso.className = 'confirm-box is-error';
      aviso.innerHTML = '<div class="ico">!</div><div><p>Usuario o contraseña incorrectos. ' +
                        'Usa las credenciales de demostración indicadas abajo.</p></div>';
    }
  });
}

function vistaContacto() {
  const form = document.querySelector('#form-contacto');
  if (!form) return;
  const confirmacion = document.querySelector('#confirmacion');
  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function marcar(campo, mensaje) {
    const field = campo.closest('.field');
    field.classList.add('error');
    const msg = field.querySelector('.error-msg');
    if (msg) msg.textContent = mensaje;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('error'));
    let valido = true;

    const c = form.elements;
    if (!c.nombre.value.trim())                    { marcar(c.nombre, 'Este campo es obligatorio.'); valido = false; }
    if (!patronCorreo.test(c.correo.value.trim())) { marcar(c.correo, 'Ingresa un correo válido (ej: nombre@dominio.com).'); valido = false; }
    if (c.mensaje.value.trim().length < 20)        { marcar(c.mensaje, 'El mensaje debe tener al menos 20 caracteres.'); valido = false; }

    if (valido) {
      confirmacion.style.display = 'flex';
      form.reset();
      confirmacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      confirmacion.style.display = 'none';
    }
  });
}

/* ---------- 6. Arranque ---------- */

// Prepara la página: primero lo que no depende de los datos, luego carga el JSON y pinta la vista.
async function iniciarApp() {
  pintarSesion();          // estado de sesión en la barra superior
  actualizarContador();    // contador de favoritos en el menú

  // Botón "Vaciar lista" de la página de favoritos
  const vaciar = document.querySelector('#vaciar-favoritos');
  if (vaciar) vaciar.addEventListener('click', function () {
    if (confirm('¿Vaciar toda tu lista de favoritos?')) {
      FavoritosService.vaciar();
      vistaFavoritos();
    }
  });

  const pagina = document.body.dataset.page;   // qué página es (definido en <body data-page="...">)

  // Solo las páginas que muestran noticias piden el JSON
  if (PAGINAS_CON_DATOS.indexOf(pagina) !== -1) {
    mostrarCargando();               // mensaje mientras llega la respuesta
    await cargarNoticiasBase();      // espera a que el catálogo esté listo
  }

  // Con los datos disponibles, se pinta la vista que corresponde
  switch (pagina) {
    case 'home':      vistaHome();      break;
    case 'listado':   vistaListado();   break;
    case 'detalle':   vistaDetalle();   break;
    case 'favoritos': vistaFavoritos(); break;
    case 'admin':     vistaAdmin();     break;
    case 'login':     vistaLogin();     break;
    case 'contacto':  vistaContacto();  break;
  }
}

// Al terminar de cargar el HTML se inicia la app.
// La promesa se guarda en window.appListo para que las pruebas puedan esperarla.
// La condición evita iniciar dos veces (y duplicar los manejadores de eventos).
document.addEventListener('DOMContentLoaded', function () {
  if (!window.appListo) window.appListo = iniciarApp();
});
