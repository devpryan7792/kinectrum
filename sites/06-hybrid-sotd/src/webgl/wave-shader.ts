import * as THREE from 'three';

export const waveVertexShader = `
uniform float u_time;
uniform float u_velocity;

varying vec2 v_uv;

void main() {
  v_uv = uv;
  vec3 pos = position;

  // Fluid ripple wave driven by scroll velocity
  float normalizedVel = clamp(u_velocity * 0.05, -3.0, 3.0);
  float wave = sin(uv.y * 10.0 + u_time * 2.5) * normalizedVel * 0.15;
  pos.z += wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const waveFragmentShader = `
uniform float u_time;
uniform float u_velocity;
uniform vec3 u_color;

varying vec2 v_uv;

void main() {
  float vel = abs(u_velocity) * 0.02;

  // Base background mesh tint
  vec3 baseColor = u_color;

  // Edge chromatic dispersion on velocity
  float vignette = smoothstep(0.0, 0.2, v_uv.x) * smoothstep(1.0, 0.8, v_uv.x) *
                   smoothstep(0.0, 0.2, v_uv.y) * smoothstep(1.0, 0.8, v_uv.y);

  // Subtle wave brightness
  float ripple = sin(v_uv.y * 12.0 + u_time * 2.0) * vel * 0.5;

  vec3 finalColor = baseColor + vec3(ripple);
  gl_FragColor = vec4(finalColor, 0.85 * vignette);
}
`;

export function createWaveMaterial(colorHex = 0x1A1B26): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: waveVertexShader,
    fragmentShader: waveFragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_velocity: { value: 0 },
      u_color: { value: new THREE.Color(colorHex) }
    },
    transparent: true,
    side: THREE.DoubleSide
  });
}
