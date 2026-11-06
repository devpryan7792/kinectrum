/**
 * Underdamped Harmonic Oscillator
 * Simulates hairspring oscillation and mechanical escapement recoil.
 */

export interface HarmonicSpringConfig {
  naturalFrequency: number; // omega_n in rad/s
  dampingRatio: number;     // zeta (0 < zeta < 1 for underdamped)
  amplitude: number;        // theta_0
  phase?: number;
}

export class HarmonicSpring {
  private omega_n: number;
  private zeta: number;
  private amplitude: number;
  private phase: number;
  private omega_d: number; // Damped frequency

  constructor(config: HarmonicSpringConfig) {
    this.omega_n = config.naturalFrequency;
    this.zeta = Math.min(0.99, Math.max(0.01, config.dampingRatio));
    this.amplitude = config.amplitude;
    this.phase = config.phase || 0;

    // Damped natural frequency
    this.omega_d = this.omega_n * Math.sqrt(1 - this.zeta * this.zeta);
  }

  /**
   * Evaluate angular deflection at time t (in seconds)
   */
  public evaluate(t: number): number {
    const decay = Math.exp(-this.zeta * this.omega_n * t);
    const oscillation = Math.cos(this.omega_d * t + this.phase);
    return this.amplitude * decay * oscillation;
  }

  /**
   * Generates an array of path coordinates for an Archimedean spiral hairspring
   */
  public generateHairspringPath(coils: number, innerRadius: number, outerRadius: number, deflectionAngle: number): string {
    const points = 120;
    const totalAngle = coils * 2 * Math.PI + deflectionAngle;
    const radiusStep = (outerRadius - innerRadius) / totalAngle;

    let path = '';
    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * totalAngle;
      const r = innerRadius + theta * radiusStep;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      if (i === 0) {
        path += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
      } else {
        path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
    }

    return path;
  }
}
