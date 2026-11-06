# Technical Specification: Epoch 5 — WebGPU WGSL Million-Body Swarm

## 1. Executive Summary & Design DNA
Epoch 5 builds **The Million-Body Celestial Vortex**, a cutting-edge exploration of the WebGPU API and WGSL compute shaders. Where CPU-based physics engines choke on 5,000 particles, WebGPU moves the entire simulation loop to the graphics card's compute pipeline. Half a million particles interact via gravitational attractors, curl noise turbulence, and barrier collisions—all calculated in parallel across GPU workgroups with zero CPU overhead per frame.

---

## 2. The WebGPU Compute Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. DOUBLE-BUFFERED STORAGE BUFFERS (GPU VRAM)                          │
│ - Buffer A (read) <-> Buffer B (write) ping-pong architecture          │
│ - Particle Struct: pos: vec4<f32>, vel: vec4<f32> (32 bytes aligned)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. WGSL COMPUTE SHADER PASS                                            │
│ - Workgroup Size: 64 threads per workgroup                             │
│ - Dispatch: ceil(num_particles / 64) workgroups                        │
│ - Calculations: 3D Simplex Curl Noise, Cursor Gravity, Border Bounce    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. DIRECT VERTEX INSTANCING RENDER PASS                                │
│ - Render pipeline consumes the active storage buffer DIRECTLY as       │
│   an instanced vertex buffer without copying data back to CPU!         │
├────────────────────────────────────────────────────────────────────────┤
│ 4. GRACEFUL WEBGPU CAPABILITY FALLBACK                                 │
│ - If navigator.gpu is null: displays an interactive hardware autopsy   │
│   explaining WebGPU requirements, driver flags, and fallback visuals   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. Curl Noise Velocity Formulation
To generate turbulent fluid-like particle swirling without divergence:
$$\vec{v}_{\text{curl}}(\vec{p}) = \nabla \times \vec{\Psi}(\vec{p}) = \begin{bmatrix}
\frac{\partial \Psi_z}{\partial y} - \frac{\partial \Psi_y}{\partial z} \\
\frac{\partial \Psi_x}{\partial z} - \frac{\partial \Psi_z}{\partial x} \\
\frac{\partial \Psi_y}{\partial x} - \frac{\partial \Psi_x}{\partial y}
\end{bmatrix}$$
Where $\vec{\Psi}$ is a 3D simplex noise potential vector.

### 3.2. Workgroup Memory Alignment Invariant
WGSL struct alignment requires explicit 16-byte boundary packing:
```rust
struct Particle {
  pos : vec4<f32>, // 16 bytes (xyz = position, w = life/phase)
  vel : vec4<f32>, // 16 bytes (xyz = velocity, w = mass)
};
```
Total struct size = 32 bytes. For 500,000 particles, storage buffer size = $500,000 \times 32 = 16,000,000\text{ bytes}$ ($\sim 15.26\text{ MB}$).

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **500,000 Concurrent Particles Simulated on GPU**:
  - Zero CPU calculation during animation tick.
  - Zero read-back calls (`copyBufferToBuffer` to map memory back to JavaScript is strictly prohibited).
- **SLA Assertion**: Frame rate $\ge 58\text{ FPS}$ on any modern WebGPU-capable hardware (Apple M-series, RTX 30/40, Radeon 6000+).

---

## 5. File Structure (`sites/05-webgpu-swarm/`)

```
sites/05-webgpu-swarm/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # WebGPU adapter request & init
│   ├── style.css                        # Cybernetic dark viewport styling
│   ├── gpu/
│   │   ├── device-manager.ts            # GPUDevice request & fallback handler
│   │   ├── buffer-allocator.ts          # Ping-pong storage buffers setup
│   │   ├── compute-pipeline.ts          # WGSL compute shader pass
│   │   └── render-pipeline.ts           # Instanced particle render pass
│   ├── shaders/
│   │   ├── compute.wgsl                 # Flocking, curl noise & gravity math
│   │   └── render.wgsl                  # Billboard vertex & fragment shader
│   ├── fallback/
│   │   └── hardware-diagnostics.ts      # WebGPU capability & driver report
│   └── telemetry/
│       └── webgpu-instrument.ts         # Connect to Telemetry HUD
```

---

## 6. The 12 Micro-Phases for Epoch 5

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 5.1** | Setup | WebGPU types, Vite WGSL plugin, strict TS config |
| **Phase 5.2** | Device | `navigator.gpu.requestAdapter()` and `requestDevice()` |
| **Phase 5.3** | Fallback | Diagnostic screen for unsupported browsers/flags |
| **Phase 5.4** | Buffers | Ping-pong `GPUBuffer` allocation (32-byte struct alignment) |
| **Phase 5.5** | WGSL | Compute shader authoring: particle state update |
| **Phase 5.6** | WGSL | 3D Simplex Curl Noise implementation in WGSL |
| **Phase 5.7** | WGSL | Cursor gravitational pull and orbital velocity vortex |
| **Phase 5.8** | Pipeline| Compute pipeline & bind group creation |
| **Phase 5.9** | Pipeline| Render pipeline consuming storage buffer as vertex input |
| **Phase 5.10**| Hardening | Workgroup memory barrier audit & zero CPU read-back gate |
| **Phase 5.11**| Telemetry| Hook into `packages/telemetry-hud` with WebGPU metrics |
| **Phase 5.12**| Benchmark| 500,000 particle stress test verification at 60 FPS |
