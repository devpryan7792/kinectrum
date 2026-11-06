/**
 * Screen-Aligned Quad (2 Triangles, 4 Vertices)
 * Renders across the entire viewport to drive fullscreen fragment shader passes.
 */

export class ScreenQuad {
  private gl: WebGL2RenderingContext;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    // Fullscreen quad spanning [-1, 1] on XY and [0, 1] on UV
    // Format: [x, y, u, v]
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0, 0.0,
       1.0, -1.0, 1.0, 0.0,
      -1.0,  1.0, 0.0, 1.0,
       1.0,  1.0, 1.0, 1.0
    ]);

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Position attribute (layout location 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);

    // UV attribute (layout location 1)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
      1,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.bindVertexArray(null);
  }

  public render(): void {
    this.gl.bindVertexArray(this.vao);
    // Draw 4 vertices as a triangle strip (2 triangles)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.gl.bindVertexArray(null);
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.vbo);
    this.gl.deleteVertexArray(this.vao);
  }
}
