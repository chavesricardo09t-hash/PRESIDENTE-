import Phaser from 'phaser';
import { crearTexturas } from './texturas';

export class EscenaArranque extends Phaser.Scene {
  constructor() {
    super('EscenaArranque');
  }

  create(): void {
    crearTexturas(this);
    this.scene.start('EscenaMapa');
  }
}
