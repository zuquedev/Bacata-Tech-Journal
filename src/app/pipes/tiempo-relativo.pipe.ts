import { Pipe, PipeTransform } from '@angular/core';

/** "2026-09-14" → "Hace 29 días" (antes: tiempoRelativo() de app.js) */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fechaISO: string): string {
    const dias = Math.floor((Date.now() - new Date(fechaISO).getTime()) / 86400000);
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Hace 1 día';
    return 'Hace ' + dias + ' días';
  }
}
