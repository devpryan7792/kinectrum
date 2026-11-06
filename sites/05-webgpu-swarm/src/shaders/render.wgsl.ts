export const renderShaderWGSL = `
struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) color : vec3<f32>,
};

struct RenderParams {
  aspect : f32,
  zoom : f32,
};

@group(0) @binding(0) var<uniform> params : RenderParams;

@vertex
fn vs_main(
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) particlePos : vec4<f32>,
  @location(1) particleVel : vec4<f32>
) -> VertexOutput {
  // 6 vertices forming 2 triangles (billboard quad)
  var corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );

  let corner = corners[vertexIndex];
  let quadSize = 0.012;

  // Project 3D position with perspective
  let z = particlePos.z + 6.0;
  let perspective = params.zoom / z;

  var projected = vec2<f32>(
    particlePos.x * perspective / params.aspect,
    particlePos.y * perspective
  );

  projected += corner * quadSize * perspective;

  var out : VertexOutput;
  out.position = vec4<f32>(projected, z / 20.0, 1.0);
  out.uv = corner;

  // Color gradient based on velocity speed
  let speed = length(particleVel.xyz);
  let coldColor = vec3<f32>(0.48, 0.63, 0.97); // Cyan
  let hotColor = vec3<f32>(1.0, 0.96, 0.92);  // Incandescent White
  let fastColor = vec3<f32>(1.0, 0.35, 0.15); // Coral energy

  var col = mix(coldColor, hotColor, clamp(speed * 0.4, 0.0, 1.0));
  if (speed > 2.0) {
    col = mix(hotColor, fastColor, clamp((speed - 2.0) * 0.5, 0.0, 1.0));
  }

  out.color = col;
  return out;
}

@fragment
fn fs_main(in : VertexOutput) -> @location(0) vec4<f32> {
  // Soft circular particle alpha
  let dist = length(in.uv);
  if (dist > 1.0) {
    discard;
  }

  let alpha = (1.0 - dist * dist) * 0.75;
  return vec4<f32>(in.color, alpha);
}
`;
