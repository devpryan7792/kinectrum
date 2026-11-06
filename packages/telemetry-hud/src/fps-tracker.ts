export class FPSTracker {
  private lastTime = performance.now();
  private frameCount = 0;
  private fpsHistory: Float32Array = new Float32Array(60); // 60 frames rolling history
  private historyIndex = 0;

  public currentFps = 60;
  public smoothedFps = 60;
  public frameDeltaMs = 16.67;
  public minFps = 60;
  public maxFps = 60;

  public tick(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (delta <= 0) return;

    this.frameDeltaMs = delta;
    const instantFps = Math.min(240, 1000 / delta);

    // Exponential smoothing
    this.smoothedFps = this.smoothedFps * 0.9 + instantFps * 0.1;
    this.currentFps = Math.round(instantFps);

    // Track min / max after initial warm-up (30 frames)
    this.frameCount++;
    if (this.frameCount > 30) {
      if (this.smoothedFps < this.minFps) this.minFps = Math.round(this.smoothedFps);
      if (this.smoothedFps > this.maxFps) this.maxFps = Math.round(this.smoothedFps);
    } else {
      this.minFps = Math.round(this.smoothedFps);
      this.maxFps = Math.round(this.smoothedFps);
    }

    // Save to rolling buffer
    this.fpsHistory[this.historyIndex] = instantFps;
    this.historyIndex = (this.historyIndex + 1) % 60;
  }

  public renderSparkline(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);

    // Target 60fps baseline guide line
    const y60 = height - (60 / 90) * height;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y60);
    ctx.lineTo(width, y60);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw graph line
    ctx.beginPath();
    ctx.lineWidth = 1.5;

    const step = width / 59;
    for (let i = 0; i < 60; i++) {
      const idx = (this.historyIndex + i) % 60;
      const fps = this.fpsHistory[idx] || 60;
      // Clamp between 0 and 90 FPS for visualization scale
      const normalized = Math.min(1, Math.max(0, fps / 90));
      const x = i * step;
      const y = height - normalized * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Color based on smoothed FPS
    if (this.smoothedFps >= 55) {
      ctx.strokeStyle = '#9ECE6A'; // Phosphor green (TokyoNight)
    } else if (this.smoothedFps >= 30) {
      ctx.strokeStyle = '#E0AF68'; // Warm yellow
    } else {
      ctx.strokeStyle = '#F7768E'; // Signal red/coral
    }

    ctx.stroke();
  }
}
