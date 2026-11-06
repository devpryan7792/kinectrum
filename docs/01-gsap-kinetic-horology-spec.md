# Technical Specification: Epoch 1 — GSAP & SVG Haute Horlogerie

## 1. Executive Summary & Design DNA
Epoch 1 builds **The Haute Horlogerie Chronometer**, an Awwwards-caliber exploration of the DOM and SVG graphics substrate. Drawing inspiration from **Grids by Obys Agency** (Awwwards SOTD / Developer Award) and the ultra-luxury technical watchmaking aesthetics of Audemars Piguet and Richard Mille, this site pushes DOM/SVG animation to its absolute technical ceiling.

---

## 2. The Core Mechanics & Architectural Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: TYPOGRAPHIC MONUMENT (DOM Compositor)                         │
│ - Split-text kinetic headers: clamp(3rem, 10vw, 8rem)                  │
│ - Magnetic scrubbed timeline with inertia drag and spring snapping     │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: THE VERNIER ESCAPEMENT (Precision SVG Vectors)                │
│ - 12 Concentric gear rings with exact involute gear tooth profiles    │
│ - Dynamic vernier scale caliper with sub-pixel SVG path morphs         │
│ - Balance spring oscillation driven by harmonic spring equations       │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: FLIP ARCHITECTURE (Zero-Reflow State Reordering)              │
│ - Instant morphing between [Blueprint View], [Exploded View],         │
│   and [Editorial Gallery] without triggering browser layout reflow     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. Magnetic Cursor Field
When the cursor approaches interactive telemetry tags or gear hubs, the pointer position is warped using an inverse-square magnetic falloff equation:
$$\vec{F}_{\text{pull}} = -k \cdot \frac{\vec{r}}{|\vec{r}|^2 + \epsilon^2} \cdot \left(1 - \frac{|\vec{r}|}{R_{\text{influence}}}\right)$$
Where:
- $R_{\text{influence}} = 120\text{px}$
- $k = 450$ (stiffness constant)
- $\epsilon = 20\text{px}$ (singularity damping)

### 3.2. Harmonic Escapement Oscillation
The escapement wheel and hairspring tick using an underdamped harmonic oscillator:
$$\theta(t) = \theta_0 \cdot e^{-\zeta \omega_n t} \cos(\omega_d t + \phi)$$
Driven by GSAP stepped ticks alternating every 200ms with elastic recoil.

### 3.3. Involute Gear Tooth Generation
All gear wheels are generated procedurally as native SVG `<path>` elements using parametric involute curve mathematics:
$$x(u) = r_b \cdot (\cos u + u \cdot \sin u), \quad y(u) = r_b \cdot (\sin u - u \cdot \cos u)$$
This guarantees true mechanical clearance rather than generic circular approximations.

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **250 Concurrent SVG Path Tweens**: An interactive "Exploded Caliber" mode where 250 individual vector teeth, spring coils, and caliper markers undergo continuous scrubbed morphs and 3D matrix transforms.
- **Zero Layout Thrashing Invariant**:
  - Strictly banned during animation: `top`, `left`, `width`, `height`, `margin`, `padding`, `border`.
  - Exclusively allowed on the compositor thread: `transform: translate3d(...) rotate(...) scale(...)`, `opacity`, and SVG `d` attribute morphs via pre-calculated coordinate arrays.
- **SLA Assertion**: Frame rate must stay $\ge 58\text{ FPS}$ on a 60Hz display, and $\le 16.6\text{ms}$ frame delta.

---

## 5. File Structure (`sites/01-gsap-horology/`)

```
sites/01-gsap-horology/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # App bootstrap & telemetry integration
│   ├── style.css                        # Swiss architectural styling & tokens
│   ├── math/
│   │   ├── gear-geometry.ts             # Procedural involute gear path math
│   │   ├── magnetic-field.ts            # Inverse-square pointer field calculation
│   │   └── harmonic-spring.ts           # Escapement tick damping curves
│   ├── components/
│   │   ├── typography-monument.ts       # Kinetic split-text scrub engine
│   │   ├── mechanical-chronometer.ts    # 12-ring SVG gear train assembly
│   │   ├── vernier-caliper.ts           # Interactive sub-pixel measurement scale
│   │   └── flip-layout-manager.ts       # GSAP Flip blueprint/exploded controller
│   └── telemetry/
│       └── layout-guard.ts              # Zero-layout-thrashing runtime assertion
```

---

## 6. The 12 Micro-Phases for Epoch 1

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 1.1** | Setup | Workspace init, GSAP 3 imports, Vite bundle config |
| **Phase 1.2** | Math | Involute gear generator & harmonic spring oscillator |
| **Phase 1.3** | Math | Magnetic pointer field equations & inertia lerp |
| **Phase 1.4** | SVG Core | 12-ring concentric SVG gear train assembly |
| **Phase 1.5** | SVG Core | Escapement pallet fork and ticking balance wheel |
| **Phase 1.6** | SVG Core | Vernier scale sub-pixel coordinate markers |
| **Phase 1.7** | Typography | Split-text engine with character-level scrub stagger |
| **Phase 1.8** | Interaction | Drag & wheel scrub timeline coordinator |
| **Phase 1.9** | FLIP Engine | Exploded view vs Blueprint view transition |
| **Phase 1.10**| Hardening | Layout thrashing audit (`getBoundingClientRect` zero-call invariant) |
| **Phase 1.11**| Telemetry | Hook into `packages/telemetry-hud` with live commentary |
| **Phase 1.12**| Benchmark | 250-path stress test verification at 60 FPS |
