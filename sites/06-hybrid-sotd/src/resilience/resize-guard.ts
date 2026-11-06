import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisController } from '../scroll/lenis-controller';
import { BackgroundScene } from '../webgl/background-scene';

export function setupResilienceGuard(
  lenisController: LenisController,
  bgScene: BackgroundScene
): void {
  function handleSync() {
    bgScene.resize(window.innerWidth, window.innerHeight);
    lenisController.resize();
    ScrollTrigger.refresh();
  }

  // 1. Wait for web fonts to load
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      handleSync();
    });
  }

  // 2. Debounced window resize
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeTimeout);
    resizeTimeout = requestAnimationFrame(handleSync);
  });

  // 3. ResizeObserver on document body to catch dynamic DOM height changes
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(handleSync);
    });
    observer.observe(document.body);
  }
}
