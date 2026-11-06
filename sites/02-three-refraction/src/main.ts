import * as THREE from 'three';
import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { SceneManager } from './core/scene-manager';

// 1. Initialize Telemetry HUD
const hud = initTelemetryHUD({
  substrate: 'webgl-pbr',
  title: '02 · THREE.JS OPTICAL REFRACTION',
  badge: 'WEBGL 2.0',
  position: 'bottom-right',
  initialExpanded: false,
  maxDrawCallsSla: 30,
  architecturalNotes: [
    'Substrate: WebGL 2.0 PBR Rasterizer',
    'Pipeline: MeshPhysicalMaterial Transmission & Roughness Mipmaps',
    'Optical IOR: 1.52 (Borosilicate glass refraction)',
    'Draw Call Ceiling: ≤ 30 (Instanced titanium mounts & shared materials)'
  ]
});

// 2. Setup Scene Manager
const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const sceneManager = new SceneManager(canvas);

// Instrument WebGL Context for real-time draw call counting
hud.instrumentWebGL(sceneManager.renderer.getContext());

// 3. Animation Loop with Clock Delta
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sceneManager.update(delta);
}

requestAnimationFrame(animate);

// 4. UI Controls
const btnStress = document.getElementById('btn-stress-toggle') as HTMLButtonElement;
btnStress.addEventListener('click', () => {
  const isStress = sceneManager.toggleStressTest();
  btnStress.classList.toggle('stress-active', isStress);

  if (isStress) {
    btnStress.textContent = '⚡ 5 LAYERS ACTIVE';
    hud.setCommentary([
      'STRESS TEST: 5 Overlapping Refractive Glass Bodies Active',
      'Observing GPU Transmission Roughness Mipmap generation',
      'SLA Target: Maintain ≥ 55 FPS under ≤ 30 Draw Calls'
    ]);
  } else {
    btnStress.textContent = '⚡ 5-LAYER OVERDRAW STRESS';
    hud.setSubstrate('webgl-pbr');
  }
});

const btnResetCam = document.getElementById('btn-reset-cam') as HTMLButtonElement;
btnResetCam.addEventListener('click', () => {
  sceneManager.cameraController.targetTheta = 0;
  sceneManager.cameraController.targetPhi = Math.PI / 2.5;
  sceneManager.cameraController.radius = 7.5;
});

// Roughness Slider
const sliderRoughness = document.getElementById('slider-roughness') as HTMLInputElement;
sliderRoughness.addEventListener('input', () => {
  const r = parseFloat(sliderRoughness.value);
  const mat = sceneManager.monolith.glassMesh.material as THREE.MeshPhysicalMaterial;
  mat.roughness = r;
});

// Exposure Slider
const sliderExposure = document.getElementById('slider-exposure') as HTMLInputElement;
sliderExposure.addEventListener('input', () => {
  const exp = parseFloat(sliderExposure.value);
  sceneManager.renderer.toneMappingExposure = exp;
});

// 5. Debounced Resize Handler
window.addEventListener('resize', () => {
  sceneManager.resize(window.innerWidth, window.innerHeight);
});

// Initial size sync
sceneManager.resize(window.innerWidth, window.innerHeight);
