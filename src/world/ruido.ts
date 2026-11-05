// Ruido determinista basado solo en aritmética entera y operaciones básicas:
// la misma semilla produce siempre el mismo resultado en cualquier dispositivo.

export function crearAleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x: number, y: number, semilla: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(semilla | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function suavizar(t: number): number {
  return t * t * (3 - 2 * t);
}

export function ruidoValor(x: number, y: number, semilla: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = suavizar(x - x0);
  const ty = suavizar(y - y0);
  const a = hash2(x0, y0, semilla);
  const b = hash2(x0 + 1, y0, semilla);
  const c = hash2(x0, y0 + 1, semilla);
  const d = hash2(x0 + 1, y0 + 1, semilla);
  const arriba = a + (b - a) * tx;
  const abajo = c + (d - c) * tx;
  return arriba + (abajo - arriba) * ty;
}

/** Ruido fractal normalizado a [0, 1]. */
export function fbm(x: number, y: number, semilla: number, octavas = 4): number {
  let suma = 0;
  let amplitud = 1;
  let frecuencia = 1;
  let total = 0;
  for (let i = 0; i < octavas; i++) {
    suma += ruidoValor(x * frecuencia, y * frecuencia, semilla + i * 1013) * amplitud;
    total += amplitud;
    amplitud *= 0.5;
    frecuencia *= 2;
  }
  return suma / total;
}
