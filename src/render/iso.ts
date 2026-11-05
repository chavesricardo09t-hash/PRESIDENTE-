// Geometría isométrica 2:1 (pura, sin Phaser).
//
// Una casilla (x, y) es un rombo de 64x32 cuyo vértice SUPERIOR está en el mundo:
//   px = (x - y) * 32,  py = (x + y) * 16
// Los vértices de la cuadrícula son los puntos (gx, gy) enteros con la misma fórmula.

export const ANCHO_TILE = 64;
export const ALTO_TILE = 32;
export const MEDIO_ANCHO = ANCHO_TILE / 2;
export const MEDIO_ALTO = ALTO_TILE / 2;

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

/** Margen (en px de mundo) que se añade a la vista al reconstruir la capa de terreno. */
export const MARGEN_CACHE = 96;

export interface Punto {
  x: number;
  y: number;
}

export interface RectMundo {
  izq: number;
  arr: number;
  der: number;
  aba: number;
}

export interface RangoTiles {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function gridAMundo(gx: number, gy: number): Punto {
  return { x: (gx - gy) * MEDIO_ANCHO, y: (gx + gy) * MEDIO_ALTO };
}

export function mundoAGrid(wx: number, wy: number): Punto {
  return { x: (wx / MEDIO_ANCHO + wy / MEDIO_ALTO) / 2, y: (wy / MEDIO_ALTO - wx / MEDIO_ANCHO) / 2 };
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

/** Rango de casillas (inclusivo) que puede tocar el rectángulo. Es un superconjunto seguro. */
export function calcularRangoVisible(vista: RectMundo, ancho: number, alto: number): RangoTiles {
  const izq = vista.izq - VERTICE_X;
  const der = vista.der + (FRAME_ANCHO - VERTICE_X);
  const arr = vista.arr - (FRAME_ALTO - VERTICE_Y);
  const aba = vista.aba + VERTICE_Y;

  const esquinas = [mundoAGrid(izq, arr), mundoAGrid(der, arr), mundoAGrid(izq, aba), mundoAGrid(der, aba)];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const e of esquinas) {
    minX = Math.min(minX, e.x);
    maxX = Math.max(maxX, e.x);
    minY = Math.min(minY, e.y);
    maxY = Math.max(maxY, e.y);
  }
  return {
    minX: Math.max(0, Math.floor(minX)),
    maxX: Math.min(ancho - 1, Math.ceil(maxX)),
    minY: Math.max(0, Math.floor(minY)),
    maxY: Math.min(alto - 1, Math.ceil(maxY)),
  };
}

export function rangoVacio(r: RangoTiles): boolean {
  return r.minX > r.maxX || r.minY > r.maxY;
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

/** Caja del mundo que ocupa un mapa de ancho x alto casillas (vértices de la cuadrícula). */
export function limitesMundo(ancho: number, alto: number): RectMundo {
  return { izq: -alto * MEDIO_ANCHO, der: ancho * MEDIO_ANCHO, arr: 0, aba: (ancho + alto) * MEDIO_ALTO };
}
