import { describe, expect, it } from 'vitest';
import { RegistroModulos } from './modulos';

describe('RegistroModulos', () => {
  it('registra, inicia y actualiza en orden de registro', () => {
    const registro = new RegistroModulos();
    const log: string[] = [];
    registro.registrar({ id: 'a', iniciar: () => log.push('iniciar a'), actualizar: (dt) => log.push('a ' + dt) });
    registro.registrar({ id: 'b', actualizar: (dt) => log.push('b ' + dt) });
    registro.actualizar(2);
    expect(log).toEqual(['iniciar a', 'a 2', 'b 2']);
    expect(registro.ids()).toEqual(['a', 'b']);
  });

  it('rechaza identificadores duplicados', () => {
    const registro = new RegistroModulos();
    registro.registrar({ id: 'x' });
    expect(() => registro.registrar({ id: 'x' })).toThrow();
  });

  it('obtiene módulos por id', () => {
    const registro = new RegistroModulos();
    registro.registrar({ id: 'economia' });
    expect(registro.obtener('economia')?.id).toBe('economia');
    expect(registro.obtener('no-existe')).toBe(undefined);
  });
});
