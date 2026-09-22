/**
 * El equipo, en el orden del diseño de Figma (frame mobile 1219:985).
 *
 * Las medidas están en px del lienzo mobile de 390. El componente las multiplica por
 * `--k`, que vale 1 en mobile y crece en tablet y desktop (D7: la composición de mobile
 * se escala, no se recompone).
 */
export interface Integrante {
  /** Nombre del archivo en `public/images/quienes-somos/`. */
  slug: string;
  /** Los nombres propios no se traducen. */
  name: string;
  /** Clave del cargo dentro de `quienesSomos.roles`. */
  role: 'coordinadora' | 'fundadora' | 'cofundadora' | 'projectManager' | 'disenadora';
  /** De qué lado va la foto; `center` la pone sola con el nombre debajo. */
  side: 'left' | 'right' | 'center';
  /** Diámetro de la foto. */
  size: number;
  /** Cuánto se sale la foto del margen de la página, hacia su lado. */
  bleed?: number;
  /** Encuadre de la foto dentro del círculo, cuando el centro no sirve. */
  focus?: string;
}

export const INTEGRANTES: Integrante[] = [
  {
    slug: 'mafe-ramirez',
    name: 'Mafe Ramirez',
    role: 'coordinadora',
    side: 'left',
    size: 188,
    bleed: 47,
    focus: '50% 35%',
  },
  {
    slug: 'paola-segnini',
    name: 'Paola Segnini',
    role: 'coordinadora',
    side: 'right',
    size: 153,
    bleed: 25,
    focus: '50% 30%',
  },
  {
    slug: 'lina-lievano',
    name: 'Lina Lievano',
    role: 'coordinadora',
    side: 'left',
    size: 201.5,
    bleed: 61,
    focus: '50% 35%',
  },
  {
    slug: 'karol-lopez',
    name: 'Karol López',
    role: 'fundadora',
    side: 'center',
    size: 201.5,
    focus: '58% 50%',
  },
  {
    slug: 'vanessa-cortes',
    name: 'Vanessa Córtes',
    role: 'coordinadora',
    side: 'left',
    size: 169,
    bleed: 61,
    focus: '40% 30%',
  },
  {
    slug: 'erika-cely',
    name: 'Erika Cely',
    role: 'cofundadora',
    side: 'center',
    size: 201.5,
    focus: '50% 45%',
  },
  {
    slug: 'adriana-chavarro',
    name: 'Adriana Chavarro',
    role: 'projectManager',
    side: 'right',
    size: 159.5,
    bleed: 40,
    focus: '50% 30%',
  },
  {
    slug: 'alejandra-villarraga',
    name: 'Alejandra Villarraga',
    role: 'disenadora',
    side: 'left',
    size: 152,
    bleed: 53,
    focus: '50% 40%',
  },
  {
    slug: 'karina-cely',
    name: 'Karina Cely',
    role: 'projectManager',
    side: 'right',
    size: 203,
    bleed: 69,
    focus: '50% 30%',
  },
];
