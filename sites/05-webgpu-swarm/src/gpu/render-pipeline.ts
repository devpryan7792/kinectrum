import { renderShaderWGSL } from '../shaders/render.wgsl';

export class RenderPipelineManager {
  private device: GPUDevice;
  private pipeline: GPURenderPipeline;
  private uniformBuffer: GPUBuffer;
  private bindGroup: GPUBindGroup;

  constructor(device: GPUDevice, format: GPUTextureFormat) {
    this.device = device;

    const module = device.createShaderModule({
      code: renderShaderWGSL
    });

    this.uniformBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 32, // 32 bytes per particle
            stepMode: 'instance',
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x4' },  // pos
              { shaderLocation: 1, offset: 16, format: 'float32x4' } // vel
            ]
          }
        ]
      },
      fragment: {
        module,
        entryPoint: 'fs_main',
        targets: [
          {
            format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one', // Additive glow
                operation: 'add'
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one',
                operation: 'add'
              }
            }
          }
        ]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    this.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } }
      ]
    });
  }

  public updateUniforms(aspect: number, zoom = 3.8): void {
    const data = new Float32Array([aspect, zoom, 0.0, 0.0]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
  }

  public draw(
    passEncoder: GPURenderPassEncoder,
    activeInstanceBuffer: GPUBuffer,
    instanceCount: number
  ): void {
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);
    passEncoder.setVertexBuffer(0, activeInstanceBuffer);
    // Draw 6 vertices per instance (billboard quad)
    passEncoder.draw(6, instanceCount, 0, 0);
  }
}
