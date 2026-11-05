// Dibujo del atlas de terrenos con la API de Canvas 2D (sin imágenes externas).
// Es una función pura respecto a Phaser: recibe un contexto 2D y dibuja en él.

import { crearAleatorio } from '../world/ruido';
import { CANTIDAD_TERRENOS, INFO_TERRENO, Terreno, VARIANTES_POR_TERRENO } from '../world/terreno';
import { FRAME_ALTO, FRAME_ANCHO, MARGEN_FRAME, VERTICE_X, VERTICE_Y } from './iso';

export const CELDA_ANCHO = FRAME_ANCHO + MARGEN_FRAME * 2;
export const CELDA_ALTO = FRAME_ALTO + MARGEN_FRAME * 2;
export const FRAMES_TOTALES = CANTIDAD_TERRENOS * VARIANTES_POR_TERRENO;
export const ATLAS_ANCHO = CELDA_ANCHO * FRAMES_TOTALES;
export const ATLAS_ALTO = CELDA_ALTO;

const FACTOR_VARIANTE = [1, 1.07, 0.93];

export function indiceFrame(terreno: number, variante: number): number {
  return terreno * VARIANTES_POR_TERRENO + variante;
}

export function nombreFrame(indice: number): string {
  return `f${indice}`;
}

export function rectFrame(indice: number): { x: number; y: number; ancho: number; alto: number } {
  return { x: indice * CELDA_ANCHO + MARGEN_FRAME, y: MARGEN_FRAME, ancho: FRAME_ANCHO, alto: FRAME_ALTO };
}

function ajustar(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number): number => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${canal((n >> 16) & 255)},${canal((n >> 8) & 255)},${canal(n & 255)})`;
}

function trazarRombo(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(VERTICE_X, VERTICE_Y);
  ctx.lineTo(VERTICE_X + 32, VERTICE_Y + 16);
  ctx.lineTo(VERTICE_X, VERTICE_Y + 32);
  ctx.lineTo(VERTICE_X - 32, VERTICE_Y + 16);
  ctx.closePath();
}

function dentroRombo(x: number, y: number): boolean {
  return Math.abs(x - VERTICE_X) / 32 + Math.abs(y - (VERTICE_Y + 16)) / 16 <= 0.78;
}

function puntoEnRombo(azar: () => number): { x: number; y: number } {
  for (let i = 0; i < 40; i++) {
    const x = 4 + azar() * 60;
    const y = VERTICE_Y + azar() * 32;
    if (dentroRombo(x, y)) return { x, y };
  }
  return { x: VERTICE_X, y: VERTICE_Y + 16 };
}

function triangulo(ctx: CanvasRenderingContext2D, puntos: Array<[number, number]>, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  puntos.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

function arbol(ctx: CanvasRenderingContext2D, cx: number, base: number, factor: number): void {
  ctx.fillStyle = ajustar('#6b4a2b', factor);
  ctx.fillRect(cx - 1.5, base - 4, 3, 5);
  triangulo(ctx, [[cx, base - 21], [cx - 8, base - 8], [cx + 8, base - 8]], ajustar('#2f6b34', factor));
  triangulo(ctx, [[cx, base - 15], [cx - 10, base - 3], [cx + 10, base - 3]], ajustar('#3d8040', factor));
}

function decorar(ctx: CanvasRenderingContext2D, terreno: number, factor: number, azar: () => number): void {
  switch (terreno) {
    case Terreno.AguaProfunda:
    case Terreno.Agua: {
      ctx.strokeStyle = terreno === Terreno.Agua ? 'rgba(255,255,255,0.28)' : 'rgba(150,200,255,0.2)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const p = puntoEnRombo(azar);
        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y);
        ctx.quadraticCurveTo(p.x, p.y - 2, p.x + 4, p.y);
        ctx.stroke();
      }
      break;
    }
    case Terreno.Arena: {
      for (let i = 0; i < 9; i++) {
        const p = puntoEnRombo(azar);
        ctx.fillStyle = i % 2 ? 'rgba(120,90,40,0.22)' : 'rgba(255,255,255,0.25)';
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }
      break;
    }
    case Terreno.Pradera: {
      ctx.strokeStyle = ajustar('#5c9b47', factor);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) {
        const p = puntoEnRombo(azar);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 0.5, p.y - 3);
        ctx.stroke();
      }
      break;
    }
    case Terreno.Bosque: {
      const bases = [
        { x: 21 + azar() * 4, y: VERTICE_Y + 21 + azar() * 3 },
        { x: 34 + azar() * 4 - 2, y: VERTICE_Y + 14 + azar() * 3 },
        { x: 47 - azar() * 4, y: VERTICE_Y + 21 + azar() * 3 },
      ].sort((a, b) => a.y - b.y);
      for (const b of bases) arbol(ctx, b.x, b.y, factor);
      break;
    }
    case Terreno.Colina: {
      const cx = VERTICE_X + (azar() - 0.5) * 4;
      ctx.fillStyle = ajustar('#8f8b4f', factor);
      ctx.beginPath();
      ctx.ellipse(cx, VERTICE_Y + 17, 21, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ajustar('#bcb673', factor);
      ctx.beginPath();
      ctx.ellipse(cx - 2, VERTICE_Y + 14, 17, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.ellipse(cx - 6, VERTICE_Y + 11, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case Terreno.Montana: {
      const picos: Array<{ x: number; y: number; ancho: number }> = [
        { x: VERTICE_X + 11 + azar() * 3, y: 12 + azar() * 3, ancho: 20 },
        { x: VERTICE_X - 9 - azar() * 3, y: 4 + azar() * 3, ancho: 24 },
      ];
      for (const p of picos) {
        const base = VERTICE_Y + 21;
        triangulo(ctx, [[p.x, p.y], [p.x - p.ancho / 2, base], [p.x, base]], ajustar('#a7aab3', factor));
        triangulo(ctx, [[p.x, p.y], [p.x, base], [p.x + p.ancho / 2, base]], ajustar('#777a83', factor));
        const alto = Math.round((base - p.y) * 0.3);
        triangulo(ctx, [[p.x, p.y], [p.x - p.ancho * 0.16, p.y + alto], [p.x + p.ancho * 0.16, p.y + alto]], '#f4f7fb');
      }
      break;
    }
    default:
      break;
  }
}

/** Dibuja los 21 cuadros (7 terrenos x 3 variantes) en el contexto. */
export function dibujarAtlas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ATLAS_ANCHO, ATLAS_ALTO);
  for (const info of INFO_TERRENO) {
    for (let v = 0; v < VARIANTES_POR_TERRENO; v++) {
      const indice = indiceFrame(info.id, v);
      const r = rectFrame(indice);
      const factor = FACTOR_VARIANTE[v] ?? 1;
      const azar = crearAleatorio(1000 + indice * 17);
      ctx.save();
      ctx.translate(r.x, r.y);
      const color = ajustar(info.color, factor);
      trazarRombo(ctx);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.6; // sangrado: evita rendijas entre casillas contiguas
      ctx.strokeStyle = color;
      ctx.stroke();
      decorar(ctx, info.id, factor, azar);
      ctx.restore();
    }
  }
}
