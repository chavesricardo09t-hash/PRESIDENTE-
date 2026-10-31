import { describe, expect, it } from 'vitest';
import { construirInforme, formatearFechaCompilacion, resumenPaso0 } from './verificacion';

describe('Paso 0 - verificación', () => {
  it('identifica el proyecto y el paso', () => {
    const resumen = resumenPaso0();
    expect(resumen.proyecto).toBe('PRESIDENTE');
    expect(resumen.paso).toBe(0);
  });

  it('formatea una fecha de compilación válida en UTC', () => {
    expect(formatearFechaCompilacion('2026-10-31T14:05:09.000Z')).toBe('2026-10-31 14:05 UTC');
  });

  it('no falla con una fecha inválida', () => {
    expect(formatearFechaCompilacion('no-es-una-fecha')).toBe('desconocida');
  });

  it('construye el informe línea por línea', () => {
    const informe = construirInforme({ Versión: '0.0.1', Conexión: 'En línea' });
    expect(informe).toBe('Versión: 0.0.1\nConexión: En línea');
  });
});
