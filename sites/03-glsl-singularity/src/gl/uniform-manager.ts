export class UniformManager {
  private gl: WebGL2RenderingContext;

  private uTimeLoc: WebGLUniformLocation | null;
  private uResolutionLoc: WebGLUniformLocation | null;
  private uMouseLoc: WebGLUniformLocation | null;
  private uBlendLoc: WebGLUniformLocation | null;
  private uStressModeLoc: WebGLUniformLocation | null;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;

    this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
    this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    this.uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    this.uBlendLoc = gl.getUniformLocation(program, 'u_blend');
    this.uStressModeLoc = gl.getUniformLocation(program, 'u_stress_mode');
  }

  public setTime(time: number): void {
    if (this.uTimeLoc) this.gl.uniform1f(this.uTimeLoc, time);
  }

  public setResolution(width: number, height: number): void {
    if (this.uResolutionLoc) this.gl.uniform2f(this.uResolutionLoc, width, height);
  }

  public setMouse(x: number, y: number): void {
    if (this.uMouseLoc) this.gl.uniform2f(this.uMouseLoc, x, y);
  }

  public setBlendFactor(factor: number): void {
    if (this.uBlendLoc) this.gl.uniform1f(this.uBlendLoc, factor);
  }

  public setStressMode(active: boolean): void {
    if (this.uStressModeLoc) this.gl.uniform1f(this.uStressModeLoc, active ? 1.0 : 0.0);
  }
}
