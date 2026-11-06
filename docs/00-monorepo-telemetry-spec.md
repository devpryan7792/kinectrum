# Technical Specification: Epoch 0 — Monorepo Harness & Real-Time Telemetry HUD

## 1. Executive Summary
Epoch 0 establishes the monorepo foundation, workspace configurations, shared TypeScript contracts, and the universal **Telemetry HUD** (`packages/telemetry-hud`). The Telemetry HUD is an embedded, zero-overhead diagnostic instrument loaded into every site. It monitors frame times ($\Delta t$), instantaneous frames per second (FPS), GPU draw calls, DOM element count, and renders an expandable architectural commentary panel.

---

## 2. Design Tokens & Visual Hierarchy (TokyoNight / Swiss Hybrid)
Following the aesthetic restraint of SOTD winners (e.g. *Grids* by Obys) and the visual badge system of *qylock*:

| Token Name | Hex Value | Purpose |
|---|---|---|
| **Obsidian Slate (Background)** | `#0A0A0C` | Deep background substrate, eliminating glare |
| **Archival Bone (Primary Text)** | `#F6F3EC` | High-contrast editorial typography, warm off-white |
| **Tokyo Night Slate (Containers)**| `#1A1B26` | Card backgrounds, badge labels, bordered HUD panels |
| **Signal Vermilion (Alerts)** | `#FF3300` | Dropped frames, layout thrashing warnings, hot state |
| **Phosphor Chartreuse (Nominal)**| `#7AA2F7` / `#9ECE6A` | 60 FPS nominal indicator, active render pass |
| **Hairline Rule** | `rgba(255, 255, 255, 0.08)` | 1px precision engineering borders |

### Typography Stack
- **Display**: Grotesque Bold / Sans-serif (`clamp(2.5rem, 8vw, 6rem)` with `-0.04em` tracking).
- **Telemetry & Metadata**: `JetBrains Mono`, `Geist Mono`, or `ui-monospace` (`10px - 12px`, uppercase, `0.15em` letter spacing).

---

## 3. Telemetry HUD Architecture & Performance Invariants

### 3.1. Zero-Overhead Telemetry Invariant
The telemetry instrument itself must never alter the performance of the system it observes:
1. **Direct Canvas Rendering**: The FPS graph is rendered on an isolated 2D `<canvas>` element (width: 160px, height: 40px) using batched path strokes. No DOM node churn per frame.
2. **Exponentially Smoothed FPS**:
   $$\text{FPS}_{\text{smoothed}} = \text{FPS}_{\text{smoothed}} \cdot 0.9 + \left(\frac{1000}{\Delta t}\right) \cdot 0.1$$
3. **Draw Call Interception**:
   Monkey-patches the WebGL 2.0 context prototype to track draw calls per frame without engine-specific coupling:
   ```typescript
   export function instrumentWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext) {
     let drawCalls = 0;
     const originalDrawElements = gl.drawElements;
     const originalDrawArrays = gl.drawArrays;

     gl.drawElements = function (...args) {
       drawCalls++;
       return originalDrawElements.apply(this, args);
     };

     gl.drawArrays = function (...args) {
       drawCalls++;
       return originalDrawArrays.apply(this, args);
     };

     return {
       getAndResetDrawCalls: () => {
         const count = drawCalls;
         drawCalls = 0;
         return count;
       }
     };
   }
   ```
4. **DOM Reflow & Node Monitoring**:
   Tracks total DOM node count via `document.getElementsByTagName('*').length` sampled once every 1,000ms (never inside the render loop).

---

## 4. Monorepo File & Workspace Topology

```
creative/
├── package.json                         # npm workspaces root
├── tsconfig.base.json                   # Shared strict TS compiler options
├── packages/
│   └── telemetry-hud/                   # Shared Telemetry HUD package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                 # Public exports: initTelemetryHUD()
│           ├── fps-tracker.ts           # Rolling delta buffer & canvas graph
│           ├── webgl-probe.ts           # Draw call interception
│           ├── dom-tracker.ts           # Node counter & layout warning
│           └── hud-ui.ts                # Floating glass HUD with TokyoNight styling
└── sites/                               # The 6 standalone site workspaces
```

---

## 5. Micro-Phased Execution Sequence (12 Micro-Phases)

| Micro-Phase | Scope | Acceptance Criteria |
|---|---|---|
| **Phase 0.1** | Root `package.json` & workspace layout | `npm install` cleanly resolves root and child packages |
| **Phase 0.2** | `tsconfig.base.json` strict contracts | Strict null checks, ES2022 target, no implicit any |
| **Phase 0.3** | `packages/telemetry-hud` package setup | Compiles cleanly with TypeScript declaration emit |
| **Phase 0.4** | `fps-tracker.ts` implementation | Microsecond-precision `performance.now()` delta calculation |
| **Phase 0.5** | Rolling history buffer | 60-frame cyclic array for canvas sparkline rendering |
| **Phase 0.6** | WebGL 1.0 & 2.0 draw call interceptor | Accurately counts `drawArrays` and `drawElements` |
| **Phase 0.7** | WebGPU draw pass tracker | Interface for WebGPU render pass encoder instrumentation |
| **Phase 0.8** | DOM node & layout thrashing monitor | Low-frequency sampler warning when DOM > 2,000 nodes |
| **Phase 0.9** | TokyoNight glass HUD UI markup & styling | Compact pill at bottom-right with expand/collapse toggle |
| **Phase 0.10** | Architectural live commentary drawer | Explains active substrate mechanics on click |
| **Phase 0.11** | Zero-leak teardown method (`destroy()`) | Restores original prototypes and cancels animation frames |
| **Phase 0.12** | Standalone verification test page | Verified at solid 60 FPS with 0 CPU idle load |
