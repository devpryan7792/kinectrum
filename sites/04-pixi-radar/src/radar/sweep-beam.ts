import { Graphics } from 'pixi.js';

export class RadarReticleGrid {
  public graphics: Graphics;
  public beamGraphics: Graphics;
  public sweepAngle = 0;
  public sweepSpeed = 1.4; // Radians per sec

  constructor() {
    this.graphics = new Graphics();
    this.beamGraphics = new Graphics();
  }

  public drawGrid(cx: number, cy: number, maxRadius: number): void {
    this.graphics.clear();

    // 1. Concentric Range Rings (4 rings)
    const ringCount = 4;
    for (let i = 1; i <= ringCount; i++) {
      const r = (i / ringCount) * maxRadius;
      this.graphics.circle(cx, cy, r);
      this.graphics.stroke({ width: 1, color: 0x7AA2F7, alpha: i === ringCount ? 0.35 : 0.12 });
    }

    // 2. Crosshair Axis Lines
    this.graphics.moveTo(cx - maxRadius, cy);
    this.graphics.lineTo(cx + maxRadius, cy);
    this.graphics.stroke({ width: 1, color: 0x7AA2F7, alpha: 0.15 });

    this.graphics.moveTo(cx, cy - maxRadius);
    this.graphics.lineTo(cx, cy + maxRadius);
    this.graphics.stroke({ width: 1, color: 0x7AA2F7, alpha: 0.15 });
  }

  public updateBeam(cx: number, cy: number, maxRadius: number, delta: number): number {
    this.sweepAngle = (this.sweepAngle + this.sweepSpeed * delta) % (Math.PI * 2);

    this.beamGraphics.clear();

    // Rotating Sweep Ray
    const endX = cx + Math.cos(this.sweepAngle) * maxRadius;
    const endY = cy + Math.sin(this.sweepAngle) * maxRadius;

    this.beamGraphics.moveTo(cx, cy);
    this.beamGraphics.lineTo(endX, endY);
    this.beamGraphics.stroke({ width: 1.5, color: 0x9ECE6A, alpha: 0.75 });

    return this.sweepAngle;
  }
}
