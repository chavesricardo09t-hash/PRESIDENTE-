import { describe, expect, it } from 'vitest';
import { EventBus } from './EventBus';

interface Eventos {
  numero: number;
  texto: { valor: string };
}

describe('EventBus', () => {
  it('entrega los datos a los oyentes', () => {
    const bus = new EventBus<Eventos>();
    const recibidos: number[] = [];
    bus.on('numero', (n) => recibidos.push(n));
    bus.emit('numero', 5);
    bus.emit('numero', 7);
    expect(recibidos).toEqual([5, 7]);
  });

  it('permite varios oyentes y eventos independientes', () => {
    const bus = new EventBus<Eventos>();
    let a = 0;
    let b = '';
    bus.on('numero', () => a++);
    bus.on('numero', () => a++);
    bus.on('texto', (t) => (b = t.valor));
    bus.emit('numero', 1);
    bus.emit('texto', { valor: 'hola' });
    expect(a).toBe(2);
    expect(b).toBe('hola');
  });

  it('deja de avisar tras cancelar la suscripción', () => {
    const bus = new EventBus<Eventos>();
    let veces = 0;
    const cancelar = bus.on('numero', () => veces++);
    bus.emit('numero', 1);
    cancelar();
    bus.emit('numero', 1);
    expect(veces).toBe(1);
    expect(bus.cantidadOyentes('numero')).toBe(0);
  });

  it('emitir sin oyentes no falla', () => {
    const bus = new EventBus<Eventos>();
    bus.emit('numero', 1);
    expect(bus.cantidadOyentes('texto')).toBe(0);
  });
});
