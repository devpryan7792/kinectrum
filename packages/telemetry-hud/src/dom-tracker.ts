export class DOMTracker {
  private nodeCount = 0;
  private lastSampleTime = 0;
  private sampleIntervalMs = 1000; // Sample only once per second

  public sample(): number {
    const now = performance.now();
    if (now - this.lastSampleTime >= this.sampleIntervalMs) {
      this.lastSampleTime = now;
      if (typeof document !== 'undefined') {
        this.nodeCount = document.getElementsByTagName('*').length;
      }
    }
    return this.nodeCount;
  }

  public getNodeCount(): number {
    return this.nodeCount;
  }
}
