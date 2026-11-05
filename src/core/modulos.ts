// Contrato para los módulos de simulación de fases futuras (economía, ciudadanos, política...).
// En la Fase 1 NO se implementa ninguno: esto solo deja el punto de enchufe preparado.

export interface ModuloSimulacion {
  readonly id: string;
  iniciar?(): void;
  /** dtSimulacion: tiempo de simulación transcurrido, en segundos del calendario del juego. */
  actualizar?(dtSimulacion: number): void;
}

export class RegistroModulos {
  private modulos: ModuloSimulacion[] = [];

  registrar(modulo: ModuloSimulacion): void {
    if (this.modulos.some((m) => m.id === modulo.id)) {
      throw new Error(`Módulo duplicado: ${modulo.id}`);
    }
    this.modulos.push(modulo);
    modulo.iniciar?.();
  }

  obtener(id: string): ModuloSimulacion | undefined {
    return this.modulos.find((m) => m.id === id);
  }

  ids(): string[] {
    return this.modulos.map((m) => m.id);
  }

  actualizar(dtSimulacion: number): void {
    for (const modulo of this.modulos) {
      modulo.actualizar?.(dtSimulacion);
    }
  }
}
