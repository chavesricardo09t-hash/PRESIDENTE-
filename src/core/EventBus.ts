// Bus de eventos tipado. Permite que módulos (mundo, interfaz, futuras fases)
// se comuniquen sin conocerse entre sí.

export class EventBus<E extends object> {
  private oyentes = new Map<keyof E, Set<(datos: never) => void>>();

  on<K extends keyof E>(evento: K, fn: (datos: E[K]) => void): () => void {
    let conjunto = this.oyentes.get(evento);
    if (!conjunto) {
      conjunto = new Set();
      this.oyentes.set(evento, conjunto);
    }
    conjunto.add(fn);
    return () => this.off(evento, fn);
  }

  off<K extends keyof E>(evento: K, fn: (datos: E[K]) => void): void {
    this.oyentes.get(evento)?.delete(fn);
  }

  emit<K extends keyof E>(evento: K, datos: E[K]): void {
    this.oyentes.get(evento)?.forEach((fn) => (fn as (d: E[K]) => void)(datos));
  }

  cantidadOyentes<K extends keyof E>(evento: K): number {
    return this.oyentes.get(evento)?.size ?? 0;
  }
}
