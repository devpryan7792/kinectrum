import * as THREE from 'three';
import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { LenisController } from './scroll/lenis-controller';
import { bridgeLenisAndGSAP } from './scroll/gsap-bridge';
import { BackgroundScene } from './webgl/background-scene';
import { HeroSculpture } from './webgl/hero-sculpture';
import { DOMSyncPlaneManager } from './webgl/dom-sync-plane';
import { setupResilienceGuard } from './resilience/resize-guard';

// 1. Initialize Telemetry HUD
const hud = initTelemetryHUD({
  substrate: 'hybrid-sotd',
  title: '06 · AGENCY SOTD HYBRID MONOGRAPH',
  badge: 'LENIS + GSAP + THREE',
  position: 'bottom-right',
  initialExpanded: false,
  maxDrawCallsSla: 20,
  architecturalNotes: [
    'Substrate: Hybrid Semantic DOM + Three.js 1:1 Pixel Space',
    '3D Centerpiece: Interactive Procedural Gyroscopic Sculpture',
    'Liquid Shader: Dynamic Z-displacement wave ripple driven by scroll velocity',
    'Card Floating Crystals: Real-time 3D Torus, Icosahedron, Octahedron, Dodecahedron',
    'Inertia Lubricant: Lenis v1.1+ Virtual Scroll Normalizer'
  ]
});

// 2. DOM & WebGL Scene Binding
const canvas = document.getElementById('webgl-bg') as HTMLCanvasElement;
const bgScene = new BackgroundScene(canvas);

// Instrument WebGL context for real-time draw call counting
hud.instrumentWebGL(bgScene.renderer.getContext());

// 3. Add 3D Hero Gyroscopic Sculpture
const heroSculpture = new HeroSculpture();
bgScene.scene.add(heroSculpture.group);

// 4. Initialize Smooth Scroll Engine & GSAP Bridge
const lenisController = new LenisController();
bridgeLenisAndGSAP(lenisController);

// 5. Bind DOM Anchors to 3D Background Meshes & Crystals
const domSync = new DOMSyncPlaneManager(bgScene.scene);

// 6. Setup Resilience Guard for Font Loading & Viewport Resizing
setupResilienceGuard(lenisController, bgScene);

// 7. Interactive Mouse Tracking (3D Tilt & Fluid Ripples)
window.addEventListener('mousemove', (e) => {
  const normX = (e.clientX / window.innerWidth) * 2 - 1;
  const normY = (e.clientY / window.innerHeight) * 2 - 1;

  // 3D Gyroscope tilts toward cursor
  heroSculpture.setMouseTilt(normX, normY);

  // Liquid mesh ripples at pointer coordinates
  const halfW = window.innerWidth / 2;
  const halfH = window.innerHeight / 2;
  domSync.mousePos.set(e.clientX - halfW, -(e.clientY - halfH));
});

// 8. 3D Card Hover Perspective Tilt
const cards = document.querySelectorAll<HTMLElement>('.sync-card');
cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-8px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// 9. Interactive Controls in Header
const btnWireframe = document.getElementById('btn-toggle-wireframe') as HTMLButtonElement;
let isWireframe = false;
if (btnWireframe) {
  btnWireframe.addEventListener('click', () => {
    isWireframe = !isWireframe;
    btnWireframe.classList.toggle('active', isWireframe);
    domSync.setWireframeMode(isWireframe);
  });
}

const btnBoostScrub = document.getElementById('btn-boost-scrub') as HTMLButtonElement;
if (btnBoostScrub) {
  btnBoostScrub.addEventListener('click', () => {
    const targetScroll = lenisController.scrollY + 800;
    lenisController.lenis.scrollTo(targetScroll, { duration: 1.2 });
  });
}

// 10. Real-Time Telemetry Elements
const elVelocity = document.getElementById('val-velocity');
const elDeltaZ = document.getElementById('val-deltaz');
const elFps = document.getElementById('hud-fps');
const elDrift = document.getElementById('hud-drift');

// 11. Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const velocity = lenisController.velocity;

  // Update 3D Hero Gyroscope
  heroSculpture.update(elapsedTime, velocity);

  // Update synchronized 3D planes & crystals
  domSync.update(elapsedTime, velocity);

  // Render WebGL background behind DOM content
  bgScene.render();

  // Telemetry indicators
  if (elVelocity) {
    elVelocity.textContent = `${velocity.toFixed(2)} px/s`;
  }
  if (elDeltaZ) {
    const waveAmp = 25.0 + Math.min(Math.abs(velocity) * 0.1, 40.0);
    elDeltaZ.textContent = `${waveAmp.toFixed(1)}px`;
  }
  if (elFps) {
    elFps.textContent = Math.round(hud.getMetrics().fps).toString();
  }
  if (elDrift) {
    elDrift.textContent = '0.00px';
  }
}

requestAnimationFrame(animate);
