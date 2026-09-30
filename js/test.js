const fs = require('fs');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { console.log('  PASS  ' + name); pass++; }
  else { console.log('  FAIL  ' + name + (extra ? '  → ' + extra : '')); fail++; }
}

function storageMock() {
  let s = {};
  return {
    getItem: k => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
    clear: () => { s = {}; }
  };
}

function load(file, url) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
    url: url || 'http://localhost/' + file,
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window;
  Object.defineProperty(w, 'localStorage', { value: storageMock(), configurable: true });
  Object.defineProperty(w, 'sessionStorage', { value: storageMock(), configurable: true });
  // jsdom no trae fetch: se simula leyendo el archivo desde disco (equivale a un servidor local)
  w.fetch = ruta => Promise.resolve({
    ok: true, status: 200,
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(ruta, 'utf8')))
  });
  w.confirm = () => true;
  w.alert = () => {};
  w.scrollTo = () => {};
  if (w.Element) w.Element.prototype.scrollIntoView = function () {};
  return { dom, w };
}

async function run(w, esperar = true) {
  // En el navegador los dos <script> comparten el ámbito global de script;
  // en jsdom hay que evaluarlos juntos para reproducir ese comportamiento.
  w.eval(fs.readFileSync('data.js', 'utf8') + '\n' + fs.readFileSync('app.js', 'utf8') +
    '\nwindow.NoticiasService = NoticiasService;' +
    '\nwindow.FavoritosService = FavoritosService;' +
    '\nwindow.AuthService = AuthService;' +
    '\nwindow.origenDatos = () => ORIGEN_DATOS;' +
    '\nwindow.respaldo = () => NOTICIAS_RESPALDO;');
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  // La app carga noticias.json de forma asíncrona: se espera a que termine de pintar
  if (esperar) await w.appListo;
  return w.appListo;
}

