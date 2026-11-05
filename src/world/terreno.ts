export const Terreno = {
  AguaProfunda: 0,
  Agua: 1,
  Arena: 2,
  Pradera: 3,
  Bosque: 4,
  Colina: 5,
  Montana: 6,
} as const;

export type IdTerreno = (typeof Terreno)[keyof typeof Terreno];

export interface InfoTerreno {
  id: IdTerreno;
  nombre: string;
  color: string;
  transitable: boolean;
}

export const INFO_TERRENO: readonly InfoTerreno[] = [
  { id: Terreno.AguaProfunda, nombre: 'Mar profundo', color: '#1c4f8c', transitable: false },
  { id: Terreno.Agua, nombre: 'Agua poco profunda', color: '#2f84c8', transitable: false },
  { id: Terreno.Arena, nombre: 'Arena', color: '#e2cf8e', transitable: true },
  { id: Terreno.Pradera, nombre: 'Pradera', color: '#7cb862', transitable: true },
  { id: Terreno.Bosque, nombre: 'Bosque', color: '#559b4c', transitable: true },
  { id: Terreno.Colina, nombre: 'Colina', color: '#a8a363', transitable: true },
  { id: Terreno.Montana, nombre: 'Montaña', color: '#8d8f96', transitable: false },
];

export const CANTIDAD_TERRENOS = INFO_TERRENO.length;
export const VARIANTES_POR_TERRENO = 3;
