import { SubstrateType } from './types';

export const SUBSTRATE_NOTES: Record<SubstrateType, string[]> = {
  'dom-svg': [
    'Substrate: DOM & SVG Vector Compositor',
    'Pipeline: Layout (CSS) -> Paint (Raster) -> Composite (GPU VRAM)',
    'Key Optimization: Hardware acceleration via translate3d / will-change',
    'Strict Rule: Zero top/left/width/height mutations in rAF to prevent layout thrashing'
  ],
  'webgl-pbr': [
    'Substrate: WebGL 2.0 PBR Rasterizer (Three.js)',
    'Pipeline: CPU Scene Graph -> Matrix World -> GPU Draw Calls -> PBR Fragment Shader',
    'Key Optimization: Instancing & shared geometry to enforce ≤ 30 draw calls',
    'Strict Rule: Complete scene traversal & dispose() on all geometries/materials'
  ],
  'glsl-shader': [
    'Substrate: Pure GPU Fragment Shader (Raw GLSL ES 3.0)',
    'Pipeline: 1 Quad (2 Triangles) -> 100% Raymarching in Fragment Shader',
    'Key Optimization: Sphere-tracing with analytical SDFs and distance bounding',
    'Strict Rule: Zero divergent branch divergence in ray loop to prevent warp stalls'
  ],
  'pixi-2d': [
    'Substrate: 2D GPU Vector Batching (Pixi.js v8)',
    'Pipeline: DisplayObject Tree -> BatchRenderer -> WebGPU/WebGL Quad Array',
    'Key Optimization: Single texture atlas keeps 30k+ sprites under 5 draw calls',
    'Strict Rule: Color tinting via vertex attributes rather than texture swapping'
  ],
  'webgpu-compute': [
    'Substrate: Next-Gen GPU Compute (WebGPU WGSL)',
    'Pipeline: Compute Shader Pass (VRAM Ping-Pong) -> Direct Vertex Draw Pass',
    'Key Optimization: Zero CPU physics calculations; double-buffered storage buffers',
    'Strict Rule: 16-byte WGSL memory alignment & no CPU ArrayBuffer readbacks'
  ],
  'hybrid-sotd': [
    'Substrate: Agency Hybrid Pipeline (Lenis + GSAP + Three.js)',
    'Pipeline: Lenis Virtual Scroll -> GSAP Scrub -> 1:1 WebGL Canvas Sync',
    'Key Optimization: Debounced ResizeObserver prevents DOM-to-WebGL coordinate drift',
    'Strict Rule: Screen-space DOM accessibility preserved above WebGL background plane'
  ],
  'generic': [
    'Substrate: Real-Time Creative Engine',
    'Performance Invariant: Maintain steady 60 FPS under continuous user interaction'
  ]
};
