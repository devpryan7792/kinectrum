export class WebGLProbe {
  private activeDrawCalls = 0;
  private lastFrameDrawCalls = 0;
  private hookedContexts = new Set<WebGLRenderingContext | WebGL2RenderingContext>();
  private originalMethods = new Map<any, Function>();

  public instrument(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.hookedContexts.has(gl)) return;
    this.hookedContexts.add(gl);

    const probe = this;

    const wrap = (target: any, name: string) => {
      const orig = target[name];
      if (typeof orig === 'function') {
        probe.originalMethods.set(orig, orig);
        target[name] = function (...args: any[]) {
          probe.activeDrawCalls++;
          return orig.apply(this, args);
        };
      }
    };

    wrap(gl, 'drawArrays');
    wrap(gl, 'drawElements');

    // WebGL 2 / ANGLE instanced extensions
    if ('drawArraysInstanced' in gl) {
      wrap(gl, 'drawArraysInstanced');
    }
    if ('drawElementsInstanced' in gl) {
      wrap(gl, 'drawElementsInstanced');
    }
  }

  public incrementManual(count: number = 1): void {
    this.activeDrawCalls += count;
  }

  public endFrame(): number {
    this.lastFrameDrawCalls = this.activeDrawCalls;
    this.activeDrawCalls = 0;
    return this.lastFrameDrawCalls;
  }

  public getLastFrameDrawCalls(): number {
    return this.lastFrameDrawCalls;
  }

  public destroy(): void {
    this.hookedContexts.clear();
    this.originalMethods.clear();
  }
}
