# Technical Specification: Epoch 2 — Three.js PBR Spatial Refraction

## 1. Executive Summary & Design DNA
Epoch 2 builds **The Optical Monolith**, a luxury real-time 3D experience designed to showcase physically based rendering (PBR), transmission optics, and studio lighting in Three.js. Drawing direct inspiration from **The Watch by 60fps** (Awwwards SOTD / Developer Award), this site demonstrates how to achieve photorealistic borosilicate glass refraction, chromatic dispersion, and anisotropic metal finishes under a strict draw-call budget.

---

## 2. The Optical Physics & Substrate Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. PROCEDURAL PARAMETRIC GEOMETRY                                      │
│ - Chamfered dodecahedral prism with hollow refractive cavities         │
│ - Brushed titanium gimbal chassis with knurled vernier rings           │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PHYSICALLY BASED TRANSMISSION (MeshPhysicalMaterial)                │
│ - Index of Refraction (IOR): 1.52 (optical borosilicate glass)         │
│ - Transmission: 0.94, Roughness: 0.12 (frosted optical dispersion)     │
│ - Chromatic Aberration & Spectral Dispersion: Abbe number V_d = 64.2   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. 3-POINT STUDIO LIGHTING & CAUSTICS                                  │
│ - Key Light: Warm directional light with tight PCF soft shadow bias    │
│ - Rim Light: Cool grazing light catching micro-chamfered bevels        │
│ - Fill Light: Low-intensity studio HDRI environment map (0.35 intensity)│
├────────────────────────────────────────────────────────────────────────┤
│ 4. CAMERA KINEMATICS & DAMPING                                         │
│ - Exponential decay inertia: damp3 & dampE (tau = 0.05)                │
│ - Orthographic technical view <-> Perspective spatial transition       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. Camera Inertia Damping Equation
To eliminate jitter and provide tactile physical weight to mouse rotation:
$$\vec{x}(t + \Delta t) = \vec{x}_{\text{target}} + (\vec{x}(t) - \vec{x}_{\text{target}}) \cdot e^{-\lambda \Delta t}$$
Where $\lambda = 12.0\text{ s}^{-1}$ ($95\%$ settling time of $\sim 250\text{ms}$).

### 3.2. Camera Projection Transition (Orthographic $\leftrightarrow$ Perspective)
Seamlessly matches camera frame height at distance $D$ when toggling projections:
$$h_{\text{ortho}} = 2 \cdot D \cdot \tan\left(\frac{\text{FOV}_{\text{rad}}}{2}\right)$$

### 3.3. Zero-Leak Memory Invariant (The Anti-Crash Gate)
WebGL contexts crash when geometries and materials are orphaned. The teardown lifecycle traverses the entire scene graph:
```typescript
export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => disposeMaterial(mat));
      } else {
        disposeMaterial(object.material);
      }
    }
  });
  renderer.dispose();
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  for (const key of Object.keys(mat)) {
    const value = (mat as any)[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      (value as THREE.Texture).dispose();
    }
  }
}
```

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **Multi-Layer Transmission Overdraw Test**: 5 overlapping refractive glass bodies with dynamic roughness blurring, dynamic studio lighting, and normal map micro-facets.
- **Strict Budget Ceiling**:
  - Maximum **30 draw calls** across the entire scene (enforced via instancing and shared materials).
  - Maximum **`devicePixelRatio = 2.0`** (preventing 4K/Retina thermal meltdown).
- **SLA Assertion**: Frame rate $\ge 58\text{ FPS}$ under continuous 360-degree orbital rotation.

---

## 5. File Structure (`sites/02-three-refraction/`)

```
sites/02-three-refraction/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # Bootstrap & telemetry integration
│   ├── style.css                        # Dark studio frame & HUD styling
│   ├── core/
│   │   ├── scene-manager.ts             # WebGLRenderer, Scene, Camera setup
│   │   ├── lighting-rig.ts              # 3-point studio lighting & HDRI setup
│   │   └── camera-controller.ts         # Inertial orbit & ortho/perspective lerp
│   ├── geometry/
│   │   ├── optical-monolith.ts          # Parametric chamfered glass geometry
│   │   └── gimbal-chassis.ts            # Brushed titanium mechanical frame
│   ├── materials/
│   │   ├── borosilicate-glass.ts        # MeshPhysicalMaterial with transmission
│   │   └── brushed-titanium.ts          # Metalness/roughness with anisotropic maps
│   ├── lifecycle/
│   │   └── resource-disposer.ts         # Zero-leak traversal & disposal audit
│   └── telemetry/
│       └── webgl-instrument.ts          # Connect to Telemetry HUD draw call hook
```

---

## 6. The 12 Micro-Phases for Epoch 2

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 2.1** | Setup | Workspace init, Three.js r170+, strict TS config |
| **Phase 2.2** | Core | WebGLRenderer setup with clamped pixel ratio ($\le 2$) |
| **Phase 2.3** | Camera | Inertial orbit controls with exponential decay ($\lambda = 12$) |
| **Phase 2.4** | Camera | Orthographic $\leftrightarrow$ Perspective projection interpolation |
| **Phase 2.5** | Geometry | Parametric chamfered prism geometry generation |
| **Phase 2.6** | Geometry | Mechanical titanium gimbal frame construction |
| **Phase 2.7** | Materials| Borosilicate transmission glass material configuration |
| **Phase 2.8** | Materials| Brushed titanium material with procedural micro-normals |
| **Phase 2.9** | Lighting | 3-point studio light rig + contact shadow plane |
| **Phase 2.10**| Lifecycle| Complete scene traversal and disposal teardown audit |
| **Phase 2.11**| Telemetry| Hook into `packages/telemetry-hud` with WebGL draw probe |
| **Phase 2.12**| Benchmark| 5-layer transmission stress test verified at 60 FPS |
