import * as THREE from 'three';

export const waveVertexShader = `
uniform float u_time;
uniform float u_velocity;
uniform vec2 u_mouse;
uniform float u_amp;

varying vec2 v_uv;
varying vec3 v_position;
varying vec3 v_normal;
varying float v_elevation;

void main() {
  v_uv = uv;
  vec3 pos = position;

  // Multi-frequency liquid surface waves
  float wave1 = sin(pos.x * 0.015 + u_time * 2.0) * cos(pos.y * 0.015 + u_time * 1.5);
  float wave2 = sin(pos.y * 0.025 + u_time * 2.8) * 0.5;

  // Scroll velocity surge displacement (visible 3D amplitude!)
  float vel = clamp(u_velocity * 0.08, -60.0, 60.0);
  float velocityWave = sin(pos.y * 0.01 + u_time * 4.0) * vel * 0.8;

  // Interactive mouse ripple
  float mouseDist = length(pos.xy - u_mouse);
  float mouseRipple = sin(mouseDist * 0.03 - u_time * 5.0) * exp(-mouseDist * 0.005) * 35.0;

  float totalElevation = (wave1 * u_amp) + (wave2 * u_amp * 0.6) + velocityWave + mouseRipple;
  pos.z += totalElevation;

  v_elevation = totalElevation;
  v_position = pos;
  v_normal = normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const waveFragmentShader = `
uniform float u_time;
uniform float u_velocity;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_wireframe;

varying vec2 v_uv;
varying vec3 v_position;
varying float v_elevation;

void main() {
  // Normalized wave elevation (-40 to +40)
  float normElev = clamp((v_elevation + 30.0) / 60.0, 0.0, 1.0);

  // Gradient mixing across wave crests
  vec3 col = mix(u_colorA, u_colorB, normElev);

  // Dynamic illuminated crest highlights
  float crest = pow(normElev, 3.0) * 1.4;
  col += vec3(0.4, 0.6, 1.0) * crest;

  // Edge glow / Fresnel vignette
  float edgeX = smoothstep(0.0, 0.08, v_uv.x) * smoothstep(1.0, 0.92, v_uv.x);
  float edgeY = smoothstep(0.0, 0.08, v_uv.y) * smoothstep(1.0, 0.92, v_uv.y);
  float edgeVignette = edgeX * edgeY;

  // Grid wireframe accent
  float grid = step(0.96, fract(v_uv.x * 24.0)) + step(0.96, fract(v_uv.y * 24.0));
  if (u_wireframe > 0.5) {
    col = mix(col, vec3(1.0, 0.4, 0.7), grid * 0.8);
  } else {
    col += vec3(0.2, 0.3, 0.5) * grid * 0.25;
  }

  // Alpha transparency
  float alpha = mix(0.35, 0.85, normElev) * edgeVignette;

  gl_FragColor = vec4(col, alpha);
}
`;

export function createWaveMaterial(
  colorA = 0x1A1B26,
  colorB = 0x7AA2F7
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: waveVertexShader,
    fragmentShader: waveFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_velocity: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_amp: { value: 25.0 },
      u_colorA: { value: new THREE.Color(colorA) },
      u_colorB: { value: new THREE.Color(colorB) },
      u_wireframe: { value: 0.0 }
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}
