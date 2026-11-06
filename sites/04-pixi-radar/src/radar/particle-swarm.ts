import { Container, Sprite, Texture } from 'pixi.js';
import { SpringDynamics } from '../physics/spring-dynamics';

export class ParticleSwarm {
  public container: Container;
  public sprites: Sprite[] = [];
  public dynamics: SpringDynamics;
  public activeCount = 20000;
  private maxCount: number;

  constructor(texture: Texture, maxCount = 50000) {
    this.maxCount = maxCount;
    this.container = new Container();
    this.dynamics = new SpringDynamics(maxCount);

    // Pre-allocate all 50,000 sprites into a single container
    for (let i = 0; i < maxCount; i++) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.12);
      sprite.alpha = 0.25;
      sprite.visible = i < this.activeCount;

      this.container.addChild(sprite);
      this.sprites.push(sprite);
    }
  }

  public setActiveCount(count: number): void {
    const clamped = Math.min(this.maxCount, Math.max(1000, count));
    this.activeCount = clamped;

    for (let i = 0; i < this.maxCount; i++) {
      this.sprites[i].visible = i < clamped;
    }
  }

  public update(sweepAngle: number): void {
    const twoPi = Math.PI * 2;
    const beamWidth = 0.45; // Radians

    for (let i = 0; i < this.activeCount; i++) {
      const sprite = this.sprites[i];
      sprite.position.set(this.dynamics.posX[i], this.dynamics.posY[i]);

      // Calculate angular distance to radar sweep beam
      let angleDiff = (sweepAngle - this.dynamics.angles[i]) % twoPi;
      if (angleDiff < 0) angleDiff += twoPi;

      if (angleDiff < beamWidth) {
        // High luminosity inside sweep beam
        const factor = 1 - angleDiff / beamWidth;
        sprite.alpha = 0.35 + factor * 0.65;
        sprite.scale.set(0.12 + factor * 0.08);
      } else {
        // Slow exponential trail fade
        sprite.alpha = Math.max(0.15, sprite.alpha * 0.98);
        sprite.scale.set(0.12);
      }
    }
  }
}
