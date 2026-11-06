import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { createGLProgram } from './gl/shader-program';
import { ScreenQuad } from './gl/screen-quad';
import { UniformManager } from './gl/uniform-manager';
import { vertexShaderSource } from './shaders/vertex';
import { fragmentShaderSource } from './shaders/fragment';

// 1. Initialize Telemetry HUD
const hud = initTelemetryHUD({
  substrate: 'glsl-shader',
  title: '03 · GLSL RAYMARCHED SINGULARITY',
  badge: 'PURE GLSL',
  position: 'bottom-right',
  initialExpanded: false,
  maxDrawCallsSla: 1,
  architecturalNotes: [
    'Substrate: Pure GPU Fragment Shader (GLSL ES 3.0)',
    'Pipeline: 1 Quad (2 Triangles) -> 100% Raymarching in Fragment Shader',
    'Root Finding: Sphere tracing (128 max steps, epsilon 0.001)',
    'SDF Algebra: Inigo Quilez smin polynomial liquid chrome metaballs'
  ]
});

// 2. Setup WebGL 2.0 Context
const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2', {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'high-performance'
});

if (!gl) {
  throw new Error('[GLSL] WebGL 2.0 not supported on this hardware/browser');
}

hud.instrumentWebGL(gl);

// 3. Compile Shaders & Setup Quad
const program = createGLProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

const quad = new ScreenQuad(gl);
const uniforms = new UniformManager(gl, program);

// 4. State & Controls
let startTime = performance.now();
let mouseX = 0.5;
let mouseY = 0.5;
let targetMouseX = 0.5;
let targetMouseY = 0.5;
let isStressMode = false;

function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2.0);
  const width = Math.floor(window.innerWidth * dpr);
  const height = Math.floor(window.innerHeight * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl!.viewport(0, 0, width, height);
    uniforms.setResolution(width, height);
  }
}

window.addEventListener('resize', resize);
resize();

// Mouse tracking with inertia
window.addEventListener('pointermove', (e) => {
  targetMouseX = e.clientX / window.innerWidth;
  targetMouseY = e.clientY / window.innerHeight;
});

// Controls
const btnStress = document.getElementById('btn-stress-toggle') as HTMLButtonElement;
btnStress.addEventListener('click', () => {
  isStressMode = !isStressMode;
  uniforms.setStressMode(isStressMode);
  btnStress.classList.toggle('stress-active', isStressMode);

  if (isStressMode) {
    btnStress.textContent = '⚡ GYROID MANIFOLD ACTIVE';
    hud.setCommentary([
      'STRESS TEST: 128-Step Non-Euclidean Gyroid Manifold Active',
      'Observing GPU Fragment Warp performance under high raymarch iterations',
      'SLA Target: Maintain ≥ 55 FPS at Exactly 1 GPU Draw Call'
    ]);
  } else {
    btnStress.textContent = '⚡ 128-STEP GYROID STRESS';
    hud.setSubstrate('glsl-shader');
  }
});

const btnReset = document.getElementById('btn-reset-orbit') as HTMLButtonElement;
btnReset.addEventListener('click', () => {
  targetMouseX = 0.5;
  targetMouseY = 0.5;
});

const sliderBlend = document.getElementById('slider-blend') as HTMLInputElement;
sliderBlend.addEventListener('input', () => {
  uniforms.setBlendFactor(parseFloat(sliderBlend.value));
});

// Initial uniform state
uniforms.setBlendFactor(1.0);
uniforms.setStressMode(false);

// 5. Render Loop (1 Draw Call Per Frame)
function render() {
  requestAnimationFrame(render);

  const elapsed = (performance.now() - startTime) * 0.001;

  // Damped mouse rotation
  mouseX += (targetMouseX - mouseX) * 0.06;
  mouseY += (targetMouseY - mouseY) * 0.06;

  uniforms.setTime(elapsed);
  uniforms.setMouse(mouseX, mouseY);

  quad.render();
}

requestAnimationFrame(render);
