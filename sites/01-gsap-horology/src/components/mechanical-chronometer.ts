import gsap from 'gsap';
import { generateInvoluteGearPath, generateVernierScaleTicks } from '../math/gear-geometry';
import { HarmonicSpring } from '../math/harmonic-spring';

export class MechanicalChronometer {
  private container: HTMLElement;
  private svg!: SVGSVGElement;
  private gearGroup!: SVGGElement;
  private stressGroup!: SVGGElement;
  private hairspringPath!: SVGPathElement;
  private hairspring!: HarmonicSpring;

  private isStressMode = false;
  private stressPaths: SVGPathElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initSVG();
    this.buildAssembly();
    this.setupAnimations();
  }

  private initSVG(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', '-400 -400 800 800');
    this.svg.setAttribute('class', 'k-chronometer-svg');
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.maxHeight = '720px';
    this.svg.style.display = 'block';

    this.gearGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.gearGroup.setAttribute('class', 'k-gear-group');

    this.stressGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.stressGroup.setAttribute('class', 'k-stress-group');
    this.stressGroup.style.display = 'none';

    this.svg.appendChild(this.gearGroup);
    this.svg.appendChild(this.stressGroup);
    this.container.appendChild(this.svg);

    this.hairspring = new HarmonicSpring({
      naturalFrequency: 16.0,
      dampingRatio: 0.15,
      amplitude: 15
    });
  }

  private buildAssembly(): void {
    // 1. Outer Chassis Ring & Vernier Caliper Scale
    const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerRing.setAttribute('r', '360');
    outerRing.setAttribute('class', 'k-svg-ring k-ring-chassis');
    this.gearGroup.appendChild(outerRing);

    const vernierScale = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    vernierScale.setAttribute('d', generateVernierScaleTicks(355, 120, 16));
    vernierScale.setAttribute('class', 'k-svg-ticks k-scale-major');
    this.gearGroup.appendChild(vernierScale);

    const innerVernierScale = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    innerVernierScale.setAttribute('d', generateVernierScaleTicks(330, 240, 8));
    innerVernierScale.setAttribute('class', 'k-svg-ticks k-scale-minor');
    this.gearGroup.appendChild(innerVernierScale);

    // 2. Primary Ring Gear (Ring 1, 96 teeth, module 3.2)
    const ringGear = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ringGear.setAttribute('d', generateInvoluteGearPath({ teeth: 64, module: 4.8, boreRadius: 280 }));
    ringGear.setAttribute('class', 'k-svg-gear k-gear-ring-1');
    this.gearGroup.appendChild(ringGear);

    // 3. Planetary Drive Gear (Ring 2, 48 teeth)
    const planetGear = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    planetGear.setAttribute('d', generateInvoluteGearPath({ teeth: 44, module: 4.8, boreRadius: 160 }));
    planetGear.setAttribute('class', 'k-svg-gear k-gear-planet');
    this.gearGroup.appendChild(planetGear);

    // 4. Center Escapement Wheel (Ring 3, 24 teeth)
    const escapementWheel = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    escapementWheel.setAttribute('d', generateInvoluteGearPath({ teeth: 24, module: 5.2, boreRadius: 60 }));
    escapementWheel.setAttribute('class', 'k-svg-gear k-gear-escapement');
    this.gearGroup.appendChild(escapementWheel);

    // 5. Hairspring Core
    this.hairspringPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.hairspringPath.setAttribute('d', this.hairspring.generateHairspringPath(5.5, 12, 54, 0));
    this.hairspringPath.setAttribute('class', 'k-svg-hairspring');
    this.gearGroup.appendChild(this.hairspringPath);

    // 6. Crosshairs & Center Jeweled Bearing
    const crosshair = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    crosshair.setAttribute('d', 'M -380 0 L 380 0 M 0 -380 L 0 380');
    crosshair.setAttribute('class', 'k-svg-crosshair');
    this.gearGroup.appendChild(crosshair);

    const centerJewel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerJewel.setAttribute('r', '8');
    centerJewel.setAttribute('class', 'k-svg-jewel');
    this.gearGroup.appendChild(centerJewel);

    // Build the 250-path stress test suite (hidden until toggled)
    this.buildStressSuite();
  }

  private buildStressSuite(): void {
    // Generate 250 distinct concentric vector elements (spring arcs, gear teeth, vernier teeth)
    const totalPaths = 250;
    for (let i = 0; i < totalPaths; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const r = 40 + (i / totalPaths) * 320;
      const angle = (i * 137.5 * Math.PI) / 180; // Golden ratio distribution
      const len = 12 + (i % 5) * 6;

      const x1 = Math.cos(angle) * r;
      const y1 = Math.sin(angle) * r;
      const x2 = Math.cos(angle) * (r + len);
      const y2 = Math.sin(angle) * (r + len);

      path.setAttribute('d', `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
      path.setAttribute('class', 'k-stress-tooth');
      path.setAttribute('data-index', `${i}`);

      this.stressGroup.appendChild(path);
      this.stressPaths.push(path);
    }
  }

  private setupAnimations(): void {
    const ring1 = this.gearGroup.querySelector('.k-gear-ring-1')!;
    const planet = this.gearGroup.querySelector('.k-gear-planet')!;
    const escapement = this.gearGroup.querySelector('.k-gear-escapement')!;
    const ticksMajor = this.gearGroup.querySelector('.k-scale-major')!;

    // Precise rotational gear ratios: ring rotates clockwise, planet counter-clockwise at 64/44 ratio
    gsap.to(ring1, {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 32,
      ease: 'none',
      repeat: -1
    });

    gsap.to(planet, {
      rotation: -360 * (64 / 44),
      transformOrigin: '50% 50%',
      duration: 32,
      ease: 'none',
      repeat: -1
    });

    // Stepped mechanical escapement ticks: 5 beats per second (200ms alternating tick)
    gsap.to(escapement, {
      rotation: '+=30',
      transformOrigin: '50% 50%',
      duration: 0.15,
      ease: 'back.out(2.5)',
      repeat: -1,
      repeatDelay: 0.2
    });

    // Sub-pixel hairspring pulsing
    let tickTime = 0;
    gsap.ticker.add(() => {
      tickTime += 0.05;
      const deflection = this.hairspring.evaluate(tickTime % 2);
      this.hairspringPath.setAttribute(
        'd',
        this.hairspring.generateHairspringPath(5.5, 12, 54, deflection)
      );
    });

    // Vernier scale slow tracking
    gsap.to(ticksMajor, {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 120,
      ease: 'none',
      repeat: -1
    });
  }

  public setScrubPosition(progress: number): void {
    // Scrub master gear positions proportionally
    const ring1 = this.gearGroup.querySelector('.k-gear-ring-1')!;
    const planet = this.gearGroup.querySelector('.k-gear-planet')!;
    const escapement = this.gearGroup.querySelector('.k-gear-escapement')!;

    gsap.set(ring1, { rotation: progress * 360 * 2 });
    gsap.set(planet, { rotation: -progress * 360 * (64 / 44) * 2 });
    gsap.set(escapement, { rotation: progress * 360 * 6 });

    if (this.isStressMode) {
      // Scrub all 250 paths in stress test mode
      this.stressPaths.forEach((p, idx) => {
        const factor = (idx % 10) * 0.2 + 1;
        gsap.set(p, {
          rotation: progress * 360 * factor,
          transformOrigin: '0 0'
        });
      });
    }
  }

  public toggleStressMode(enable?: boolean): boolean {
    this.isStressMode = enable !== undefined ? enable : !this.isStressMode;

    if (this.isStressMode) {
      this.gearGroup.style.opacity = '0.25';
      this.stressGroup.style.display = 'block';

      // Animate 250 distinct paths concurrently with GSAP
      gsap.to(this.stressPaths, {
        rotation: '+=360',
        transformOrigin: '0 0',
        duration: 8,
        stagger: {
          each: 0.015,
          repeat: -1,
          from: 'center'
        },
        ease: 'power2.inOut'
      });
    } else {
      this.gearGroup.style.opacity = '1.0';
      this.stressGroup.style.display = 'none';
      gsap.killTweensOf(this.stressPaths);
    }

    return this.isStressMode;
  }
}
