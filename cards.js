'use strict';

// Datos del juego, igual que en infierno_python/infierno.py.
const DEMON_IDS = new Set([6, 7, 8, 9, 10]);
const SOUL_IDS = [1, 2, 3, 4];
const PORTAL_ID = 5;

const LEVELS = [
  { key: 'muyfacil',  number: 1, label: 'Preludio de Huesos', subtitle: 'muy fácil',   cards: [1, 2, 3, 4, 5, 11, 12, 13, 14, 19, 21],                       minStars: 3, desc: 'Para aprender a jugar. No hay demonios al acecho.' },
  { key: 'facil',     number: 2, label: 'Brasa Temprana',     subtitle: 'fácil',       cards: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 7, 9],                     minStars: 5, desc: 'Enfrentá a tus primeros dos demonios.' },
  { key: 'normal',    number: 3, label: 'Novato del Averno',  subtitle: 'normal',      cards: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 6, 7, 8],      minStars: 7, desc: 'Se suma un tercer demonio.' },
  { key: 'diabolico', number: 4, label: 'Marcha de Esclavos', subtitle: 'difícil',     cards: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 20, 22, 6, 7, 8, 9],   minStars: 9, desc: 'Cuatro demonios están detrás de ti.' },
  { key: 'perdicion', number: 5, label: 'Valle de Espinas',   subtitle: 'muy difícil', cards: [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 20, 6, 7, 8, 9, 10], minStars: 9, desc: 'Un interminable infierno imposible de recorrer.' },
  { key: 'abismo',    number: 6, label: 'Furia Satánica',     subtitle: 'imposible',   cards: [1, 2, 3, 4, 5, 13, 14, 19, 20, 21, 22, 23, 24, 6, 7, 8, 9, 10], minStars: 5, desc: '¡Los bosques de espinas complican el escape!' },
];

// valorF/estrellaF: arriba con la carta derecha (FRENTE).
// valorI/estrellaI: arriba con la carta rotada (ROTADA).
const CARDS = [
  { id: 1,  nombre: 'Alma de la doncella inocente', valorF: 1, valorI: 6, color: 'verde',    img: 'alma1',    estrellaI: false, estrellaF: false },
  { id: 2,  nombre: 'Alma del niño perdido',        valorF: 2, valorI: 5, color: 'verde',    img: 'alma2',    estrellaI: true,  estrellaF: false },
  { id: 3,  nombre: 'Alma del sabio errante',       valorF: 3, valorI: 4, color: 'verde',    img: 'alma3',    estrellaI: false, estrellaF: false },
  { id: 4,  nombre: 'Alma del guerrero vencido',    valorF: 4, valorI: 3, color: 'verde',    img: 'alma4',    estrellaI: false, estrellaF: false },
  { id: 5,  nombre: 'Portal de salida',             valorF: 0, valorI: 0, color: 'verde',    img: 'salida',   estrellaI: false, estrellaF: false },
  { id: 6,  nombre: 'Demonio',                      valorF: 1, valorI: 0, color: 'rojo',     img: 'demonio1', estrellaI: true,  estrellaF: false },
  { id: 7,  nombre: 'Demonio',                      valorF: 1, valorI: 0, color: 'rojo',     img: 'demonio2', estrellaI: false, estrellaF: false },
  { id: 8,  nombre: 'Demonio',                      valorF: 1, valorI: 0, color: 'rojo',     img: 'demonio3', estrellaI: true,  estrellaF: false },
  { id: 9,  nombre: 'Demonio',                      valorF: 1, valorI: 0, color: 'rojo',     img: 'demonio4', estrellaI: false, estrellaF: false },
  { id: 10, nombre: 'Demonio',                      valorF: 1, valorI: 0, color: 'rojo',     img: 'demonio5', estrellaI: true,  estrellaF: false },
  { id: 11, nombre: 'Cadenas infinitas',            valorF: 0, valorI: 1, color: 'amarillo', img: 'carta1',   estrellaI: true,  estrellaF: false },
  { id: 12, nombre: 'Luna sangrienta',              valorF: 2, valorI: 1, color: 'amarillo', img: 'carta2',   estrellaI: true,  estrellaF: false },
  { id: 13, nombre: 'Los ahorcados',                valorF: 3, valorI: 2, color: 'amarillo', img: 'carta3',   estrellaI: true,  estrellaF: false },
  { id: 14, nombre: 'Laberinto de almas perdidas',  valorF: 4, valorI: 3, color: 'amarillo', img: 'carta4',   estrellaI: true,  estrellaF: false },
  { id: 15, nombre: 'Cenagal de las sombras',       valorF: 5, valorI: 4, color: 'amarillo', img: 'carta5',   estrellaI: true,  estrellaF: false },
  { id: 16, nombre: 'Hoguera de los condenados',    valorF: 0, valorI: 5, color: 'amarillo', img: 'carta6',   estrellaI: true,  estrellaF: false },
  { id: 17, nombre: 'Laguna de azufre',             valorF: 0, valorI: 1, color: 'amarillo', img: 'carta7',   estrellaI: true,  estrellaF: false },
  { id: 18, nombre: 'Jaulas de castigo',            valorF: 2, valorI: 1, color: 'amarillo', img: 'carta8',   estrellaI: true,  estrellaF: false },
  { id: 19, nombre: 'La hambruna',                  valorF: 3, valorI: 2, color: 'amarillo', img: 'carta9',   estrellaI: false, estrellaF: false },
  { id: 20, nombre: 'Coliseo de la muerte',         valorF: 4, valorI: 3, color: 'amarillo', img: 'carta10',  estrellaI: false, estrellaF: false },
  { id: 21, nombre: 'Péndulo de la agonía',         valorF: 5, valorI: 4, color: 'amarillo', img: 'carta11',  estrellaI: false, estrellaF: false },
  { id: 22, nombre: 'Bosque de las espinas',        valorF: 1, valorI: 1, color: 'amarillo', img: 'carta12',  estrellaI: false, estrellaF: false },
  { id: 23, nombre: 'Bosque de las espinas',        valorF: 1, valorI: 1, color: 'amarillo', img: 'carta12',  estrellaI: false, estrellaF: false },
  { id: 24, nombre: 'Bosque de las espinas',        valorF: 1, valorI: 1, color: 'amarillo', img: 'carta12',  estrellaI: false, estrellaF: false },
];

const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));
