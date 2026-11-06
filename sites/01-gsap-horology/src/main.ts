import gsap from 'gsap';
import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { MechanicalChronometer } from './components/mechanical-chronometer';
import { TypographyMonument } from './components/typography-monument';
import { FlipLayoutManager, HorologyViewState } from './components/flip-layout-manager';
import { MagneticField } from './math/magnetic-field';
import { globalLayoutGuard } from './telemetry/layout-guard';

// 1. Initialize Telemetry HUD
const hud = initTelemetryHUD({
  substrate: 'dom-svg',
  title: '01 · GSAP HAUTE HOROLOGY',
  badge: 'DOM / SVG',
  position: 'bottom-right',
  initialExpanded: false,
  architecturalNotes: [
    'Substrate: DOM & SVG Compositor Choreography',
    'Pipeline: Layout -> Paint -> Composite',
    'Optimization: transform: translate3d/rotate (Zero Paint/Reflow during scrub)',
    'Stress Test: 250 concurrent SVG path morphs without dropped frames'
  ]
});

// 2. DOM Containers
const appEl = document.getElementById('app')!;
const monumentWrap = document.querySelector('.k-monument-wrap') as HTMLElement;
const chronometerWrap = document.querySelector('.k-chronometer-wrap') as HTMLElement;

// 3. Components
const monument = new TypographyMonument(monumentWrap);
const chronometer = new MechanicalChronometer(chronometerWrap);
const magneticField = new MagneticField(180, 0.14, 0.76);

// 4. FLIP Layout Manager
const flipManager = new FlipLayoutManager(appEl, (state: HorologyViewState) => {
  hud.setCommentary([
    `Active View: ${state.toUpperCase()}`,
    'Zero layout thrashing: Matrix3D scaling via compositor thread only',
    state === 'exploded'
      ? 'Mode: Concentric Exploded View (high-density path inspection)'
      : 'Mode: Precision Engineering Blueprint'
  ]);
});

// 5. Mode Selector Buttons
const modeButtons = document.querySelectorAll<HTMLButtonElement>('.k-btn-mode[data-view]');
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.getAttribute('data-view') as HorologyViewState;
    flipManager.applyState(view);
  });
});

// 6. Stress Test Toggle
const btnStress = document.getElementById('btn-stress-toggle') as HTMLButtonElement;
btnStress.addEventListener('click', () => {
  const isStress = chronometer.toggleStressMode();
  btnStress.classList.toggle('stress-active', isStress);

  if (isStress) {
    btnStress.textContent = '⚡ 250 PATHS ACTIVE';
    hud.setCommentary([
      'STRESS TEST: 250 Concurrent SVG Path Tweens Active',
      'Observing GPU Compositor Thread under high vector churn',
      'SLA Target: Maintain ≥ 55 FPS with 0 Layout Reflows'
    ]);
  } else {
    btnStress.textContent = '⚡ 250-PATH STRESS';
    hud.setSubstrate('dom-svg');
  }
});

// 7. Timeline Scrub Controller
const scrubSlider = document.getElementById('timeline-scrub') as HTMLInputElement;
scrubSlider.addEventListener('input', () => {
  const progress = parseFloat(scrubSlider.value);
  chronometer.setScrubPosition(progress);
  monument.setScrub(progress);
});

// 8. Magnetic Cursor & Wheel Scrub Loop
window.addEventListener('pointermove', (e) => {
  magneticField.setPointer(e.clientX, e.clientY);
});

window.addEventListener('wheel', (e) => {
  // Smooth scrub delta on mouse wheel
  let currentVal = parseFloat(scrubSlider.value);
  currentVal = Math.min(1, Math.max(0, currentVal + e.deltaY * 0.0004));
  scrubSlider.value = `${currentVal}`;
  chronometer.setScrubPosition(currentVal);
  monument.setScrub(currentVal);
}, { passive: true });

// GSAP rAF Ticker for magnetic field deflection
gsap.ticker.add(() => {
  globalLayoutGuard.beginTick();

  const { vx, vy } = magneticField.update();

  // Subtle inertial tilt on chronometer wrap without triggering reflow
  gsap.set(chronometerWrap, {
    rotationY: vx * 0.35,
    rotationX: -vy * 0.35,
    transformPerspective: 800,
    transformOrigin: '50% 50%'
  });

  globalLayoutGuard.endTick();
});