(async () => {

/* ===== 1. Listado dinámico ===== */
console.log('\n1) LISTADO DINÁMICO DE NOTICIAS');
{
  const { w } = load('listado.html');
  await run(w);
  const d = w.document;
  const cards = d.querySelectorAll('#grid-listado .card');
  check('Se renderizan 9 tarjetas desde el arreglo de datos', cards.length === 9, cards.length + ' tarjetas');
  check('Cada tarjeta lleva su data-id', d.querySelectorAll('#grid-listado .card[data-id]').length === 9);
  check('Los chips de filtro se generan con conteo real',
    /Educativa \(3\)/.test(d.querySelector('#filtros').textContent),
    d.querySelector('#filtros').textContent.trim());

  // Filtrar por categoría
  [...d.querySelectorAll('.chip')].find(c => c.dataset.cat === 'Turística').click();
  check('Filtrar por "Turística" deja 2 tarjetas',
    d.querySelectorAll('#grid-listado .card').length === 2,
    d.querySelectorAll('#grid-listado .card').length + '');

  // Volver a todas y buscar
  [...d.querySelectorAll('.chip')].find(c => c.dataset.cat === 'Todas').click();
  const input = d.querySelector('#buscar');
  input.value = 'cafetero';
  input.dispatchEvent(new w.Event('input'));
  check('La búsqueda por texto filtra a 1 resultado',
    d.querySelectorAll('#grid-listado .card').length === 1,
    d.querySelectorAll('#grid-listado .card').length + '');

  input.value = 'zzzzz';
  input.dispatchEvent(new w.Event('input'));
  check('Sin coincidencias muestra estado vacío', !!d.querySelector('#grid-listado .empty'));
}

/* ===== 2. Favoritos con localStorage + vista propia ===== */
console.log('\n2) FAVORITOS (localStorage) Y LISTA PERSONALIZADA');
{
  const { w } = load('listado.html');
  await run(w);
  const d = w.document;

  const btn = d.querySelector('#grid-listado .card .fav-btn');
  const id = btn.closest('[data-id]').dataset.id;
  btn.click();
  const guardado = JSON.parse(w.localStorage.getItem('cronica_favoritos'));
  check('Al pulsar el corazón se persiste el id en localStorage',
    Array.isArray(guardado) && guardado[0] === id, JSON.stringify(guardado));
  check('El botón cambia a estado activo', btn.classList.contains('is-fav'));
  check('El contador del menú se actualiza',
    d.querySelector('.fav-count').textContent === '1');

  // Segunda noticia
  d.querySelectorAll('#grid-listado .card .fav-btn')[2].click();
  check('Se acumulan varios favoritos',
    JSON.parse(w.localStorage.getItem('cronica_favoritos')).length === 2);

  // Alternar quita
  btn.click();
  check('Volver a pulsar lo elimina de localStorage',
    JSON.parse(w.localStorage.getItem('cronica_favoritos')).length === 1);
}
{
  // La vista favoritos.html lee lo guardado
  const { w } = load('favoritos.html');
  w.localStorage.setItem('cronica_favoritos', JSON.stringify(['n01', 'n05']));
  await run(w);
  const d = w.document;
  check('favoritos.html pinta solo las noticias guardadas',
    d.querySelectorAll('#grid-favoritos .card').length === 2,
    d.querySelectorAll('#grid-favoritos .card').length + '');
  check('Muestra el resumen de cantidad',
    /2 publicaciones guardadas/.test(d.querySelector('#fav-resumen').textContent),
    d.querySelector('#fav-resumen').textContent);

  // Vaciar
  d.querySelector('#vaciar-favoritos').click();
  check('Vaciar deja la lista en estado vacío', !!d.querySelector('#grid-favoritos .empty'));
}
{
  const { w } = load('favoritos.html');
  await run(w);
  check('Sin favoritos muestra el mensaje de lista vacía',
    !!w.document.querySelector('#grid-favoritos .empty'));
}

/* ===== 3. Header con menú de navegación ===== */
console.log('\n3) HEADER CON MENÚ DE NAVEGACIÓN');
{
  const paginas = ['index.html', 'listado.html', 'detalle.html', 'favoritos.html', 'contacto.html', 'login.html', 'admin.html'];
  let ok = true, detalle = '';
  paginas.forEach(p => {
    const html = fs.readFileSync(p, 'utf8');
    if (!/<nav class="nav">/.test(html) || !/class="masthead"/.test(html) || !/class="footer"/.test(html)) {
      ok = false; detalle += p + ' ';
    }
  });
  check('Las 7 páginas tienen masthead, nav y footer', ok, detalle);

  const { w } = load('index.html');
  await run(w);
  const enlaces = w.document.querySelectorAll('.nav a');
  check('El menú tiene 5 entradas', enlaces.length === 5, enlaces.length + '');
  check('Incluye Favoritos y Contacto',
    /Favoritos/.test(w.document.querySelector('.nav').textContent) &&
    /Contacto/.test(w.document.querySelector('.nav').textContent));
  const admin = w.document.querySelector('[data-solo-sesion]');
  check('El enlace "Administrar" está oculto sin sesión', admin.style.display === 'none');
}

/* ===== 4. Mini CRUD asociado a la sesión ===== */
console.log('\n4) MINI CRUD CON CONTROL DE SESIÓN');
{
  // Sin sesión → el guard corta el renderizado y pide login
  const { w } = load('admin.html');
  const original = w.console.error;
  w.console.error = () => {};
  await run(w);
  const d = w.document;
  check('Sin sesión, AuthService.activa() es falso', w.AuthService.activa() === false);
  check('Sin sesión, la tabla de administración no se renderiza',
    d.querySelector('#tabla-noticias').children.length === 0,
    d.querySelector('#tabla-noticias').children.length + ' filas');
  w.console.error = original;
}
{
  // Login correcto
  const { w } = load('login.html');
  await run(w);
  const ok = w.AuthService.entrar('editor', 'cronica2026');
  check('Credenciales correctas abren sesión', ok === true);
  check('La sesión vive en sessionStorage, no en localStorage',
    w.sessionStorage.getItem('cronica_sesion') !== null &&
    w.localStorage.getItem('cronica_sesion') === null);
  check('Credenciales incorrectas se rechazan',
    w.AuthService.entrar('editor', 'malaclave') === false);
}
{
  // CRUD con sesión activa
  const { w } = load('admin.html');
  w.sessionStorage.setItem('cronica_sesion', JSON.stringify({ usuario: 'editor', desde: Date.now() }));
  await run(w);
  const d = w.document;

  check('Con sesión, la tabla lista las 9 noticias',
    d.querySelectorAll('#tabla-noticias tr').length === 10, // 9 + encabezado
    d.querySelectorAll('#tabla-noticias tr').length + ' filas');

  // CREAR
  const form = d.querySelector('#form-noticia');
  form.elements.titulo.value = 'Congreso de robótica educativa abre inscripciones';
  form.elements.categoria.value = 'Tecnológica';
  form.elements.descripcion.value = 'Docentes de primaria y bachillerato podrán participar sin costo en los talleres.';
  form.elements.contenido.value = 'El congreso reúne experiencias de aula en doce instituciones del país.';
  form.elements.ubicacion.value = 'Bogotá, Colombia';
  form.dispatchEvent(new w.Event('submit'));

  const creadas = JSON.parse(w.localStorage.getItem('cronica_noticias'));
  check('CREAR: la noticia se guarda en localStorage',
    creadas && creadas.length === 1 && /robótica/.test(creadas[0].titulo));
  check('CREAR: se le asigna id y autor de la sesión',
    !!creadas[0].id && creadas[0].autor === 'editor', JSON.stringify({ id: creadas[0].id, autor: creadas[0].autor }));
  check('CREAR: la tabla pasa a 10 noticias',
    d.querySelectorAll('#tabla-noticias tr').length === 11);
  check('CREAR: se muestra el aviso de confirmación',
    d.querySelector('#aviso-admin').style.display === 'flex' &&
    !d.querySelector('#aviso-admin').classList.contains('is-error'));

  // Validación
  form.elements.titulo.value = '';
  form.elements.descripcion.value = 'corto';
  form.dispatchEvent(new w.Event('submit'));
  check('CREAR: se rechaza el formulario incompleto',
    d.querySelector('#aviso-admin').classList.contains('is-error'));

  // ELIMINAR noticia base
  const nuevoId = creadas[0].id;
  [...d.querySelectorAll('[data-borrar]')].find(b => b.dataset.borrar === 'n04').click();
  const borradas = JSON.parse(w.localStorage.getItem('cronica_borradas'));
  check('ELIMINAR: la noticia base se marca como borrada',
    borradas && borradas.indexOf('n04') !== -1, JSON.stringify(borradas));
  check('ELIMINAR: desaparece del catálogo',
    w.NoticiasService.listar().every(n => n.id !== 'n04'));

  // ELIMINAR noticia propia
  [...d.querySelectorAll('[data-borrar]')].find(b => b.dataset.borrar === nuevoId).click();
  check('ELIMINAR: la noticia creada se retira de localStorage',
    JSON.parse(w.localStorage.getItem('cronica_noticias')).length === 0);

  // Restaurar
  d.querySelector('#restaurar').click();
  check('Restaurar devuelve el catálogo a 9 noticias',
    w.NoticiasService.listar().length === 9, w.NoticiasService.listar().length + '');
}
{
  // Favorito huérfano se limpia al eliminar
  const { w } = load('admin.html');
  w.sessionStorage.setItem('cronica_sesion', JSON.stringify({ usuario: 'editor' }));
  w.localStorage.setItem('cronica_favoritos', JSON.stringify(['n02', 'n06']));
  await run(w);
  [...w.document.querySelectorAll('[data-borrar]')].find(b => b.dataset.borrar === 'n02').click();
  check('Eliminar una noticia la quita también de favoritos',
    JSON.parse(w.localStorage.getItem('cronica_favoritos')).indexOf('n02') === -1);
}

/* ===== Extra: detalle dinámico por id ===== */
console.log('\nEXTRA) DETALLE DINÁMICO Y CONTACTO');
{
  const { w } = load('detalle.html', 'http://localhost/detalle.html?id=n06');
  await run(w);
  const d = w.document;
  check('detalle.html lee el id de la URL y pinta esa noticia',
    /movilidad sostenible/.test(d.querySelector('#detalle h1').textContent),
    d.querySelector('#detalle h1').textContent);
  d.querySelector('#fav-detalle').click();
  check('El botón de favorito del detalle persiste',
    JSON.parse(w.localStorage.getItem('cronica_favoritos')).indexOf('n06') !== -1);
  check('Muestra publicaciones relacionadas de la misma categoría',
    d.querySelectorAll('.related-mini').length > 0);
}
{
  const { w } = load('detalle.html', 'http://localhost/detalle.html?id=noexiste');
  await run(w);
  check('Un id inexistente muestra el estado "no disponible"',
    !!w.document.querySelector('#detalle .empty'));
}
{
  const { w } = load('contacto.html');
  await run(w);
  const d = w.document, f = d.querySelector('#form-contacto');
  f.elements.nombre.value = ''; f.elements.correo.value = 'malcorreo'; f.elements.mensaje.value = 'corto';
  f.dispatchEvent(new w.Event('submit'));
  check('Contacto: rechaza datos inválidos',
    d.querySelectorAll('.field.error').length === 3,
    d.querySelectorAll('.field.error').length + ' campos en error');

  f.elements.nombre.value = 'María Ríos';
  f.elements.correo.value = 'maria@correo.com';
  f.elements.mensaje.value = 'Quisiera información sobre cómo publicar una experiencia.';
  f.dispatchEvent(new w.Event('submit'));
  check('Contacto: acepta datos válidos y confirma',
    d.querySelector('#confirmacion').style.display === 'flex');
}

/* ===== 5. Carga dinámica desde noticias.json ===== */
console.log('\n5) RENDERIZADO DINÁMICO DESDE JSON');
{
  // a) Con fetch disponible, el catálogo sale del JSON
  const { w } = load('listado.html');
  await run(w);
  check('El catálogo se carga desde noticias.json', w.origenDatos() === 'json', w.origenDatos());
  check('Se pintan las 9 tarjetas del JSON',
    w.document.querySelectorAll('#grid-listado .card').length === 9);
}
{
  // b) Prueba de que los datos vienen del JSON y no de data.js: se sirve un JSON distinto
  const { w } = load('listado.html');
  const extra = [
    { id: 'j1', titulo: 'Noticia solo del JSON', categoria: 'Educativa', descripcion: 'Descripción de prueba', contenido: 'Contenido', imagen: 'img/card1.jpg', fecha: '2026-09-15', ubicacion: 'Bogotá' },
    { id: 'j2', titulo: 'Otra noticia del JSON', categoria: 'Comercial', descripcion: 'Descripción de prueba', contenido: 'Contenido', imagen: 'img/card4.jpg', fecha: '2026-09-14', ubicacion: 'Cali' }
  ];
  w.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(extra) });
  await run(w);
  check('Un JSON distinto produce un catálogo distinto (2 tarjetas)',
    w.document.querySelectorAll('#grid-listado .card').length === 2,
    w.document.querySelectorAll('#grid-listado .card').length + '');
  check('Muestra el título que viene del JSON',
    /Noticia solo del JSON/.test(w.document.querySelector('#grid-listado').textContent));
}
{
  // c) Mientras espera la respuesta, se muestra el aviso de carga
  const { w } = load('listado.html');
  let liberar;
  w.fetch = () => new Promise(r => { liberar = () => r({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(fs.readFileSync('noticias.json', 'utf8'))) }); });
  const espera = run(w, false);
  check('Durante la carga se muestra "Cargando noticias"',
    /Cargando noticias/.test(w.document.querySelector('#grid-listado').textContent));
  liberar();
  await espera;
  check('Al llegar la respuesta se reemplaza por las tarjetas',
    w.document.querySelectorAll('#grid-listado .card').length === 9);
}
{
  // d) Respaldo: la petición falla (red caída o apertura con doble clic)
  const { w } = load('listado.html');
  w.fetch = () => Promise.reject(new TypeError('Failed to fetch'));
  w.console.warn = () => {};
  await run(w);
  check('Si fetch falla se usa el respaldo de data.js', w.origenDatos() === 'respaldo', w.origenDatos());
  check('Con el respaldo la app sigue mostrando las 9 noticias',
    w.document.querySelectorAll('#grid-listado .card').length === 9);
}
{
  // e) Respaldo: el servidor responde 404
  const { w } = load('index.html');
  w.fetch = () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve([]) });
  w.console.warn = () => {};
  await run(w);
  check('Un error HTTP 404 activa el respaldo', w.origenDatos() === 'respaldo');
  check('El Home sigue mostrando 3 destacadas con el respaldo',
    w.document.querySelectorAll('#grid-destacadas .card').length === 3);
}
{
  // f) Respaldo: el JSON no es un arreglo
  const { w } = load('listado.html');
  w.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ error: true }) });
  w.console.warn = () => {};
  await run(w);
  check('Un JSON con estructura incorrecta activa el respaldo', w.origenDatos() === 'respaldo');
}
{
  // g) Registros incompletos se descartan sin romper la página
  const { w } = load('listado.html');
  const mezcla = [
    { id: 'ok1', titulo: 'Completa', categoria: 'Turística', descripcion: 'Descripción', contenido: 'Contenido', imagen: 'img/card3.jpg', fecha: '2026-09-15', ubicacion: 'Quindío' },
    { id: 'malo', titulo: 'Sin categoría ni contenido' }
  ];
  w.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(mezcla) });
  await run(w);
  check('Se descartan los registros incompletos del JSON',
    w.document.querySelectorAll('#grid-listado .card').length === 1,
    w.document.querySelectorAll('#grid-listado .card').length + '');
}
{
  // h) El detalle también espera al JSON antes de pintar
  const { w } = load('detalle.html', 'http://localhost/detalle.html?id=n03');
  await run(w);
  check('detalle.html pinta la noticia solicitada tras cargar el JSON',
    /Eje Cafetero/.test(w.document.querySelector('#detalle h1').textContent));
}
{
  // i) Las páginas sin noticias no piden el JSON
  const { w } = load('contacto.html');
  let llamadas = 0;
  w.fetch = () => { llamadas++; return Promise.reject(new Error('no debería llamarse')); };
  await run(w);
  check('contacto.html no solicita noticias.json', llamadas === 0, llamadas + ' llamadas');
}
{
  // j) noticias.json y el respaldo de data.js deben ser idénticos
  const { w } = load('index.html');
  await run(w);
  const json = JSON.parse(fs.readFileSync('noticias.json', 'utf8'));
  check('noticias.json y NOTICIAS_RESPALDO (data.js) están sincronizados',
    JSON.stringify(json) === JSON.stringify(w.respaldo()));
}

console.log('\n─────────────────────────────');
console.log('  ' + pass + ' pruebas superadas, ' + fail + ' fallidas');
process.exit(fail ? 1 : 0);

})();
