// Geometría de dibujo (pura, sin Phaser) sobre la disposición escalonada de world/disposicion.ts.

import { ANCHO_TILE, MEDIO_ANCHO, PASO_FILA } from '../world/disposicion';
import type { RectMundo } from '../world/disposicion';

export { ANCHO_TILE, ALTO_TILE, MEDIO_ANCHO, MEDIO_ALTO } from '../world/disposicion';
export type { Punto, RectMundo } from '../world/disposicion';

// Cuadro (frame) del atlas: el rombo más 2 px de sangrado por lado y altura extra
// por encima del rombo para dibujar árboles, colinas y montañas.
export const MARGEN_FRAME = 2;
export const FRAME_ANCHO = 68;
export const FRAME_ALTO = 52;
/** Posición del vértice superior del rombo dentro del cuadro. */
export const VERTICE_X = 34;
export const VERTICE_Y = 18;
export const ORIGEN_X = VERTICE_X / FRAME_ANCHO;
export const ORIGEN_Y = VERTICE_Y / FRAME_ALTO;

/** Margen mínimo (px de mundo) que se añade a la vista al reconstruir la capa de terreno. */
export const MARGEN_CACHE = 96;
/** Margen mínimo en píxeles de PANTALLA: con zoom bajo evita reconstruir en casi cada fotograma. */
export const MARGEN_CACHE_PANTALLA = 48;

export function margenCache(zoom: number): number {
  return Math.max(MARGEN_CACHE, MARGEN_CACHE_PANTALLA / zoom);
}

export interface RangoCasillas {
  minCol: number;
  maxCol: number;
  minFila: number;
  maxFila: number;
}

/** ¿El cuadro de la casilla con vértice superior (px, py) toca el rectángulo? */
export function tileVisible(px: number, py: number, vista: RectMundo): boolean {
  return (
    px + (FRAME_ANCHO - VERTICE_X) > vista.izq &&
    px - VERTICE_X < vista.der &&
    py + (FRAME_ALTO - VERTICE_Y) > vista.arr &&
    py - VERTICE_Y < vista.aba
  );
}

/** Rango rectangular de columnas/filas (inclusivo) que puede tocar el rectángulo. Superconjunto seguro. */
export function calcularRangoVisible(vista: RectMundo, columnas: number, filas: number): RangoCasillas {
  return {
    minFila: Math.max(0, Math.floor((vista.arr - (FRAME_ALTO - VERTICE_Y)) / PASO_FILA)),
    maxFila: Math.min(filas - 1, Math.ceil((vista.aba + VERTICE_Y) / PASO_FILA)),
    // Las filas impares van desplazadas medio rombo: se calcula con el peor caso de cada lado.
    minCol: Math.max(0, Math.floor((vista.izq - (FRAME_ANCHO - VERTICE_X) - ANCHO_TILE) / ANCHO_TILE)),
    maxCol: Math.min(columnas - 1, Math.ceil((vista.der + VERTICE_X - MEDIO_ANCHO) / ANCHO_TILE)),
  };
}

export function rangoVacio(r: RangoCasillas): boolean {
  return r.minCol > r.maxCol || r.minFila > r.maxFila;
}

export function vistaDentro(vista: RectMundo, contenedor: RectMundo): boolean {
  return (
    vista.izq >= contenedor.izq &&
    vista.arr >= contenedor.arr &&
    vista.der <= contenedor.der &&
    vista.aba <= contenedor.aba
  );
}

export function expandir(vista: RectMundo, margen: number): RectMundo {
  return { izq: vista.izq - margen, arr: vista.arr - margen, der: vista.der + margen, aba: vista.aba + margen };
}

export function interseccion(a: RectMundo, b: RectMundo): RectMundo | null {
  const r = { izq: Math.max(a.izq, b.izq), arr: Math.max(a.arr, b.arr), der: Math.min(a.der, b.der), aba: Math.min(a.aba, b.aba) };
  return r.izq < r.der && r.arr < r.aba ? r : null;
}

/**
 * Segmentos de la cuadrícula isométrica recortados al rectángulo: [x1,y1,x2,y2, ...].
 * Los vértices de las casillas están en (32k, 16m) con k+m impar, así que las líneas de pendiente +1/2
 * cumplen y = x/2 + 16 + 32j y las de pendiente -1/2 cumplen y = -x/2 + 16 + 32j.
 */
export function segmentosRejilla(r: RectMundo): number[] {
  const s: number[] = [];
  if (!(r.izq < r.der && r.arr < r.aba)) return s;

  const cMin = r.arr - r.der / 2;
  const cMax = r.aba - r.izq / 2;
  for (let j = Math.ceil((cMin - 16) / 32); j <= Math.floor((cMax - 16) / 32); j++) {
    const c = 16 + 32 * j;
    const xa = Math.max(r.izq, 2 * (r.arr - c));
    const xb = Math.min(r.der, 2 * (r.aba - c));
    if (xa < xb) s.push(xa, xa / 2 + c, xb, xb / 2 + c);
  }

  const tMin = r.arr + r.izq / 2;
  const tMax = r.aba + r.der / 2;
  for (let j = Math.ceil((tMin - 16) / 32); j <= Math.floor((tMax - 16) / 32); j++) {
    const t = 16 + 32 * j;
    const xa = Math.max(r.izq, 2 * (t - r.aba));
    const xb = Math.min(r.der, 2 * (t - r.arr));
    if (xa < xb) s.push(xa, -xa / 2 + t, xb, -xb / 2 + t);
  }
  return s;
}
