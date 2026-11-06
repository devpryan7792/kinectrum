import Lenis from 'lenis';

export class LenisController {
  public lenis: Lenis;
  public scrollY = 0;
  public velocity = 0;
  public direction = 0;

  constructor() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8
    });

    this.lenis.on('scroll', (e: any) => {
      this.scrollY = e.scroll;
      this.velocity = e.velocity;
      this.direction = e.direction;
    });
  }

  public raf(time: number): void {
    this.lenis.raf(time);
  }

  public resize(): void {
    this.lenis.resize();
  }

  public destroy(): void {
    this.lenis.destroy();
  }
}
