# Technical Specification: Epoch 3 — Pure GLSL Raymarched Singularity

## 1. Executive Summary & Design DNA
Epoch 3 builds **The Non-Euclidean Singularity**, a pure GPU fragment shader artwork. Drawing inspiration from **EDOLUS by Vertex3D** (Awwwards SOTD / Developer Award) and the computer graphics papers of Inigo Quilez, this site bypasses the 3D polygon pipeline completely. It renders complex non-Euclidean manifolds, liquid mercury metaballs, and gravitational lensing purely through mathematics on a single screen-spanning quad (2 triangles).

---

## 2. The Raymarching Mathematics & Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. SCREEN-ALIGNED QUAD (Raw WebGL 2.0 Context)                         │
│ - Zero 3D meshes: single vertex buffer with 4 vertices (-1 to +1)      │
│ - Every single pixel raymarched independently in parallel on GPU       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. SIGNED DISTANCE FIELD (SDF) ALGEBRA                                 │
│ - Primitives: Exact sphere, box, torus, gyroid, and mandelbox          │
│ - Blending: Polynomial smooth minimum (smin) for liquid chrome fusion  │
│ - Space Folding: Mirror symmetries, rotational repetitions             │
├────────────────────────────────────────────────────────────────────────┤
│ 3. ANALYTIC LIGHTING & OPTICS                                          │
│ - Normal calculation via central differences (step epsilon = 0.001)    │
│ - Blinn-Phong specular with Fresnel chromatic edge glow                │
│ - Soft shadow penumbras calculated via sphere-tracing distance ratios  │
│ - Volumetric smoke & glowing energy core integration                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. Sphere-Tracing Root Finding
The camera casts a ray $\vec{r}(t) = \vec{r}_0 + t \cdot \vec{d}$. The distance to the nearest surface is evaluated at each step:
$$t_{n+1} = t_n + d_{\text{scene}}(\vec{r}(t_n))$$
Terminating when $d < 0.001$ (surface hit) or $t > t_{\text{max}} = 50.0$ (background miss).

### 3.2. Polynomial Smooth Minimum (`smin`)
Liquid metaball fusion without sharp crease artifacts:
$$\text{smin}(a, b, k) = -\ln\left(e^{-k \cdot a} + e^{-k \cdot b}\right) / k$$
Or the optimized polynomial form:
$$h = \max\left(k - |a - b|, 0.0\right) / k$$
$$\text{smin}_{\text{poly}}(a, b, k) = \min(a, b) - h^3 \cdot k \cdot \frac{1}{6}$$

### 3.3. Analytic Surface Normals
Calculated via central differences:
$$\vec{n} = \text{normalize}\left(\begin{bmatrix}
d(\vec{p} + \epsilon \hat{x}) - d(\vec{p} - \epsilon \hat{x}) \\
d(\vec{p} + \epsilon \hat{y}) - d(\vec{p} - \epsilon \hat{y}) \\
d(\vec{p} + \epsilon \hat{z}) - d(\vec{p} - \epsilon \hat{z})
\end{bmatrix}\right), \quad \epsilon = 0.001$$

### 3.4. Soft Shadows via Distance Ratios
Soft shadow attenuation coefficient:
$$S = \min_{t} \left(\frac{k \cdot d(\vec{p} + t \cdot \vec{l})}{t}\right)$$

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **128-Step Raymarching at Native Viewport Resolution**: Raymarching deep gyroid manifolds and 6 interacting liquid chrome metaballs.
- **GPU Warp Divergence Prevention**:
  - Unrolled loops with fixed compile-time constants (`#define MAX_STEPS 128`).
  - No divergent branches inside the march loop that would stall SIMD threads.
  - Sphere bounding-volume pre-check to bypass empty space instantly.
- **SLA Assertion**: Frame rate $\ge 58\text{ FPS}$ on desktop GPU at 1080p, and $\le 16.6\text{ms}$ frame delta.

---

## 5. File Structure (`sites/03-glsl-singularity/`)

```
sites/03-glsl-singularity/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # Raw WebGL 2.0 initialization
│   ├── style.css                        # Fullscreen canvas & cybernetic HUD
│   ├── gl/
│   │   ├── shader-program.ts            # WebGL shader compiler & error parser
│   │   ├── screen-quad.ts               # 2-triangle vertex buffer setup
│   │   └── uniform-manager.ts           # Time, resolution, pointer, camera uniforms
│   ├── shaders/
│   │   ├── vertex.glsl                  # Screen quad pass-through
│   │   └── fragment.glsl                # Raymarching, SDFs, lighting, caustics
│   └── telemetry/
│       └── shader-instrument.ts         # Hook into Telemetry HUD
```

---

## 6. The 12 Micro-Phases for Epoch 3

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 3.1** | Setup | Raw WebGL 2.0 canvas scaffolding, Vite GLSL plugin |
| **Phase 3.2** | GL Core | Strict shader program compilation & syntax error reporter |
| **Phase 3.3** | GL Core | Screen-aligned quad VBO and attribute pointer binding |
| **Phase 3.4** | GL Core | Uniform buffer passing: `u_time`, `u_resolution`, `u_mouse` |
| **Phase 3.5** | Math | Ray generation with field-of-view perspective matrix |
| **Phase 3.6** | SDFs | Basic primitives (sphere, rounded box, torus) in GLSL |
| **Phase 3.7** | SDFs | Polynomial smooth-min (`smin`) liquid mercury fusion |
| **Phase 3.8** | Shading | Analytic normal calculation via tetrahedral differences |
| **Phase 3.9** | Shading | Blinn-Phong lighting, Fresnel chromatic rim, soft shadows |
| **Phase 3.10**| Hardening | GPU warp divergence audit & bounding sphere pre-cull |
| **Phase 3.11**| Telemetry| Hook into `packages/telemetry-hud` with 1 draw call tracking |
| **Phase 3.12**| Benchmark| 128-step stress test verification at 60 FPS |
