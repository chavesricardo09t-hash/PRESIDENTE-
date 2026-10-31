// Lógica pura del Paso 0. No depende del navegador, por eso se puede probar de forma automática.

export interface ResumenPaso0 {
  proyecto: string;
  paso: number;
  descripcion: string;
}

export function resumenPaso0(): ResumenPaso0 {
  return {
    proyecto: 'PRESIDENTE',
    paso: 0,
    descripcion: 'Verificación del flujo de trabajo',
  };
}

export function formatearFechaCompilacion(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return 'desconocida';
  }
  return fecha.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export function construirInforme(datos: Record<string, string>): string {
  return Object.entries(datos)
    .map(([clave, valor]) => `${clave}: ${valor}`)
    .join('\n');
}
