import { initTelemetryHUD } from '@kinetic/telemetry-hud';
import { initWebGPUDevice } from './gpu/device-manager';
import { allocateParticleStorageBuffers } from './gpu/buffer-allocator';
import { ComputePipelineManager } from './gpu/compute-pipeline';
import { RenderPipelineManager } from './gpu/render-pipeline';
import { FallbackDiagnosticsEngine } from './fallback/fallback-visualizer';

async function bootstrap() {
  // 1. Initialize Telemetry HUD
  const hud = initTelemetryHUD({
    substrate: 'webgpu-compute',
    title: '05 · WEBGPU MILLION-BODY SWARM',
    badge: 'WEBGPU WGSL',
    position: 'bottom-right',
    initialExpanded: false,
    maxDrawCallsSla: 2,
    architecturalNotes: [
      'Substrate: Next-Gen GPU Compute Shaders (WebGPU WGSL)',
      'Pipeline: Compute Pass (VRAM Ping-Pong) -> Direct Vertex Pass',
      'Memory Alignment: 32 bytes per particle struct (16-byte boundary)',
      'CPU Read-Back: 0 bytes transferred per frame'
    ]
  });

  const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
  const webgpu = await initWebGPUDevice(canvas);

  if (!webgpu) {
    // WebGPU Unsupported / Fallback mode
    const banner = document.getElementById('fallback-banner');
    if (banner) banner.style.display = 'block';

    hud.setCommentary([
      'WEBGPU NOTICE: WebGPU adapter not available in current session',
      'Active: Real-time 5,000 particle canvas fallback simulation',
      'Enable WebGPU: Use Chromium 113+ or chrome://flags/#enable-unsafe-webgpu'
    ]);

    new FallbackDiagnosticsEngine(canvas);
    return;
  }

  const { device, context, format } = webgpu;

  // 2. Allocate Ping-Pong Storage Buffers (500,000 particles)
  let activeParticleCount = 500000;
  const buffers = allocateParticleStorageBuffers(device, 500000);

  // 3. Compute & Render Pipelines
  const computeManager = new ComputePipelineManager(device, buffers);
  const renderManager = new RenderPipelineManager(device, format);

  // 4. Interactive State
  let startTime = performance.now();
  let lastTime = startTime;
  let mouseX = 0;
  let mouseY = 0;
  let blastForce = 0;
  let pingPongStep = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2.0);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      renderManager.updateUniforms(width / height);
    }
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', (e) => {
    // Project mouse to NDC coordinate space (-2 to +2)
    mouseX = (e.clientX / window.innerWidth - 0.5) * 4.0;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 4.0;
  });

  function triggerShockwave() {
    blastForce = 1.0;
  }

  canvas.addEventListener('pointerdown', triggerShockwave);
  document.getElementById('btn-blast')?.addEventListener('click', triggerShockwave);

  // Count Selector
  const selCount = document.getElementById('sel-particle-count') as HTMLSelectElement;
  const lblWorkgroups = document.getElementById('lbl-workgroups') as HTMLElement;

  selCount?.addEventListener('change', () => {
    activeParticleCount = parseInt(selCount.value, 10);
    const wg = Math.ceil(activeParticleCount / 64);
    lblWorkgroups.textContent = `${wg.toLocaleString()} WORKGROUPS (64 THREADS/WG)`;

    if (activeParticleCount >= 500000) {
      hud.setCommentary([
        'STRESS TEST: 500,000 Concurrent Bodies Simulated on GPU',
        'WGSL Compute Workgroups: 7,813 workgroups running in parallel',
        'Zero CPU overhead: VRAM storage buffer consumed directly as vertex input'
      ]);
    } else {
      hud.setSubstrate('webgpu-compute');
    }
  });

  // 5. WebGPU Simulation & Render Loop
  function frame() {
    requestAnimationFrame(frame);

    const now = performance.now();
    const delta = Math.min(0.033, (now - lastTime) * 0.001);
    const elapsed = (now - startTime) * 0.001;
    lastTime = now;

    // Decay blast force
    blastForce = Math.max(0, blastForce - delta * 2.5);

    // Update compute uniforms
    computeManager.updateUniforms({
      delta,
      time: elapsed,
      mouseX,
      mouseY,
      count: activeParticleCount,
      gravityStrength: 1.8,
      curlScale: 0.65,
      blastForce
    });

    const commandEncoder = device.createCommandEncoder();

    // Pass 1: Compute Pass (VRAM Ping-Pong calculation)
    const computePass = commandEncoder.beginComputePass();
    computeManager.dispatch(computePass, pingPongStep);
    computePass.end();

    // Pass 2: Render Pass (Consuming written buffer directly as vertex instance input)
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.039, g: 0.039, b: 0.047, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    });

    const activeBuffer = pingPongStep ? buffers.bufferB : buffers.bufferA;
    renderManager.draw(renderPass, activeBuffer, activeParticleCount);
    hud.instrumentWebGPU(renderPass);
    renderPass.end();

    // Submit commands to GPU queue
    device.queue.submit([commandEncoder.finish()]);

    // Flip ping-pong state for next frame
    pingPongStep = !pingPongStep;
  }

  requestAnimationFrame(frame);
}

bootstrap();
