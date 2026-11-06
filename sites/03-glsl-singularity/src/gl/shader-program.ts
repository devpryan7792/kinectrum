/**
 * WebGL 2.0 Shader Program Compiler & Linker
 * Enforces strict compilation error checks and descriptive diagnostic logs.
 */

export function createGLProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) {
    throw new Error('[GLSL] Failed to allocate WebGLProgram');
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`[GLSL Link Error]: ${info}`);
  }

  // Shaders can be safely deleted once linked into program
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return program;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error(`[GLSL] Failed to allocate shader of type ${type}`);
  }

  gl.shaderSource(shader, source.trim());
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    const shaderType = type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
    gl.deleteShader(shader);
    throw new Error(`[GLSL ${shaderType} Compile Error]:\n${info}\nSource:\n${source}`);
  }

  return shader;
}
