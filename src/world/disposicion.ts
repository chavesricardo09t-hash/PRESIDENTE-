// Disposición ESCALONADA de las casillas (pura, sin Phaser).
//
// Casillas isométricas 2:1 de 64x32. Las filas impares se desplazan medio rombo a la derecha y las
// filas están separadas 16 px, de modo que el conjunto forma un RECTÁNGULO en pantalla.
//   vértice superior de la casilla (columna c, fila f):  x = 64*c + 32 + 32*(f impar),  y = 16*f
//   centro:                                              x igual,                        y + 16
//
// Los bordes izquierdo/derecho/superior/inferior son dentados (media casilla). La "zona totalmente
// cubierta" es el mayor rectángulo SIN huecos; la cámara nunca deja que la vista salga de ella.

export const ANCHO_TILE = 64;
export const ALTO_TILE = 32;
export const MEDIO_ANCHO = ANCHO_TILE / 2;
export const MEDIO_ALTO = ALTO_TILE / 2;
export const PASO_FILA = MEDIO_ALTO;

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

/** Vértice superior de la casilla. */
export function posicionCasilla(columna: number, fila: number): Punto {
  return { x: columna * ANCHO_TILE + MEDIO_ANCHO + (fila & 1) * MEDIO_ANCHO, y: fila * PASO_FILA };
}

export function centroCasilla(columna: number, fila: number): Punto {
  const p = posicionCasilla(columna, fila);
  return { x: p.x, y: p.y + MEDIO_ALTO };
}

/** Mayor rectángulo del mundo sin huecos (para columnas x filas casillas). */
export function zonaCubierta(columnas: number, filas: number): RectMundo {
  return { izq: MEDIO_ANCHO, arr: PASO_FILA, der: columnas * ANCHO_TILE, aba: filas * PASO_FILA };
}

/**
 * Coordenadas sobre el "suelo" (plano real, antes de la proyección isométrica) de un punto de pantalla.
 * Sirve para generar terreno con formas isótropas en el suelo, como en un mapa isométrico clásico.
 */
export function coordenadasSuelo(x: number, y: number): Punto {
  return { x: (x / MEDIO_ANCHO + y / MEDIO_ALTO) / 2, y: (y / MEDIO_ALTO - x / MEDIO_ANCHO) / 2 };
}

/**
 * Casillas que comparten una ARISTA (cuatro diagonales). Dentro de límites.
 * Fila par: (c-1,f-1) (c,f-1) (c-1,f+1) (c,f+1).  Fila impar: (c,f-1) (c+1,f-1) (c,f+1) (c+1,f+1).
 */
export function vecinosArista(columna: number, fila: number, columnas: number, filas: number): Array<[number, number]> {
  const dc = fila & 1 ? 1 : 0;
  const candidatos: Array<[number, number]> = [
    [columna - 1 + dc, fila - 1],
    [columna + dc, fila - 1],
    [columna - 1 + dc, fila + 1],
    [columna + dc, fila + 1],
  ];
  return candidatos.filter(([c, f]) => c >= 0 && f >= 0 && c < columnas && f < filas);
}

/** Tabla de vecinos por arista: 4 índices por casilla (-1 si no existe). */
export function construirVecinos(columnas: number, filas: number): Int32Array {
  const tabla = new Int32Array(columnas * filas * 4).fill(-1);
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const base = (f * columnas + c) * 4;
      vecinosArista(c, f, columnas, filas).forEach(([vc, vf], k) => {
        tabla[base + k] = vf * columnas + vc;
      });
    }
  }
  return tabla;
}
