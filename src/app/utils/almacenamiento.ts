/* Lectura y escritura segura en localStorage / sessionStorage (antes: leer() y escribir() de app.js) */

export const K_NOTICIAS  = 'cronica_noticias';   // localStorage   — noticias creadas por el usuario
export const K_BORRADAS  = 'cronica_borradas';   // localStorage   — ids de noticias base eliminadas
export const K_FAVORITOS = 'cronica_favoritos';  // localStorage   — ids marcados como favoritos
export const K_SESION    = 'cronica_sesion';     // sessionStorage — usuario autenticado

export function leer<T>(almacen: Storage, clave: string, porDefecto: T): T {
  try {
    const valor = almacen.getItem(clave);
    return valor ? (JSON.parse(valor) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function escribir(almacen: Storage, clave: string, valor: unknown): void {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
  } catch (e) {
    console.warn('No se pudo guardar en el almacenamiento:', e);
  }
}
