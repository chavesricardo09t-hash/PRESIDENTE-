import type { MapaMundo } from './mapa';
import { centroCasilla, construirVecinos, coordenadasSuelo } from './disposicion';
import { crearAleatorio, fbm, hash2 } from './ruido';
import { Terreno, VARIANTES_POR_TERRENO } from './terreno';

/** `ancho` = columnas y `alto` = filas de la disposición escalonada (ver disposicion.ts). */
export interface ParametrosMapa {
  ancho: number;
  alto: number;
  semilla: number;
}

export interface DetalleMapa {
  mapa: MapaMundo;
  /** Ríos trazados y casillas de río (incluye las desembocaduras protegidas). */
  rios: number;
  casillasRio: number;
  /** Masas de agua conectadas (mares, lagos y ríos unidos a ellos). */
  cuerposAgua: number;
  menorCuerpoAgua: number;
  /** Fragmentos de agua diminutos convertidos en tierra en la comprobación final. */
  fragmentosCorregidos: number;
}

export const TAMANO_MAXIMO = 1024;

/** Proporciones exactas por tipo (suman 1). Los ríos se descuentan del agua poco profunda. */
export const PROPORCIONES = {
  marProfundo: 0.14,
  agua: 0.11,
  arena: 0.05,
  pradera: 0.28,
  bosque: 0.24,
  colina: 0.12,
  montana: 0.06,
} as const;

const ESCALA_RELIEVE = 1 / 22;
const ESCALA_HUMEDAD = 1 / 14;
const FRACCION_AGUA = PROPORCIONES.marProfundo + PROPORCIONES.agua;
const FRACCION_FUENTES = 0.78; // los ríos nacen en el 22 % más alto
const FRACCION_MAX_RIOS = 0.03;

/** Una masa de agua menor que esto es una "charca sin sentido": se elimina. */
export function tamanoMinimoAgua(total: number): number {
  return Math.max(12, Math.round(total / 600));
}

function cuantil(valores: Float32Array, p: number): number {
  const ordenados = Float32Array.from(valores).sort();
  return ordenados[Math.min(ordenados.length - 1, Math.floor(p * ordenados.length))] as number;
}

/** Componentes conexas (por aristas) de las casillas con mascara = 1. */
function componentes(mascara: Uint8Array, vecinos: Int32Array): { id: Int32Array; tamanos: number[] } {
  const total = mascara.length;
  const id = new Int32Array(total).fill(-1);
  const tamanos: number[] = [];
  const pila = new Int32Array(total);
  for (let inicio = 0; inicio < total; inicio++) {
    if (!mascara[inicio] || id[inicio] !== -1) continue;
    const numero = tamanos.length;
    let cima = 0;
    let tamano = 0;
    pila[cima++] = inicio;
    id[inicio] = numero;
    while (cima > 0) {
      const i = pila[--cima] as number;
      tamano++;
      for (let k = 0; k < 4; k++) {
        const v = vecinos[i * 4 + k] as number;
        if (v >= 0 && mascara[v] && id[v] === -1) {
          id[v] = numero;
          pila[cima++] = v;
        }
      }
    }
    tamanos.push(tamano);
  }
  return { id, tamanos };
}

/** Elimina masas de agua diminutas elevando su terreno; el corte se recalcula y se repite. */
function quitarCharcas(elev: Float32Array, vecinos: Int32Array, minimo: number): void {
  const total = elev.length;
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    const corte = cuantil(elev, FRACCION_AGUA);
    const tierra = cuantil(elev, FRACCION_AGUA + PROPORCIONES.arena);
    const mascara = new Uint8Array(total);
    for (let i = 0; i < total; i++) mascara[i] = (elev[i] as number) < corte ? 1 : 0;
    const { id, tamanos } = componentes(mascara, vecinos);
    let cambios = 0;
    for (let i = 0; i < total; i++) {
      if (mascara[i] && (tamanos[id[i] as number] as number) < minimo) {
        elev[i] = tierra;
        cambios++;
      }
    }
    if (cambios === 0) return;
  }
}

interface ResultadoRios {
  rio: Uint8Array; // 0 = no; 1 = casilla de río (antes tierra); 2 = desembocadura (casilla de agua protegida)
  rios: number;
}

/**
 * Los ríos nacen en tierras altas y siguen la pendiente hacia abajo (por aristas) hasta llegar a
 * un mar, un lago u otro río. Si no lo consiguen, se descartan: ningún río queda cortado.
 */
