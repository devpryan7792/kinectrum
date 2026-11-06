export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_blend;
uniform float u_stress_mode;

#define MAX_STEPS 128
#define SURF_DIST 0.001
#define MAX_DIST 40.0

// Rotation matrix around an axis
mat2 rot2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// Inigo Quilez Polynomial Smooth Minimum
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

// SDF Primitives
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Gyroid Non-Euclidean Manifold
float sdGyroid(vec3 p, float scale, float thickness, float bias) {
  vec3 pMod = p * scale;
  return abs(dot(sin(pMod), cos(pMod.zxy)) - bias) / scale - thickness;
}

// Global Scene Distance Map
float map(vec3 p) {
  // Center Liquid Chrome Core (Oscillating Sphere)
  float coreR = 0.95 + sin(u_time * 2.5) * 0.08;
  float d = sdSphere(p, coreR);

  // Orbiting Liquid Mercury Satellites (fused with smin)
  float t = u_time * 1.2;
  vec3 p1 = p - vec3(cos(t) * 1.45, sin(t * 1.5) * 0.4, sin(t) * 1.45);
  vec3 p2 = p - vec3(-cos(t * 0.8) * 1.5, cos(t * 1.2) * 0.6, -sin(t * 0.8) * 1.5);
  vec3 p3 = p - vec3(sin(t * 1.4) * 0.6, cos(t * 1.7) * 1.3, -cos(t * 1.4) * 0.6);

  float s1 = sdSphere(p1, 0.45);
  float s2 = sdSphere(p2, 0.38);
  float s3 = sdSphere(p3, 0.32);

  // Blend satellite droplets into core
  float blendK = 0.55 * u_blend;
  d = smin(d, s1, blendK);
  d = smin(d, s2, blendK);
  d = smin(d, s3, blendK);

  // Outer Gimbal Torus
  vec3 pTorus = p;
  pTorus.xz *= rot2D(u_time * 0.3);
  pTorus.yz *= rot2D(u_time * 0.2);
  float torus = sdTorus(pTorus, vec2(2.1, 0.04));
  d = min(d, torus);

  // Non-Euclidean Gyroid Manifold (Activated in Stress Mode)
  if (u_stress_mode > 0.5) {
    vec3 pGyr = p;
    pGyr.xy *= rot2D(u_time * 0.1);
    float gyroid = sdGyroid(pGyr, 2.8, 0.03, 0.2);
    // Bound gyroid within outer spherical shell
    float shell = abs(length(p) - 2.8) - 0.4;
    gyroid = max(gyroid, shell);
    d = min(d, gyroid);
  }

  return d;
}

// Raymarching Sphere Tracing Loop
float raymarch(vec3 ro, vec3 rd, out int stepsTaken) {
  float dO = 0.0;
  stepsTaken = 0;

  for (int i = 0; i < MAX_STEPS; i++) {
    stepsTaken = i;
    vec3 p = ro + rd * dO;
    float dS = map(p);
    dO += dS;

    if (dO > MAX_DIST || abs(dS) < SURF_DIST) {
      break;
    }
  }

  return dO;
}

// Analytic Normal Calculation via Central Differences
vec3 calcNormal(vec3 p) {
  float d = map(p);
  vec2 e = vec2(0.001, 0.0);

  vec3 n = d - vec3(
    map(p - e.xyy),
    map(p - e.yxy),
    map(p - e.yyx)
  );

  return normalize(n);
}

// Soft Shadow Penumbra Approximation
float calcSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;

  for (int i = 0; i < 32; i++) {
    float h = map(ro + rd * t);
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.25);
    if (res < 0.005 || t > maxt) break;
  }

  return clamp(res, 0.0, 1.0);
}

void main() {
  // Normalized UV with aspect correction
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Camera Ray Setup with Mouse Orbital Navigation
  vec3 ro = vec3(0.0, 0.0, 3.8);
  vec3 rd = normalize(vec3(uv, -1.35));

  // Mouse orbit tilt
  vec2 mouseAngles = (u_mouse - 0.5) * 3.1415;
  ro.yz *= rot2D(-mouseAngles.y * 0.7);
  ro.xz *= rot2D(-mouseAngles.x * 1.2);
  rd.yz *= rot2D(-mouseAngles.y * 0.7);
  rd.xz *= rot2D(-mouseAngles.x * 1.2);

  int steps;
  float d = raymarch(ro, rd, steps);

  // Deep Obsidian Background with subtle radial chromatic vignette
  vec3 col = vec3(0.039, 0.039, 0.047);
  col += vec3(0.02, 0.03, 0.06) * (1.0 - length(uv) * 0.8);

  // Primary Light Sources
  vec3 keyLightPos = vec3(4.0, 6.0, 5.0);
  vec3 rimLightPos = vec3(-4.0, -3.0, -4.0);

  if (d < MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = calcNormal(p);
    vec3 v = -rd;

    // Key Light Diffuse & Blinn-Phong Specular
    vec3 lKey = normalize(keyLightPos - p);
    float diffKey = max(dot(n, lKey), 0.0);
    vec3 hKey = normalize(lKey + v);
    float specKey = pow(max(dot(n, hKey), 0.0), 64.0);
    float shadow = calcSoftShadow(p + n * 0.02, lKey, 0.02, 6.0, 16.0);

    // Rim Light (Cool Cyan Phosphor)
    vec3 lRim = normalize(rimLightPos - p);
    float rimFactor = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 rimColor = vec3(0.48, 0.63, 0.97) * rimFactor * 2.2;

    // Liquid Chrome Reflectance with Chromatic Dispersion
    vec3 refl = reflect(rd, n);
    vec3 chromeBase = vec3(0.92, 0.94, 0.98);

    // Fake environment reflection
    float envReflection = pow(max(dot(refl, vec3(0.0, 1.0, 0.2)), 0.0), 8.0);
    float chromaticR = pow(max(dot(reflect(rd, n + vec3(0.02, 0.0, 0.0)), vec3(0.0, 1.0, 0.2)), 0.0), 12.0);
    float chromaticB = pow(max(dot(reflect(rd, n - vec3(0.02, 0.0, 0.0)), vec3(0.0, 1.0, 0.2)), 0.0), 12.0);

    vec3 specChromatic = vec3(chromaticR, envReflection, chromaticB) * 1.5;

    // Ambient Occlusion from Raymarch Step Count
    float ao = clamp(1.0 - float(steps) / float(MAX_STEPS), 0.15, 1.0);

    col = chromeBase * (0.1 + diffKey * 0.4 * shadow) +
          vec3(specKey * 0.9 * shadow) +
          specChromatic * 0.8 +
          rimColor;

    col *= ao;
  }

  // Volumetric Core Glow (Singularity Accretion Glow)
  float centerDist = length(cross(ro, rd));
  float glow = 0.04 / (centerDist * centerDist + 0.12);
  col += vec3(0.48, 0.63, 0.97) * glow * (0.8 + sin(u_time * 3.0) * 0.2);

  // Tone mapping and gamma correction
  col = col / (col + vec3(1.0)); // Reinhard
  col = pow(col, vec3(1.0 / 2.2)); // Gamma

  fragColor = vec4(col, 1.0);
}
`;
