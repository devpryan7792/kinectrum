export interface WebGPUContext {
  device: GPUDevice;
  adapter: GPUAdapter;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export async function initWebGPUDevice(canvas: HTMLCanvasElement): Promise<WebGPUContext | null> {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    console.warn('[WebGPU] navigator.gpu is not available in this browser environment');
    return null;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      console.warn('[WebGPU] No suitable GPUAdapter found');
      return null;
    }

    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext;
    if (!context) {
      console.warn('[WebGPU] Failed to get webgpu canvas context');
      return null;
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: 'premultiplied'
    });

    return { device, adapter, context, format };
  } catch (err) {
    console.warn('[WebGPU] Error requesting GPU device:', err);
    return null;
  }
}
