import { computeShaderWGSL } from '../shaders/compute.wgsl';
import { BufferPair } from './buffer-allocator';

export class ComputePipelineManager {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private uniformBuffer: GPUBuffer;
  private bindGroupA: GPUBindGroup;
  private bindGroupB: GPUBindGroup;
  private activeCount: number;

  constructor(device: GPUDevice, buffers: BufferPair) {
    this.device = device;
    this.activeCount = buffers.count;

    const module = device.createShaderModule({
      code: computeShaderWGSL
    });

    this.pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module,
        entryPoint: 'main'
      }
    });

    // Uniform buffer (32 bytes aligned: 8 floats/uints)
    this.uniformBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    // BindGroup A: reads from bufferA, writes to bufferB
    this.bindGroupA = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: buffers.bufferA } },
        { binding: 2, resource: { buffer: buffers.bufferB } }
      ]
    });

    // BindGroup B: reads from bufferB, writes to bufferA
    this.bindGroupB = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: buffers.bufferB } },
        { binding: 2, resource: { buffer: buffers.bufferA } }
      ]
    });
  }

  public updateUniforms(params: {
    delta: number;
    time: number;
    mouseX: number;
    mouseY: number;
    count: number;
    gravityStrength: number;
    curlScale: number;
    blastForce: number;
  }): void {
    const data = new ArrayBuffer(32);
    const floatView = new Float32Array(data);
    const uintView = new Uint32Array(data);

    floatView[0] = params.delta;
    floatView[1] = params.time;
    floatView[2] = params.mouseX;
    floatView[3] = params.mouseY;
    uintView[4] = params.count;
    floatView[5] = params.gravityStrength;
    floatView[6] = params.curlScale;
    floatView[7] = params.blastForce;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
    this.activeCount = params.count;
  }

  public dispatch(passEncoder: GPUComputePassEncoder, pingPongStep: boolean): void {
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, pingPongStep ? this.bindGroupA : this.bindGroupB);

    // 64 threads per workgroup
    const workgroups = Math.ceil(this.activeCount / 64);
    passEncoder.dispatchWorkgroups(workgroups);
  }
}
