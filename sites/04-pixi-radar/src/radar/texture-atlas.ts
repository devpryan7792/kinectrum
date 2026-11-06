import { Texture } from 'pixi.js';

/**
 * Procedural Vector Texture Atlas Generator
 * Generates all radar sprite textures on a single unified canvas atlas
 * to guarantee that 50,000 sprites never break the GPU batching pass.
 */
export function createRadarTextureAtlas(): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 64, 64);

  // Soft glowing phosphor blip
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.3, 'rgba(122, 162, 247, 0.95)');
  grad.addColorStop(0.7, 'rgba(122, 162, 247, 0.35)');
  grad.addColorStop(1, 'rgba(122, 162, 247, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();

  return Texture.from(canvas);
}
