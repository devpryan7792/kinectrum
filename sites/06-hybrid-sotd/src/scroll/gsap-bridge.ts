import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisController } from './lenis-controller';

export function bridgeLenisAndGSAP(controller: LenisController): void {
  gsap.registerPlugin(ScrollTrigger);

  // Synchronize Lenis scroll event to ScrollTrigger
  controller.lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP's high-precision internal ticker
  gsap.ticker.add((time: number) => {
    controller.raf(time * 1000);
  });

  // Zero lag-smoothing prevents timeline desync during heavy frame spikes
  gsap.ticker.lagSmoothing(0);
}
