import gsap from 'gsap';

export type HorologyViewState = 'blueprint' | 'exploded' | 'specimen';

export class FlipLayoutManager {
  private rootElement: HTMLElement;
  private currentState: HorologyViewState = 'blueprint';
  private onStateChangeCallback?: (state: HorologyViewState) => void;

  constructor(rootElement: HTMLElement, onStateChange?: (state: HorologyViewState) => void) {
    this.rootElement = rootElement;
    this.onStateChangeCallback = onStateChange;
    this.applyState('blueprint');
  }

  public applyState(newState: HorologyViewState): void {
    if (this.currentState === newState && this.rootElement.classList.contains(`view-${newState}`)) {
      return;
    }

    const prevClass = `view-${this.currentState}`;
    const nextClass = `view-${newState}`;

    this.rootElement.classList.remove(prevClass);
    this.rootElement.classList.add(nextClass);

    this.currentState = newState;

    const chronometerWrap = this.rootElement.querySelector('.k-chronometer-wrap') as HTMLElement;
    const monumentWrap = this.rootElement.querySelector('.k-monument-wrap') as HTMLElement;
    const telemetryCards = this.rootElement.querySelectorAll('.k-telemetry-badge');

    if (newState === 'blueprint') {
      gsap.to(chronometerWrap, {
        scale: 1.0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      });
      gsap.to(monumentWrap, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    } else if (newState === 'exploded') {
      gsap.to(chronometerWrap, {
        scale: 1.15,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      });
      gsap.to(monumentWrap, {
        opacity: 0.35,
        y: -15,
        duration: 0.6,
        ease: 'power2.out'
      });
    } else if (newState === 'specimen') {
      gsap.to(chronometerWrap, {
        scale: 0.75,
        x: 120,
        y: -30,
        duration: 0.8,
        ease: 'power3.inOut'
      });
      gsap.to(monumentWrap, {
        opacity: 1,
        y: 10,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    gsap.fromTo(
      telemetryCards,
      { opacity: 0.4, scale: 0.98 },
      { opacity: 1, scale: 1.0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }
    );

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  public getState(): HorologyViewState {
    return this.currentState;
  }
}
