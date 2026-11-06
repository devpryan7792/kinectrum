/**
 * Fallback Diagnostic & Simulation Engine
 * Activates when WebGPU is unavailable or disabled in browser flags.
 */

export class FallbackDiagnosticsEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private count = 5000;
  private posX: Float32Array;
  private posY: Float32Array;
  private velX: Float32Array;
  private velY: Float32Array;
  private isRunning = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.posX = new Float32Array(this.count);
    this.posY = new Float32Array(this.count);
    this.velX = new Float32Array(this.count);
    this.velY = new Float32Array(this.count);

    this.initParticles();
    this.loop();
  }

  private initParticles(): void {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * Math.min(cx, cy) * 0.75;
      this.posX[i] = cx + Math.cos(angle) * r;
      this.posY[i] = cy + Math.sin(angle) * r;

      const speed = 1.2;
      this.velX[i] = -Math.sin(angle) * speed;
      this.velY[i] = Math.cos(angle) * speed;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    this.ctx.fillStyle = 'rgba(10, 10, 12, 0.25)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = '#7AA2F7';

    for (let i = 0; i < this.count; i++) {
      const dx = cx - this.posX[i];
      const dy = cy - this.posY[i];
      const dist = Math.sqrt(dx * dx + dy * dy) + 1.0;

      // Center gravity
      this.velX[i] += (dx / dist) * 0.25;
      this.velY[i] += (dy / dist) * 0.25;

      this.posX[i] += this.velX[i];
      this.posY[i] += this.velY[i];

      this.ctx.fillRect(this.posX[i], this.posY[i], 1.5, 1.5);
    }

    requestAnimationFrame(this.loop);
  };

  public destroy(): void {
    this.isRunning = false;
  }
}
