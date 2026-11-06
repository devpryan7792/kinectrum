export interface BufferPair {
  bufferA: GPUBuffer;
  bufferB: GPUBuffer;
  count: number;
}

export function allocateParticleStorageBuffers(device: GPUDevice, count = 500000): BufferPair {
  // 8 floats (32 bytes) per particle: [x, y, z, w_phase, vx, vy, vz, w_mass]
  const bytesPerParticle = 32;
  const totalBytes = count * bytesPerParticle;

  const initialData = new Float32Array(count * 8);

  for (let i = 0; i < count; i++) {
    const idx = i * 8;

    // Keplerian disc / spherical orbital cloud
    const radius = 0.4 + Math.sqrt(Math.random()) * 3.2;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 0.45 * (radius * 0.5);

    initialData[idx + 0] = Math.cos(angle) * radius; // pos.x
    initialData[idx + 1] = height;                   // pos.y
    initialData[idx + 2] = Math.sin(angle) * radius; // pos.z
    initialData[idx + 3] = Math.random() * 100.0;    // pos.w (phase)

    // Orbital tangent velocity
    const speed = Math.sqrt(1.2 / (radius + 0.1));
    initialData[idx + 4] = -Math.sin(angle) * speed; // vel.x
    initialData[idx + 5] = (Math.random() - 0.5) * 0.1; // vel.y
    initialData[idx + 6] = Math.cos(angle) * speed;  // vel.z
    initialData[idx + 7] = 1.0;                      // vel.w (mass)
  }

  const bufferA = device.createBuffer({
    size: totalBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });

  const bufferB = device.createBuffer({
    size: totalBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });

  // Upload initial seed data
  device.queue.writeBuffer(bufferA, 0, initialData);
  device.queue.writeBuffer(bufferB, 0, initialData);

  return { bufferA, bufferB, count };
}
