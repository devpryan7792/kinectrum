import { TelemetryConfig, TelemetryInstance, TelemetryMetrics, SubstrateType } from './types';
import { FPSTracker } from './fps-tracker';
import { WebGLProbe } from './webgl-probe';
import { WebGPUProbe } from './webgpu-probe';
import { DOMTracker } from './dom-tracker';
import { HUDUI } from './hud-ui';

export * from './types';
export * from './fps-tracker';
export * from './webgl-probe';
export * from './webgpu-probe';
export * from './dom-tracker';
export * from './commentary-drawer';

export function initTelemetryHUD(config: TelemetryConfig = {}): TelemetryInstance {
  const fpsTracker = new FPSTracker();
  const webglProbe = new WebGLProbe();
  const webgpuProbe = new WebGPUProbe();
  const domTracker = new DOMTracker();
  const ui = new HUDUI(config);

  let substrate: SubstrateType = config.substrate || 'generic';
  let isRunning = true;
  let rafId: number;

  function loop() {
    if (!isRunning) return;

    fpsTracker.tick();
    const domCount = domTracker.sample();
    const webglDraws = webglProbe.endFrame();
    const webgpuDraws = webgpuProbe.endFrame();
    const totalDraws = webglDraws + webgpuDraws;

    const metrics: TelemetryMetrics = {
      fps: fpsTracker.currentFps,
      smoothedFps: fpsTracker.smoothedFps,
      frameDeltaMs: fpsTracker.frameDeltaMs,
      minFps: fpsTracker.minFps,
      maxFps: fpsTracker.maxFps,
      drawCalls: totalDraws,
      domNodes: domCount,
      substrate
    };

    ui.update(metrics);

    const dims = ui.getCanvasDimensions();
    fpsTracker.renderSparkline(ui.getCanvasContext(), dims.width, dims.height);

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);

  return {
    recordFrame: () => {
      // Manual frame record if user drives loop externally
    },
    instrumentWebGL: (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
      webglProbe.instrument(gl);
    },
    instrumentWebGPU: (passEncoder: any) => {
      webgpuProbe.instrumentPassEncoder(passEncoder);
    },
    incrementDrawCalls: (count = 1) => {
      webglProbe.incrementManual(count);
    },
    setSubstrate: (newSubstrate: SubstrateType) => {
      substrate = newSubstrate;
      ui.updateCommentary(substrate);
    },
    setCommentary: (notes: string[]) => {
      ui.updateCommentary(substrate, notes);
    },
    getMetrics: (): TelemetryMetrics => {
      return {
        fps: fpsTracker.currentFps,
        smoothedFps: fpsTracker.smoothedFps,
        frameDeltaMs: fpsTracker.frameDeltaMs,
        minFps: fpsTracker.minFps,
        maxFps: fpsTracker.maxFps,
        drawCalls: webglProbe.getLastFrameDrawCalls() + webgpuProbe.getLastFrameDrawPasses(),
        domNodes: domTracker.getNodeCount(),
        substrate
      };
    },
    destroy: () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      webglProbe.destroy();
      ui.destroy();
    }
  };
}
