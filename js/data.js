/* Crónica — catálogo de RESPALDO.
   La fuente principal de datos es noticias.json, que app.js solicita con fetch().
   Este arreglo solo se usa si esa petición falla (por ejemplo, al abrir el
   proyecto con doble clic, donde el navegador bloquea fetch sobre archivos locales).
   Debe mantenerse idéntico al contenido de noticias.json (test.js lo verifica).
   En la fase de Angular la petición pasa a ser HttpClient sobre el mismo JSON. */

const NOTICIAS_RESPALDO = [
  {
    id: "n01",
    titulo: "Nueva beca de intercambio abre convocatoria para jóvenes",
    categoria: "Educativa",
    descripcion: "Estudiantes de últimos semestres podrán aplicar a movilidad internacional en más de 12 países aliados.",
    contenido: "La convocatoria estará abierta durante seis semanas y contempla cobertura de matrícula, alojamiento y tiquetes. Los aspirantes deben acreditar un promedio mínimo y presentar una carta de motivación. El proceso de selección incluye una entrevista virtual con el comité académico de la universidad receptora.",
    imagen: "img/card1.jpg",
    fecha: "2026-09-15",
    ubicacion: "Bogotá, Colombia",
    autor: "Redacción Crónica",
    destacada: true
  },
  {
    id: "n02",
    titulo: "Feria de innovación reúne a más de 80 startups en la región",
    categoria: "Tecnológica",
    descripcion: "El evento presentará soluciones en inteligencia artificial, energía limpia y movilidad urbana.",
    contenido: "Durante tres días, emprendedores de distintos sectores presentarán prototipos ante inversionistas y aliados corporativos. La agenda incluye talleres de validación de producto, ruedas de negocio y un espacio abierto al público general para probar las soluciones expuestas.",
    imagen: "img/card2.jpg",
    fecha: "2026-09-15",
    ubicacion: "Medellín, Colombia",
    autor: "Redacción Crónica",
    destacada: true
  },
  {
    id: "n03",
    titulo: "Ruta guiada por el Eje Cafetero abre nuevos cupos este mes",
    categoria: "Turística",
    descripcion: "La experiencia incluye recorrido por fincas cafeteras, avistamiento de aves y gastronomía local.",
    contenido: "La ruta comienza en Salento y atraviesa tres fincas cafeteras familiares donde los visitantes participan en la recolección, el despulpado y el tueste del grano. Guías locales certificados acompañan cada tramo y comparten la historia agrícola de la región, reconocida como Paisaje Cultural Cafetero. El paquete contempla transporte, alimentación, alojamiento en finca y una sesión de avistamiento de aves al amanecer.",
    imagen: "img/card3.jpg",
    fecha: "2026-09-14",
    ubicacion: "Quindío, Colombia",
    autor: "Redacción Crónica",
    destacada: true
  },
  {
    id: "n04",
    titulo: "Feria de emprendedores locales llega a su octava edición",
    categoria: "Comercial",
    descripcion: "Más de 150 marcas independientes exhibirán productos de moda, hogar y gastronomía.",
    contenido: "La feria se realizará en un espacio al aire libre con entrada libre. Además de los puestos de venta, habrá charlas sobre formalización de negocios, costeo de productos y estrategias de venta en canales digitales para pequeños emprendimientos.",
    imagen: "img/card4.jpg",
    fecha: "2026-09-14",
    ubicacion: "Cali, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  },
  {
    id: "n05",
    titulo: "Abren inscripciones a taller gratuito de programación web",
    categoria: "Educativa",
    descripcion: "El curso está dirigido a jóvenes de colegios públicos interesados en tecnología.",
    contenido: "El taller cubre fundamentos de HTML, CSS y JavaScript en sesiones presenciales de dos horas durante ocho semanas. Los participantes construirán un proyecto final propio y recibirán certificado de asistencia. No se requieren conocimientos previos ni computador propio.",
    imagen: "img/card5.jpg",
    fecha: "2026-09-13",
    ubicacion: "Bogotá, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  },
  {
    id: "n06",
    titulo: "Startup local lanza aplicación para movilidad sostenible",
    categoria: "Tecnológica",
    descripcion: "La app conecta usuarios con rutas de transporte compartido en bicicleta y bus eléctrico.",
    contenido: "La aplicación calcula la huella de carbono evitada en cada trayecto y permite acumular beneficios canjeables con comercios aliados. La versión inicial cubre cuatro localidades y el equipo prevé ampliar la cobertura durante el próximo semestre.",
    imagen: "img/card6.jpg",
    fecha: "2026-09-12",
    ubicacion: "Bogotá, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  },
  {
    id: "n07",
    titulo: "Festival gastronómico reunirá cocina tradicional de 8 regiones",
    categoria: "Turística",
    descripcion: "El evento se realizará durante tres días en el centro histórico de la ciudad.",
    contenido: "Cocineras tradicionales de ocho departamentos prepararán platos representativos de sus territorios. La programación incluye demostraciones en vivo, degustaciones guiadas y un mercado campesino con productos de origen.",
    imagen: "img/card7.jpg",
    fecha: "2026-09-11",
    ubicacion: "Cartagena, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  },
  {
    id: "n08",
    titulo: "Centro comercial anuncia jornada especial de descuentos",
    categoria: "Comercial",
    descripcion: "Más de 60 tiendas participarán con rebajas de hasta el 40% este fin de semana.",
    contenido: "La jornada extenderá el horario de atención hasta las once de la noche e incluirá actividades culturales en las zonas comunes. Los comercios participantes estarán identificados con señalización especial en cada piso.",
    imagen: "img/card8.jpg",
    fecha: "2026-09-10",
    ubicacion: "Barranquilla, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  },
  {
    id: "n09",
    titulo: "Feria universitaria orienta a bachilleres sobre programas 2027",
    categoria: "Educativa",
    descripcion: "Participan 22 instituciones de educación superior con oferta de becas y créditos.",
    contenido: "Los asistentes podrán resolver dudas sobre requisitos de admisión, costos y modalidades de financiación. Habrá además charlas de orientación vocacional dirigidas a estudiantes de décimo y once grado y a sus familias.",
    imagen: "img/card9.jpg",
    fecha: "2026-09-09",
    ubicacion: "Bucaramanga, Colombia",
    autor: "Redacción Crónica",
    destacada: false
  }
];
