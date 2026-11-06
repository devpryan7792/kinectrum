/**
 * Magnetic Cursor & Force Field Dynamics
 * Inverse-square pull with singularity dampening.
 */

export interface MagneticTarget {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export class MagneticField {
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private velocityX = 0;
  private velocityY = 0;

  // Configuration
  private radius: number;
  private stiffness: number;
  private damping: number;
  private epsilon: number; // Singularity damping constant

  constructor(radius = 140, stiffness = 0.12, damping = 0.78, epsilon = 25) {
    this.radius = radius;
    this.stiffness = stiffness;
    this.damping = damping;
    this.epsilon = epsilon;
  }

  public setPointer(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  public update(): { x: number; y: number; vx: number; vy: number; speed: number } {
    // Spring physics update
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;

    this.velocityX = (this.velocityX + dx * this.stiffness) * this.damping;
    this.velocityY = (this.velocityY + dy * this.stiffness) * this.damping;

    this.currentX += this.velocityX;
    this.currentY += this.velocityY;

    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);

    return {
      x: this.currentX,
      y: this.currentY,
      vx: this.velocityX,
      vy: this.velocityY,
      speed
    };
  }

  /**
   * Calculates magnetic displacement for an interactive target element
   */
  public calculateDeflection(targetCenterX: number, targetCenterY: number): { dx: number; dy: number; factor: number } {
    const rx = this.currentX - targetCenterX;
    const ry = this.currentY - targetCenterY;
    const dist = Math.sqrt(rx * rx + ry * ry);

    if (dist > this.radius || dist === 0) {
      return { dx: 0, dy: 0, factor: 0 };
    }

    // Normalized falloff (1 at center, 0 at outer boundary)
    const falloff = 1 - dist / this.radius;
    // Damped force preventing explosive acceleration near 0
    const factor = falloff * (1 - this.epsilon / (dist + this.epsilon));

    return {
      dx: rx * factor * 0.45,
      dy: ry * factor * 0.45,
      factor
    };
  }
}
