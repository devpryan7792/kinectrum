/**
 * Zero-Layout-Thrashing Guard
 * Ensures that during active GSAP animation ticks, forbidden layout properties are never read.
 */

export class LayoutGuard {
  private inTick = false;
  private reflowViolations = 0;

  public beginTick(): void {
    this.inTick = true;
  }

  public endTick(): void {
    this.inTick = false;
  }

  public recordViolation(propName: string): void {
    if (this.inTick) {
      this.reflowViolations++;
      console.warn(`[LayoutGuard] FORBIDDEN LAYOUT READ: "${propName}" was read during active animation tick!`);
    }
  }

  public getViolations(): number {
    return this.reflowViolations;
  }
}

export const globalLayoutGuard = new LayoutGuard();
