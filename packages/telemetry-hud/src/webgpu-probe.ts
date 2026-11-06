export class WebGPUProbe {
  private activeDrawPasses = 0;
  private lastFrameDrawPasses = 0;

  public instrumentPassEncoder(passEncoder: any): void {
    if (!passEncoder || typeof passEncoder.draw !== 'function') return;

    const probe = this;
    const origDraw = passEncoder.draw;
    const origDrawIndexed = passEncoder.drawIndexed;

    passEncoder.draw = function (...args: any[]) {
      probe.activeDrawPasses++;
      return origDraw.apply(this, args);
    };

    if (origDrawIndexed) {
      passEncoder.drawIndexed = function (...args: any[]) {
        probe.activeDrawPasses++;
        return origDrawIndexed.apply(this, args);
      };
    }
  }

  public endFrame(): number {
    this.lastFrameDrawPasses = this.activeDrawPasses;
    this.activeDrawPasses = 0;
    return this.lastFrameDrawPasses;
  }

  public getLastFrameDrawPasses(): number {
    return this.lastFrameDrawPasses;
  }
}
