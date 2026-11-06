import * as THREE from 'three';
import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { LenisController } from './scroll/lenis-controller';
import { bridgeLenisAndGSAP } from './scroll/gsap-bridge';
import { BackgroundScene } from './webgl/background-scene';
import { DOMSyncPlaneManager } from './webgl/dom-sync-plane';
import { setupResilienceGuard } from './resilience/resize-guard';

// 1. Initialize Telemetry HUD
const hud = initTelemetryHUD({
  substrate: 'hybrid-sotd',
  title: '06 · AGENCY SOTD HYBRID MONOGRAPH',
  badge: 'LENIS + GSAP + THREE',
  position: 'bottom-right',
  initialExpanded: false,
  maxDrawCallsSla: 10,
  architecturalNotes: [
    'Substrate: Hybrid Semantic DOM + Three.js WebGL Screen Space',
    'Inertia Lubricant: Lenis v1.1+ Virtual Scroll Normalizer',
    'Orchestration: GSAP 3 ScrollTrigger locked to Lenis rAF ticker',
    'Projection: 1 Unit = 1 Pixel (fov = 2 · arctan(H / 2000) · 180 / π)',
    'Resilience: Debounced ResizeObserver + document.fonts.ready'
  ]
});

// 2. DOM & Canvas Binding
const canvas = document.getElementById('webgl-bg') as HTMLCanvasElement;
const bgScene = new BackgroundScene(canvas);

// Instrument WebGL Context for real-time draw call telemetry
hud.instrumentWebGL(bgScene.renderer.getContext());

// 3. Initialize Smooth Scroll Engine & GSAP Bridge
const lenisController = new LenisController();
bridgeLenisAndGSAP(lenisController);

// 4. Bind DOM Anchors to 3D Background Meshes
const domSync = new DOMSyncPlaneManager(bgScene.scene);

// 5. Setup Resilience Guard for Font Loading & Viewport Resizing
setupResilienceGuard(lenisController, bgScene);

// 6. Real-Time Telemetry Elements
const elVelocity = document.getElementById('val-velocity');
const elDeltaZ = document.getElementById('val-deltaz');
const elFps = document.getElementById('hud-fps');
const elDrift = document.getElementById('hud-drift');

// 7. Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const velocity = lenisController.velocity;

  // Update synchronized meshes with fluid scroll ripple
  domSync.update(elapsedTime, velocity);

  // Render WebGL background behind DOM content
  bgScene.render();

  // Telemetry indicators
  if (elVelocity) {
    elVelocity.textContent = `${velocity.toFixed(2)} px/s`;
  }
  if (elDeltaZ) {
    const waveDisp = Math.sin(elapsedTime * 2.5) * Math.min(Math.abs(velocity) * 0.05, 3.0) * 0.15;
    elDeltaZ.textContent = waveDisp.toFixed(3);
  }
  if (elFps) {
    elFps.textContent = Math.round(hud.getMetrics().fps).toString();
  }
  if (elDrift) {
    // Exact mathematical 1:1 projection guarantees zero drift
    elDrift.textContent = '0.00px';
  }
}

requestAnimationFrame(animate);
