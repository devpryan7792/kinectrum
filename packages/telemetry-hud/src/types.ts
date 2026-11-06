export type SubstrateType =
  | 'dom-svg'
  | 'webgl-pbr'
  | 'glsl-shader'
  | 'pixi-2d'
  | 'webgpu-compute'
  | 'hybrid-sotd'
  | 'generic';

export interface TelemetryMetrics {
  fps: number;
  smoothedFps: number;
  frameDeltaMs: number;
  minFps: number;
  maxFps: number;
  drawCalls: number;
  domNodes: number;
  jsHeapSizeMb?: number;
  substrate: SubstrateType;
}

export interface TelemetryConfig {
  substrate?: SubstrateType;
  title?: string;
  badge?: string;
  targetElement?: HTMLElement;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialExpanded?: boolean;
  architecturalNotes?: string[];
  maxDrawCallsSla?: number;
  minFpsSla?: number;
}

export interface TelemetryInstance {
  recordFrame: () => void;
  instrumentWebGL: (gl: WebGLRenderingContext | WebGL2RenderingContext) => void;
  instrumentWebGPU: (passEncoder: any) => void;
  incrementDrawCalls: (count?: number) => void;
  setSubstrate: (substrate: SubstrateType) => void;
  setCommentary: (notes: string[]) => void;
  getMetrics: () => TelemetryMetrics;
  destroy: () => void;
}
