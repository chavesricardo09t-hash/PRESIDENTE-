import type { MapaMundo } from './mapa';
import { fbm, hash2 } from './ruido';
import { Terreno, VARIANTES_POR_TERRENO } from './terreno';

export interface ParametrosMapa {
  ancho: number;
  alto: number;
  semilla: number;
}

export const TAMANO_MAXIMO = 1024;

/**
 * Proporciones objetivo por percentil de elevación (acumuladas, de 0 a 1).
 * Al repartir por percentiles, cualquier semilla produce las mismas proporciones
 * de mar, llanura, colinas y montañas; la semilla solo cambia la forma del mundo.
 */
export const PERCENTILES = {
  marProfundo: 0.14,
  agua: 0.25,
  arena: 0.3,
  llanura: 0.82,
  colina: 0.94,
  // el resto (6 %) es montaña
} as const;

const HUMEDAD_BOSQUE = 0.54;
const ESCALA_RELIEVE = 1 / 22;
const ESCALA_HUMEDAD = 1 / 14;

export function generarMapa(parametros: ParametrosMapa): MapaMundo {
  const { ancho, alto, semilla } = parametros;
  if (!Number.isInteger(ancho) || !Number.isInteger(alto) || ancho < 1 || alto < 1) {
    throw new Error('El tamaño del mapa debe ser entero y positivo');
  }
  if (ancho > TAMANO_MAXIMO || alto > TAMANO_MAXIMO) {
    throw new Error(`El tamaño máximo del mapa es ${TAMANO_MAXIMO}`);
  }

  const total = ancho * alto;

  // 1) Elevación continua: ruido fractal + máscara de isla (los bordes bajan hacia el mar).
  const continua = new Float32Array(total);
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const base = fbm(x * ESCALA_RELIEVE, y * ESCALA_RELIEVE, semilla, 4);
      const dx = ((x + 0.5) / ancho) * 2 - 1;
      const dy = ((y + 0.5) / alto) * 2 - 1;
      const distancia = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 1.05);
      const mascara = 1 - Math.pow(distancia, 2.4);
      continua[y * ancho + x] = base * 0.65 + mascara * 0.45;
    }
  }

  // 2) Cortes por percentil sobre la distribución real de este mapa.
  const ordenados = Float32Array.from(continua).sort();
  const corte = (p: number): number => ordenados[Math.min(total - 1, Math.floor(p * total))] as number;
  const cMar = corte(PERCENTILES.marProfundo);
  const cAgua = corte(PERCENTILES.agua);
  const cArena = corte(PERCENTILES.arena);
  const cLlanura = corte(PERCENTILES.llanura);
  const cColina = corte(PERCENTILES.colina);
  const minimo = ordenados[0] as number;
  const rangoElevacion = Math.max(1e-9, (ordenados[total - 1] as number) - minimo);

  // 3) Terreno, elevación en bytes y variante visual por casilla.
  const terreno = new Uint8Array(total);
  const elevacion = new Uint8Array(total);
  const variante = new Uint8Array(total);

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const i = y * ancho + x;
      const e = continua[i] as number;

      if (e < cMar) terreno[i] = Terreno.AguaProfunda;
      else if (e < cAgua) terreno[i] = Terreno.Agua;
      else if (e < cArena) terreno[i] = Terreno.Arena;
      else if (e < cLlanura) {
        const humedad = fbm(x * ESCALA_HUMEDAD, y * ESCALA_HUMEDAD, semilla + 7919, 3);
        terreno[i] = humedad > HUMEDAD_BOSQUE ? Terreno.Bosque : Terreno.Pradera;
      } else if (e < cColina) terreno[i] = Terreno.Colina;
      else terreno[i] = Terreno.Montana;

      elevacion[i] = Math.round(((e - minimo) / rangoElevacion) * 255);
      variante[i] = Math.min(
        VARIANTES_POR_TERRENO - 1,
        Math.floor(hash2(x, y, semilla + 31) * VARIANTES_POR_TERRENO),
      );
    }
  }

  return { ancho, alto, semilla, terreno, elevacion, variante };
}
