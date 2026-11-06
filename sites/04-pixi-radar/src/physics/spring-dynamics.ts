/**
 * High-Density TypedArray Physics Simulation
 * Operates on contiguous Float32Array memory blocks for up to 50,000 active particles.
 */

export class SpringDynamics {
  public count: number;
  public posX: Float32Array;
  public posY: Float32Array;
  public origX: Float32Array;
  public origY: Float32Array;
  public velX: Float32Array;
  public velY: Float32Array;
  public radii: Float32Array;
  public angles: Float32Array;

  constructor(maxCount = 50000) {
    this.count = maxCount;
    this.posX = new Float32Array(maxCount);
    this.posY = new Float32Array(maxCount);
    this.origX = new Float32Array(maxCount);
    this.origY = new Float32Array(maxCount);
    this.velX = new Float32Array(maxCount);
    this.velY = new Float32Array(maxCount);
    this.radii = new Float32Array(maxCount);
    this.angles = new Float32Array(maxCount);
  }

  public initPolarDistribution(centerX: number, centerY: number, maxRadius: number): void {
    for (let i = 0; i < this.count; i++) {
      // Golden ratio spiral distribution for uniform radar density
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / this.count) * maxRadius;

      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      this.posX[i] = x;
      this.posY[i] = y;
      this.origX[i] = x;
      this.origY[i] = y;
      this.radii[i] = r;
      this.angles[i] = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    }
  }

  public applyShockwave(cx: number, cy: number, blastRadius = 240, force = 18): void {
    const blastSq = blastRadius * blastRadius;

    for (let i = 0; i < this.count; i++) {
      const dx = this.posX[i] - cx;
      const dy = this.posY[i] - cy;
      const distSq = dx * dx + dy * dy;

      if (distSq < blastSq && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const falloff = 1 - dist / blastRadius;
        const push = falloff * force;

        this.velX[i] += (dx / dist) * push;
        this.velY[i] += (dy / dist) * push;
      }
    }
  }

  public update(stiffness = 0.045, damping = 0.88): void {
    for (let i = 0; i < this.count; i++) {
      // Spring pull back to origin
      const dx = this.origX[i] - this.posX[i];
      const dy = this.origY[i] - this.posY[i];

      this.velX[i] = (this.velX[i] + dx * stiffness) * damping;
      this.velY[i] = (this.velY[i] + dy * stiffness) * damping;

      this.posX[i] += this.velX[i];
      this.posY[i] += this.velY[i];
    }
  }
}
