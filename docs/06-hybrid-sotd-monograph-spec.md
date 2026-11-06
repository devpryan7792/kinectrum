# Technical Specification: Epoch 6 — The Agency SOTD Hybrid Standard

## 1. Executive Summary & Design DNA
Epoch 6 builds **The Architectural Monograph**, the definitive implementation of the modern creative agency stack. Studio giants like **Active Theory**, **Locomotive**, **Obys**, and **Resn** do not choose between HTML and WebGL: they fuse them into a seamless hybrid pipeline. Semantic HTML provides accessibility, SEO, and typography; Lenis normalizes inertia scroll; GSAP orchestrates scroll timelines; and a background Three.js WebGL canvas provides liquid distortion and spatial depth.

---

## 2. The Hybrid Pipeline Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. SEMANTIC ACCESSIBLE DOM LAYER (Screen Space)                        │
│ - Semantic <header>, <main>, <section>, <article> structure            │
│ - High-contrast typography & interactive text blocks                   │
│ - Perfect accessibility & screen-reader compatibility                  │
├────────────────────────────────────────────────────────────────────────┤
│ 2. VIRTUAL INERTIA LUBRICANT (Lenis v1.1+)                             │
│ - Normalizes scroll velocity across trackpad, mousewheel, and touch    │
│ - Emits continuous scroll progress: scrollY, velocity, direction       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. TIMELINE ORCHESTRATION (GSAP ScrollTrigger)                         │
│ - ScrollTrigger tied directly to Lenis requestAnimationFrame           │
│ - Normalized scrub ratios (0.0 to 1.0) controlling page scenes         │
├────────────────────────────────────────────────────────────────────────┤
│ 4. SYNCED WEBGL BACKGROUND CANVAS (Three.js)                           │
│ - Canvas positioned fixed under DOM: pointer-events: none              │
│ - Mesh planes mapped 1:1 to DOM image coordinates                      │
│ - Velocity-based mesh wave distortion in GLSL:                         │
│   vertex.z += sin(uv.y * 10.0 + u_time) * u_velocity * 0.05            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. DOM-to-WebGL Coordinate Projection
Every HTML element with `data-webgl-sync` has its bounding box mapped directly to Three.js world space coordinates:
$$\text{mesh.position.x} = \left(\text{rect.left} + \frac{\text{rect.width}}{2} - \frac{W_{\text{viewport}}}{2}\right) \cdot \frac{W_{\text{world}}}{W_{\text{viewport}}}$$
$$\text{mesh.position.y} = -\left(\text{rect.top} + \frac{\text{rect.height}}{2} - \frac{H_{\text{viewport}}}{2} + \text{scrollY}\right) \cdot \frac{H_{\text{world}}}{H_{\text{viewport}}}$$

### 3.2. Scroll Velocity Waveform Formulation
As the user scrolls, velocity $v(t) = \frac{\Delta y}{\Delta t}$ passes into a custom vertex shader to produce an organic fluid ripple:
$$z(u, v) = A \cdot \tanh\left(\frac{v(t)}{v_{\text{max}}}\right) \cdot \sin(k_y \cdot v + \omega \cdot t)$$
This creates liquid physical inertia without disturbing text legibility.

### 3.3. Resize & Font-Load Desync Prevention Invariant
To prevent the dreaded "drifting WebGL background" bug:
- A `ResizeObserver` monitors `<main>`.
- `document.fonts.ready` triggers a synchronized `ScrollTrigger.refresh()` and `lenis.resize()`.
- Updates are debounced with `requestAnimationFrame` to avoid layout thrashing.

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **Violent Scroll Scrubbing & Viewport Resizing**:
  - Rapid trackpad flicking (velocities $> 3,000\text{px/s}$) and window resizing.
  - Zero pixel drift between DOM text and WebGL background mesh bounds.
- **SLA Assertion**: Frame rate $\ge 58\text{ FPS}$ during peak scroll velocity on 1080p/4K.

---

## 5. File Structure (`sites/06-hybrid-sotd/`)

```
sites/06-hybrid-sotd/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # Bootstrap hybrid pipeline
│   ├── style.css                        # Swiss editorial layout & CSS
│   ├── scroll/
│   │   ├── lenis-controller.ts          # Lenis smooth scroll setup
│   │   └── gsap-bridge.ts               # Connect Lenis tick to ScrollTrigger
│   ├── webgl/
│   │   ├── background-scene.ts          # Three.js canvas & camera setup
│   │   ├── dom-sync-plane.ts            # DOM-to-WebGL projection mapper
│   │   └── wave-shader.ts               # Velocity-driven liquid distortion
│   ├── resilience/
│   │   └── resize-guard.ts              # Font load & debounced ResizeObserver
│   └── telemetry/
│       └── hybrid-instrument.ts         # Connect to Telemetry HUD
```

---

## 6. The 12 Micro-Phases for Epoch 6

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 6.1** | Setup | Workspace init, Lenis v1.1, GSAP 3, Three.js r170+ |
| **Phase 6.2** | DOM | Semantic editorial markup with `data-webgl-sync` anchors |
| **Phase 6.3** | Scroll | Lenis smooth scroll configuration with inertia curve |
| **Phase 6.4** | Bridge | Connecting Lenis `scroll` callback to `ScrollTrigger.update` |
| **Phase 6.5** | WebGL | Fullscreen Three.js background canvas with orthographic projection |
| **Phase 6.6** | Mapper | Mathematical 1:1 projection of DOM rects to WebGL planes |
| **Phase 6.7** | Shaders | Custom GLSL vertex wave shader driven by scroll velocity |
| **Phase 6.8** | Shaders | Fragment chromatic dispersion and soft edge vignetting |
| **Phase 6.9** | Resilience| `ResizeObserver` + `document.fonts.ready` sync handler |
| **Phase 6.10**| Hardening | Layout thrashing audit during high-velocity scroll ticks |
| **Phase 6.11**| Telemetry| Hook into `packages/telemetry-hud` with velocity monitor |
| **Phase 6.12**| Benchmark| Rapid scroll stress test verifying 0px drift at 60 FPS |