function trazarRios(
  elev: Float32Array,
  vecinos: Int32Array,
  columnas: number,
  semilla: number,
  corteAgua: number,
): ResultadoRios {
  const total = elev.length;
  const rio = new Uint8Array(total);
  const azar = crearAleatorio(semilla + 555);
  const umbralFuente = cuantil(elev, FRACCION_FUENTES);
  const candidatos: number[] = [];
  for (let i = 0; i < total; i++) if ((elev[i] as number) >= umbralFuente) candidatos.push(i);

  const objetivo = Math.max(1, Math.round(Math.sqrt(total) / 12));
  const maxCasillas = Math.floor(total * FRACCION_MAX_RIOS);
  const distanciaMinima = 18; // en unidades del suelo
  const fuentes: Array<{ x: number; y: number }> = [];
  let rios = 0;
  let casillas = 0;
  const posicion = (i: number): { x: number; y: number } => {
    const c = centroCasilla(i % columnas, Math.floor(i / columnas));
    return coordenadasSuelo(c.x, c.y);
  };

  for (let intento = 0; intento < objetivo * 40 && rios < objetivo && casillas < maxCasillas; intento++) {
    if (candidatos.length === 0) break;
    const origen = candidatos[Math.floor(azar() * candidatos.length)] as number;
    if (rio[origen]) continue;
    const p = posicion(origen);
    if (fuentes.some((f) => Math.hypot(f.x - p.x, f.y - p.y) < distanciaMinima)) continue;

    const camino: number[] = [];
    const visto = new Set<number>();
    let actual = origen;
    let subidas = 0;
    let desembocadura = -1;
    for (let paso = 0; paso < 700; paso++) {
      camino.push(actual);
      visto.add(actual);
      let mejor = -1;
      let mejorElev = Infinity;
      for (let k = 0; k < 4; k++) {
        const v = vecinos[actual * 4 + k] as number;
        if (v < 0 || visto.has(v)) continue;
        if ((elev[v] as number) < mejorElev) {
          mejorElev = elev[v] as number;
          mejor = v;
        }
      }
      if (mejor < 0) break;
      if (mejorElev >= (elev[actual] as number) && ++subidas > 6) break;
      if (mejorElev < corteAgua || rio[mejor] !== 0) {
        desembocadura = mejor;
        break;
      }
      actual = mejor;
    }
    if (desembocadura < 0) continue;

    for (const i of camino) if (!rio[i]) { rio[i] = 1; casillas++; }
    if (rio[desembocadura] === 0) rio[desembocadura] = 2;
    fuentes.push(p);
    rios++;
  }
  return { rio, rios };
}

/** Distancia (en casillas, por aristas) hasta la casilla de agua más cercana. */
function distanciaAlAgua(esAgua: Uint8Array, vecinos: Int32Array): Int16Array {
  const total = esAgua.length;
  const dist = new Int16Array(total).fill(-1);
  const cola = new Int32Array(total);
  let cabeza = 0;
  let final = 0;
  for (let i = 0; i < total; i++) {
    if (esAgua[i]) {
      dist[i] = 0;
      cola[final++] = i;
    }
  }
  while (cabeza < final) {
    const i = cola[cabeza++] as number;
    for (let k = 0; k < 4; k++) {
      const v = vecinos[i * 4 + k] as number;
      if (v >= 0 && dist[v] === -1) {
        dist[v] = (dist[i] as number) + 1;
        cola[final++] = v;
      }
    }
  }
  return dist;
}

