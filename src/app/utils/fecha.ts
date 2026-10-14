/** Fecha de la edición para la barra superior. Ej: "Martes, 13 de octubre de 2026 · Bogotá, Colombia" (antes: fecha.js) */
export function fechaEdicion(): string {
  const fecha = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota', // hora de Bogotá sin importar dónde esté el lector
  });
  return fecha.charAt(0).toUpperCase() + fecha.slice(1) + ' · Bogotá, Colombia';
}
