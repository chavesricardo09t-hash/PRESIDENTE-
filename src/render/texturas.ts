import Phaser from 'phaser';
import { ATLAS_ALTO, ATLAS_ANCHO, FRAMES_TOTALES, dibujarAtlas, nombreFrame, rectFrame } from './atlas';

export const CLAVE_ATLAS = 'terrenos';

/** Crea la textura de terrenos dibujándola en un canvas (no hay imágenes externas). */
export function crearTexturas(escena: Phaser.Scene): void {
  if (escena.textures.exists(CLAVE_ATLAS)) return;
  const lienzo = escena.textures.createCanvas(CLAVE_ATLAS, ATLAS_ANCHO, ATLAS_ALTO);
  if (!lienzo) throw new Error('No se pudo crear la textura de terrenos');
  dibujarAtlas(lienzo.context);
  for (let i = 0; i < FRAMES_TOTALES; i++) {
    const r = rectFrame(i);
    lienzo.add(nombreFrame(i), 0, r.x, r.y, r.ancho, r.alto);
  }
  lienzo.refresh();
}
