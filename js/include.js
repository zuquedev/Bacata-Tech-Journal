async function cargarIncludes() {
  const elementos = document.querySelectorAll('[data-include]');
  for (const el of elementos) {
    const archivo = el.getAttribute('data-include');
    try {
      const respuesta = await fetch(archivo);
      if (respuesta.ok) {
        el.innerHTML = await respuesta.text();
      } else {
        console.error(`Error al cargar ${archivo}: ${respuesta.status}`);
      }
    } catch (e) {
      console.error(`Error al cargar ${archivo}:`, e);
    }
  }
}

document.addEventListener('DOMContentLoaded', cargarIncludes);