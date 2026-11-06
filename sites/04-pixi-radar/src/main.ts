import { Application } from 'pixi.js';
import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { createRadarTextureAtlas } from './radar/texture-atlas';
import { ParticleSwarm } from './radar/particle-swarm';
import { RadarReticleGrid } from './radar/sweep-beam';
import { RadarAudioSynth } from './audio/synth-audio';

async function bootstrap() {
  // 1. Initialize Telemetry HUD
  const hud = initTelemetryHUD({
    substrate: 'pixi-2d',
    title: '04 · PIXI.JS V8 VECTOR RADAR',
    badge: 'PIXI V8 (2D)',
    position: 'bottom-right',
    initialExpanded: false,
    maxDrawCallsSla: 5,
    architecturalNotes: [
      'Substrate: 2D GPU Vector Batching (Pixi.js v8)',
      'Pipeline: ParticleContainer & Sprite Batching via WebGL/WebGPU',
      'Batching Guarantee: Single unified texture atlas (≤ 5 Draw Calls for 50,000 nodes)',
      'Kinematics: Contiguous Float32Array spring-damper integration'
    ]
  });

  const canvas = document.getElementById('pixi-canvas') as HTMLCanvasElement;

  // 2. Initialize Pixi v8 Application
  const app = new Application();
  await app.init({
    canvas,
    resizeTo: window,
    backgroundColor: 0x0A0A0C,
    antialias: true,
    powerPreference: 'high-performance'
  });

  // Instrument underlying WebGL context if available
  const gl = (app.renderer as any).gl;
  if (gl) {
    hud.instrumentWebGL(gl);
  }

  // 3. Audio Synthesizer
  const audio = new RadarAudioSynth();

  // 4. Procedural Texture Atlas & Particle Swarm
  const atlasTexture = createRadarTextureAtlas();
  const swarm = new ParticleSwarm(atlasTexture, 50000);
  const reticle = new RadarReticleGrid();

  app.stage.addChild(reticle.graphics);
  app.stage.addChild(swarm.container);
  app.stage.addChild(reticle.beamGraphics);

  // Layout distribution
  function updateDistribution() {
    const cx = app.screen.width / 2;
    const cy = app.screen.height / 2;
    const maxR = Math.min(cx, cy) * 0.85;

    reticle.drawGrid(cx, cy, maxR);
    swarm.dynamics.initPolarDistribution(cx, cy, maxR);
  }

  updateDistribution();
  window.addEventListener('resize', updateDistribution);

  // 5. Interactive Shockwaves & Pings
  function triggerBlast(x: number, y: number) {
    swarm.dynamics.applyShockwave(x, y, 260, 22);
    audio.triggerShockwavePing();
  }

  canvas.addEventListener('pointerdown', (e) => {
    triggerBlast(e.clientX, e.clientY);
  });

  document.getElementById('btn-shockwave')?.addEventListener('click', () => {
    triggerBlast(app.screen.width / 2, app.screen.height / 2);
  });

  // Sound toggle button
  const btnAudio = document.getElementById('btn-audio-toggle') as HTMLButtonElement;
  btnAudio?.addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    btnAudio.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
    btnAudio.classList.toggle('active', !isMuted);
  });

  // Node Density Slider (5,000 to 50,000 sprites)
  const sliderDensity = document.getElementById('slider-density') as HTMLInputElement;
  const lblDensity = document.getElementById('lbl-active-nodes') as HTMLElement;

  sliderDensity?.addEventListener('input', () => {
    const count = parseInt(sliderDensity.value, 10);
    swarm.setActiveCount(count);
    lblDensity.textContent = `${count.toLocaleString()} NODES`;

    if (count >= 40000) {
      hud.setCommentary([
        `HIGH DENSITY STRESS: ${count.toLocaleString()} Active 2D Sprites`,
        'Observing GPU 2D fill-rate & Sprite Batching performance',
        'Batch Invariant: Entire swarm rendered in ≤ 5 GPU draw calls'
      ]);
    } else {
      hud.setSubstrate('pixi-2d');
    }
  });

  // Set initial count
  swarm.setActiveCount(20000);

  // 6. Animation Ticker
  let lastAudioAngle = 0;

  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime * 0.016; // Normalized seconds
    const cx = app.screen.width / 2;
    const cy = app.screen.height / 2;
    const maxR = Math.min(cx, cy) * 0.85;

    // Update spring physics on contiguous Float32Array
    swarm.dynamics.update(0.045, 0.88);

    // Update sweep beam
    const angle = reticle.updateBeam(cx, cy, maxR, delta);

    // Trigger synthetic audio ping when radar beam crosses 0 degrees
    if (angle < lastAudioAngle && lastAudioAngle > Math.PI * 1.5) {
      audio.triggerRadarPing();
    }
    lastAudioAngle = angle;

    // Update particles luminosity
    swarm.update(angle);
  });
}

bootstrap();
