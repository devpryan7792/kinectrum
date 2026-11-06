import gsap from 'gsap';

export class TypographyMonument {
  private container: HTMLElement;
  private headerEl!: HTMLElement;
  private charSpans: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.buildDOM();
    this.setupEntrance();
  }

  private buildDOM(): void {
    this.headerEl = document.createElement('div');
    this.headerEl.className = 'k-type-monument';

    const titleText = 'KINETIC CHRONOMETER';
    const subtitleText = 'CALIBER 01 // MECHANICAL ESCAPEMENT';

    this.headerEl.innerHTML = `
      <div class="k-type-eyebrow">SWISS EDITORIAL ARCHIVE — SPECIMEN 01</div>
      <h1 class="k-type-title" aria-label="${titleText}"></h1>
      <div class="k-type-sub">${subtitleText}</div>
      <div class="k-type-meta">
        <span>FREQ: 28,800 VPH (4 HZ)</span>
        <span>•</span>
        <span>JEWELS: 32 RUBIES</span>
        <span>•</span>
        <span>TOLERANCE: ±0.001 MM</span>
      </div>
    `;

    const titleContainer = this.headerEl.querySelector('.k-type-title') as HTMLElement;

    // Split text into character spans
    titleText.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'k-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      titleContainer.appendChild(span);
      this.charSpans.push(span);
    });

    this.container.appendChild(this.headerEl);
  }

  private setupEntrance(): void {
    gsap.from(this.charSpans, {
      y: 60,
      opacity: 0,
      rotateX: -45,
      stagger: 0.025,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2
    });

    const eyebrow = this.headerEl.querySelector('.k-type-eyebrow')!;
    const sub = this.headerEl.querySelector('.k-type-sub')!;
    const meta = this.headerEl.querySelector('.k-type-meta')!;

    gsap.from([eyebrow, sub, meta], {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      duration: 1.0,
      ease: 'power2.out',
      delay: 0.5
    });
  }

  public setScrub(progress: number): void {
    // Wave-like character displacement on timeline scrub
    this.charSpans.forEach((span, idx) => {
      const offset = Math.sin(progress * Math.PI * 4 + idx * 0.3) * 15;
      const rotate = Math.cos(progress * Math.PI * 4 + idx * 0.3) * 8;
      gsap.set(span, {
        y: offset,
        rotationZ: rotate
      });
    });
  }
}
