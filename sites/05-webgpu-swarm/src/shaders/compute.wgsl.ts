export const computeShaderWGSL = `
struct Particle {
  pos : vec4<f32>, // xyz = position, w = life/phase
  vel : vec4<f32>, // xyz = velocity, w = mass
};

struct SimParams {
  delta : f32,
  time : f32,
  mouseX : f32,
  mouseY : f32,
  count : u32,
  gravityStrength : f32,
  curlScale : f32,
  blastForce : f32,
};

@group(0) @binding(0) var<uniform> params : SimParams;
@group(0) @binding(1) var<storage, read> particlesIn : array<Particle>;
@group(0) @binding(2) var<storage, read_write> particlesOut : array<Particle>;

// Simple 3D pseudo-noise for curl vector calculation
fn hash(p : vec3<f32>) -> vec3<f32> {
  var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}

fn curlNoise(p : vec3<f32>) -> vec3<f32> {
  let e = 0.08;
  let dx = hash(p + vec3<f32>(e, 0.0, 0.0)) - hash(p - vec3<f32>(e, 0.0, 0.0));
  let dy = hash(p + vec3<f32>(0.0, e, 0.0)) - hash(p - vec3<f32>(0.0, e, 0.0));
  let dz = hash(p + vec3<f32>(0.0, 0.0, e)) - hash(p - vec3<f32>(0.0, 0.0, e));

  let cX = dy.z - dz.y;
  let cY = dz.x - dx.z;
  let cZ = dx.y - dy.x;

  return normalize(vec3<f32>(cX, cY, cZ));
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let index = global_id.x;
  if (index >= params.count) {
    return;
  }

  var p = particlesIn[index];
  var pos = p.pos.xyz;
  var vel = p.vel.xyz;

  // 1. Center Attractor (Gravitational Pull to (0, 0, 0))
  let distToCenter = length(pos);
  let dirToCenter = -normalize(pos);
  let gravity = dirToCenter * (params.gravityStrength / (distToCenter * distToCenter + 0.15));

  // 2. Swirling Vortex Tangent Force
  let tangent = normalize(cross(pos, vec3<f32>(0.0, 1.0, 0.0)));
  let vortex = tangent * (0.85 / (distToCenter + 0.2));

  // 3. Fluid Curl Turbulence
  let curl = curlNoise(pos * params.curlScale + vec3<f32>(params.time * 0.15)) * 0.45;

  // 4. Cursor Shockwave / Gravity Interaction
  let mousePos = vec3<f32>(params.mouseX, params.mouseY, 0.0);
  let toMouse = mousePos - pos;
  let distToMouse = length(toMouse);
  var mouseForce = vec3<f32>(0.0);

  if (params.blastForce > 0.01) {
    // Shockwave repulsion
    if (distToMouse < 2.5 && distToMouse > 0.01) {
      let push = (1.0 - distToMouse / 2.5) * params.blastForce * 8.0;
      mouseForce = -normalize(toMouse) * push;
    }
  } else {
    // Gentle cursor attractor
    if (distToMouse < 3.0 && distToMouse > 0.1) {
      let pull = (1.0 - distToMouse / 3.0) * 1.5;
      mouseForce = normalize(toMouse) * pull;
    }
  }

  // Velocity Integration
  vel = (vel + (gravity + vortex + curl + mouseForce) * params.delta) * 0.985;
  pos += vel * params.delta;

  // Outer Boundary Recoil
  if (length(pos) > 5.5) {
    pos = normalize(pos) * 5.45;
    vel = -vel * 0.5;
  }

  p.pos = vec4<f32>(pos, p.pos.w + params.delta);
  p.vel = vec4<f32>(vel, p.vel.w);

  particlesOut[index] = p;
}
`;
