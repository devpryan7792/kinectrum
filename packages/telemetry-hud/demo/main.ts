import { initTelemetryHUD } from '../src/index';

// Initialize HUD
const hud = initTelemetryHUD({
  substrate: 'webgl-pbr',
  title: 'EPOCH 0 // HARNESS',
  badge: 'VERIFIED',
  position: 'bottom-right',
  initialExpanded: true,
  maxDrawCallsSla: 30
});

// Setup WebGL context
const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (gl) {
  hud.instrumentWebGL(gl);

  // Simple WebGL render setup
  const vsSource = `
    attribute vec2 position;
    uniform float u_angle;
    void main() {
      float c = cos(u_angle);
      float s = sin(u_angle);
      mat2 rot = mat2(c, -s, s, c);
      gl_Position = vec4(rot * position, 0.0, 1.0);
    }
  `;
  const fsSource = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
      gl_FragColor = vec4(u_color, 1.0);
    }
  `;

  function createShader(glCtx: WebGLRenderingContext, type: number, src: string) {
    const s = glCtx.createShader(type)!;
    glCtx.shaderSource(s, src);
    glCtx.compileShader(s);
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const angleLoc = gl.getUniformLocation(prog, 'u_angle');
  const colorLoc = gl.getUniformLocation(prog, 'u_color');

  let extraDraws = 0;
  let angle = 0;

  function render() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl!.viewport(0, 0, canvas.width, canvas.height);

    gl!.clearColor(0.05, 0.05, 0.08, 1.0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    angle += 0.02;
    gl!.uniform1f(angleLoc, angle);
    gl!.uniform3f(colorLoc, 0.48, 0.63, 0.97);

    // Primary draw call
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    // Extra simulated draw calls
    for (let i = 0; i < extraDraws; i++) {
      gl!.uniform3f(colorLoc, 0.6 + i * 0.02, 0.4, 0.8);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Button hooks
  document.getElementById('btn-draws')?.addEventListener('click', () => {
    extraDraws = (extraDraws + 10) % 60;
  });

  document.getElementById('btn-stall')?.addEventListener('click', () => {
    const start = performance.now();
    while (performance.now() - start < 35) {
      // Busy wait to simulate CPU hitch / dropped frame
    }
  });

  document.getElementById('btn-sub-gsap')?.addEventListener('click', () => {
    hud.setSubstrate('dom-svg');
  });
  document.getElementById('btn-sub-three')?.addEventListener('click', () => {
    hud.setSubstrate('webgl-pbr');
  });
  document.getElementById('btn-sub-glsl')?.addEventListener('click', () => {
    hud.setSubstrate('glsl-shader');
  });
}