export function generarMapaConDetalle(parametros: ParametrosMapa): DetalleMapa {
  const { ancho: columnas, alto: filas, semilla } = parametros;
  if (!Number.isInteger(columnas) || !Number.isInteger(filas) || columnas < 1 || filas < 1) {
    throw new Error('El tamaño del mapa debe ser entero y positivo');
  }
  if (columnas > TAMANO_MAXIMO || filas > TAMANO_MAXIMO) {
    throw new Error(`El tamaño máximo del mapa es ${TAMANO_MAXIMO}`);
  }

  const total = columnas * filas;
  const vecinos = construirVecinos(columnas, filas);
  const suelo = new Float32Array(total * 2); // coordenadas del suelo por casilla
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const centro = centroCasilla(c, f);
      const g = coordenadasSuelo(centro.x, centro.y);
      suelo[(f * columnas + c) * 2] = g.x;
      suelo[(f * columnas + c) * 2 + 1] = g.y;
    }
  }

  // 1) Relieve continuo, muestreado en el suelo para que las formas no se estiren en pantalla.
  const elev = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    elev[i] = fbm((suelo[i * 2] as number) * ESCALA_RELIEVE, (suelo[i * 2 + 1] as number) * ESCALA_RELIEVE, semilla, 4);
  }

  // 2) Sin charcas aisladas: el agua forma mares y lagos de tamaño razonable.
  const minimoAgua = tamanoMinimoAgua(total);
  quitarCharcas(elev, vecinos, minimoAgua);

  // 3) Ríos desde las tierras altas hasta el agua.
  const corteAgua = cuantil(elev, FRACCION_AGUA);
  const { rio, rios } = trazarRios(elev, vecinos, columnas, semilla, corteAgua);
  let casillasRio = 0;
  for (let i = 0; i < total; i++) if (rio[i]) casillasRio++;

  // 4) Reparto exacto por conteo. Las casillas de río salen del presupuesto de agua poco profunda.
  const reserva: number[] = [];
  for (let i = 0; i < total; i++) if (!rio[i]) reserva.push(i);
  reserva.sort((a, b) => (elev[a] as number) - (elev[b] as number) || a - b);

  const nProfundo = Math.round(PROPORCIONES.marProfundo * total);
  const nAgua = Math.max(0, Math.round(PROPORCIONES.agua * total) - casillasRio);
  const nArena = Math.round(PROPORCIONES.arena * total);
  const nLlanura = Math.round((PROPORCIONES.pradera + PROPORCIONES.bosque) * total);
  const nColina = Math.round(PROPORCIONES.colina * total);
  const nBosque = Math.round(PROPORCIONES.bosque * total);

  const SIN_ASIGNAR = 255;
  const terreno = new Uint8Array(total).fill(SIN_ASIGNAR);
  for (let i = 0; i < total; i++) if (rio[i]) terreno[i] = Terreno.Agua;
  reserva.forEach((indice, posicion) => {
    if (posicion < nProfundo) terreno[indice] = Terreno.AguaProfunda;
    else if (posicion < nProfundo + nAgua) terreno[indice] = Terreno.Agua;
  });
  const tierra = reserva.slice(nProfundo + nAgua);

  const esAgua = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    esAgua[i] = terreno[i] === Terreno.AguaProfunda || terreno[i] === Terreno.Agua ? 1 : 0;
  }
  const dist = distanciaAlAgua(esAgua, vecinos);
  const distancia = (i: number): number => {
    const d = dist[i] as number;
    return d < 0 ? 10 : d;
  };

  // 5) Arena: tierra baja Y cercana al agua, así las playas siguen las costas, lagos y ríos.
  const clave = new Float64Array(total);
  tierra.forEach((indice, posicion) => {
    clave[indice] = posicion / tierra.length + 0.03 * Math.min(distancia(indice), 10);
  });
  const porCercania = [...tierra].sort((a, b) => (clave[a] as number) - (clave[b] as number) || a - b);
  const esArena = new Uint8Array(total);
  for (let k = 0; k < Math.min(nArena, porCercania.length); k++) {
    const indice = porCercania[k] as number;
    esArena[indice] = 1;
    terreno[indice] = Terreno.Arena;
  }

  // 6) Llanura, colinas y montañas por altura (en orden de elevación).
  const llanura: number[] = [];
  tierra
    .filter((i) => !esArena[i])
    .forEach((indice, posicion) => {
      if (posicion < nLlanura) llanura.push(indice);
      else if (posicion < nLlanura + nColina) terreno[indice] = Terreno.Colina;
      else terreno[indice] = Terreno.Montana;
    });

  // 7) Bosque en las zonas más húmedas, favorecidas cerca del agua; el resto, pradera.
  const humedad = new Float64Array(total);
  for (const i of llanura) {
    humedad[i] =
      fbm((suelo[i * 2] as number) * ESCALA_HUMEDAD, (suelo[i * 2 + 1] as number) * ESCALA_HUMEDAD, semilla + 7919, 3) +
      0.1 * (1 - Math.min(distancia(i), 8) / 8);
  }
  [...llanura]
    .sort((a, b) => (humedad[b] as number) - (humedad[a] as number) || a - b)
    .forEach((indice, posicion) => {
      terreno[indice] = posicion < nBosque ? Terreno.Bosque : Terreno.Pradera;
    });

  // 8) Comprobación final: ningún fragmento de agua diminuto sin sentido.
  let fragmentosCorregidos = 0;
  {
    const { id, tamanos } = componentes(esAgua, vecinos);
    for (let i = 0; i < total; i++) {
      if (esAgua[i] && (tamanos[id[i] as number] as number) < minimoAgua) {
        terreno[i] = Terreno.Arena;
        esAgua[i] = 0;
        fragmentosCorregidos++;
      }
    }
  }
  const final = componentes(esAgua, vecinos);

  // 9) Elevación en bytes y variante visual.
  let minimo = Infinity;
  let maximo = -Infinity;
  for (let i = 0; i < total; i++) {
    minimo = Math.min(minimo, elev[i] as number);
    maximo = Math.max(maximo, elev[i] as number);
  }
  const rango = Math.max(1e-9, maximo - minimo);
  const elevacion = new Uint8Array(total);
  const variante = new Uint8Array(total);
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const i = f * columnas + c;
      elevacion[i] = Math.round((((elev[i] as number) - minimo) / rango) * 255);
      variante[i] = Math.min(VARIANTES_POR_TERRENO - 1, Math.floor(hash2(c, f, semilla + 31) * VARIANTES_POR_TERRENO));
    }
  }

  return {
    mapa: { ancho: columnas, alto: filas, semilla, terreno, elevacion, variante },
    rios,
    casillasRio,
    cuerposAgua: final.tamanos.length,
    menorCuerpoAgua: final.tamanos.length ? Math.min(...final.tamanos) : 0,
    fragmentosCorregidos,
  };
}

export function generarMapa(parametros: ParametrosMapa): MapaMundo {
  return generarMapaConDetalle(parametros).mapa;
}
