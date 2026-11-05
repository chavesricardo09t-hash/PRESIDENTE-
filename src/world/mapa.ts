// Datos del mapa en arreglos tipados (un byte por casilla), sin objetos por casilla.
// Esta capa NO depende de Phaser ni del navegador.

export interface MapaMundo {
  readonly ancho: number;
  readonly alto: number;
  readonly semilla: number;
  /** Identificador de terreno por casilla (ver terreno.ts). */
  readonly terreno: Uint8Array;
  /** Elevación 0-255 por casilla. */
  readonly elevacion: Uint8Array;
  /** Variante visual 0..2 por casilla (solo estética, determinista). */
  readonly variante: Uint8Array;
}

export function indiceCasilla(mapa: Pick<MapaMundo, 'ancho' | 'alto'>, x: number, y: number): number {
  return y * mapa.ancho + x;
}

export function dentroDelMapa(mapa: Pick<MapaMundo, 'ancho' | 'alto'>, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < mapa.ancho && y < mapa.alto;
}
