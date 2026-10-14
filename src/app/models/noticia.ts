/** Una publicación del periódico. Los campos opcionales no vienen en todos los registros. */
export interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  contenido: string;
  imagen: string;
  fecha: string;       // formato ISO: 2026-09-15
  ubicacion: string;
  autor?: string;
  destacada?: boolean;
  propia?: boolean;    // true si la creó el usuario desde el módulo de administración
}

/** Datos que el formulario de administración envía para crear una noticia. */
export type NuevaNoticia = Pick<Noticia, 'titulo' | 'categoria' | 'descripcion' | 'contenido'> &
  Partial<Pick<Noticia, 'ubicacion' | 'imagen'>>;

/** Categorías disponibles al crear una noticia (orden del <select> de admin). */
export const CATEGORIAS: readonly string[] = ['Ciberseguridad', 'Redes', 'Internacional', 'Software'];

/** Chips de filtro del listado (orden original del proyecto). */
export const FILTROS: readonly string[] = ['Todas', 'Ciberseguridad', 'Redes', 'Software', 'Internacional'];

/** Imágenes que se pueden elegir en el formulario de administración. */
export const IMAGENES: readonly { valor: string; etiqueta: string }[] = [
  { valor: 'img/card1.jpg', etiqueta: 'Imagen 1 — defensa digital' },
  { valor: 'img/card2.jpg', etiqueta: 'Imagen 2 — red comunitaria' },
  { valor: 'img/card3.jpg', etiqueta: 'Imagen 3 — ransomware' },
  { valor: 'img/card4.jpg', etiqueta: 'Imagen 4 — software logístico' },
  { valor: 'img/card5.jpg', etiqueta: 'Imagen 5 — programación web' },
  { valor: 'img/card6.jpg', etiqueta: 'Imagen 6 — movilidad sostenible' },
  { valor: 'img/card7.jpg', etiqueta: 'Imagen 7 — laboratorio de robótica' },
  { valor: 'img/card8.jpg', etiqueta: 'Imagen 8 — cable submarino' },
  { valor: 'img/card9.jpg', etiqueta: 'Imagen 9 — plataforma del campo' },
];
