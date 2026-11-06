import * as THREE from 'three';

export function createProceduralBrushNormalTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill with neutral normal map color (RGB 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Generate high-frequency radial/concentric brush grain
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Perlin-like fine horizontal scratches
      const noise = (Math.sin(x * 0.8) * Math.cos(y * 45.0) + (Math.random() - 0.5) * 0.4);
      const nx = Math.floor(128 + noise * 30);
      const ny = 128;
      const nz = 255;

      data[idx] = Math.min(255, Math.max(0, nx));
      data[idx + 1] = ny;
      data[idx + 2] = nz;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createBrushedTitaniumMaterial(): THREE.MeshStandardMaterial {
  const normalMap = createProceduralBrushNormalTexture();

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2E323D),
    metalness: 0.94,
    roughness: 0.28,
    normalMap,
    normalScale: new THREE.Vector2(0.15, 0.15),
    envMapIntensity: 1.2
  });
}
