# Technical Specification: Epoch 4 — Pixi.js v8 Cybernetic Vector Radar

## 1. Executive Summary & Design DNA
Epoch 4 builds **The Cybernetic Vector Radar**, a high-density 2D particle and vector telemetry loom. Where the DOM melts after 1,000 elements, Pixi.js v8 leverages GPU batching and WebGPU/WebGL acceleration to render tens of thousands of interactive vector elements at 60/120 FPS. Inspired by military radar screens, oscilloscopes, and cybernetic telemetry displays, this site demonstrates the raw power of 2D canvas GPU rendering.

---

## 2. The 2D Batching Pipeline & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. HIGH-SPEED PARTICLE CONTAINERS (Pixi.js v8)                         │
│ - GPU-batched sprites sharing a unified vector texture atlas           │
│ - 30,000 to 50,000 active nodes with zero per-element draw calls       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. KINEMATICS & SPRING-DAMPER DYNAMICS                                 │
│ - Harmonic spring equations pulling particles into radar sweep patterns │
│ - Cursor shockwave displacement fields with velocity dissipation       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. BLEND MODES & POST-PROCESSING DISPLACEMENT                          │
│ - Additive (Screen) blend modes for phosphor glow accumulation         │
│ - Web Audio API synthesized frequency analyzer driving displacement    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Models & Invariants

### 3.1. Spring-Damper Velocity Integration
Every particle in the 30,000+ swarm obeys second-order spring dynamics:
$$\vec{a}(t) = -\frac{k}{m} \left(\vec{x}(t) - \vec{x}_{\text{origin}}\right) - \frac{c}{m} \vec{v}(t) + \vec{F}_{\text{cursor}}$$
$$\vec{v}(t + \Delta t) = \vec{v}(t) + \vec{a}(t) \cdot \Delta t$$
$$\vec{x}(t + \Delta t) = \vec{x}(t) + \vec{v}(t + \Delta t) \cdot \Delta t$$

### 3.2. Radar Polar-to-Cartesian Mapping
Radar sweep angle $\theta(t) = (\omega \cdot t) \pmod{2\pi}$. Particles within angular tolerance $\Delta \theta$ are boosted in luminosity:
$$\alpha(r, \phi) = \alpha_{\text{base}} + \alpha_{\text{sweep}} \cdot e^{-\frac{(\phi - \theta)^2}{2 \sigma_\theta^2}}$$

### 3.3. Zero-Texture-Thrashing Invariant
To keep draw calls under 5 for 50,000 sprites:
- All radar reticles, blips, ticks, and characters are baked into a **single unified Texture Atlas** during initialization.
- Dynamic color changes are achieved via vertex color tinting (`sprite.tint = 0x7AA2F7`), which does not break GPU batching.

---

## 4. The Breaking Point Stress Test

### Target Threshold
- **Scaling from 5,000 to 50,000 Active Nodes**: Interactive slider allowing developers to stress-test their GPU fill-rate in real-time.
- **Draw Call Invariant**: The total draw call count must remain $\le 5$ regardless of whether 5,000 or 50,000 sprites are active.
- **SLA Assertion**: Frame rate $\ge 58\text{ FPS}$ at 30,000 active nodes.

---

## 5. File Structure (`sites/04-pixi-radar/`)

```
sites/04-pixi-radar/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts                          # Bootstrap Pixi Application
│   ├── style.css                        # Cybernetic CRT overlay & styling
│   ├── radar/
│   │   ├── radar-stage.ts               # Pixi Application & stage builder
│   │   ├── texture-atlas.ts             # Procedural SVG-to-Texture generator
│   │   ├── particle-swarm.ts            # 50,000 node particle container
│   │   └── sweep-beam.ts                # Phosphor sweep line & luminosity pass
│   ├── physics/
│   │   └── spring-dynamics.ts           # SIMD-style TypedArray velocity math
│   ├── audio/
│   │   └── synth-audio.ts               # Web Audio API radar ping synthesizer
│   └── telemetry/
│       └── batch-instrument.ts          # Connect to Telemetry HUD
```

---

## 6. The 12 Micro-Phases for Epoch 4

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 4.1** | Setup | Workspace init, Pixi.js v8 imports, Vite bundle config |
| **Phase 4.2** | Atlas | Procedural vector texture generation into unified atlas |
| **Phase 4.3** | Stage | Pixi.js v8 Application init with WebGPU/WebGL auto-detect |
| **Phase 4.4** | Container | High-performance `ParticleContainer` initialization |
| **Phase 4.5** | Swarm | TypedArray particle allocation (`Float32Array` positions) |
| **Phase 4.6** | Physics | Spring-damper origin return kinematics |
| **Phase 4.7** | Radar | Rotating polar sweep beam with exponential fade tail |
| **Phase 4.8** | Interaction | Cursor shockwave repulsion and particle dispersal |
| **Phase 4.9** | Audio | Web Audio API synthesizer generating radar pings |
| **Phase 4.10**| Hardening | GPU batch-breaking audit (ensuring single draw call for swarm) |
| **Phase 4.11**| Telemetry| Hook into `packages/telemetry-hud` with sprite count tracker |
| **Phase 4.12**| Benchmark| 30,000–50,000 node stress test verification at 60 FPS |
