# Technical Specification: Epoch 7 — Master GitHub Publication & Official Docs Archive

## 1. Executive Summary & Design DNA
Epoch 7 builds the **flagship GitHub README publication and technical blog** for the repository. Adapting the high-taste, visual gallery aesthetic of **Darkkal44/qylock**, this document transforms the GitHub repository into an authoritative, bookmarkable masterclass. It features a custom SVG hero banner, curated TokyoNight badges, small-caps quick-nav, a 2-column visual gallery showcasing each site's live telemetry and stress test, deep-dive architectural autopsies, and a 100% legal, zero-copyright-risk curated official documentation library.

---

## 2. The Visual Hierarchy & Layout Specification (qylock Aesthetic)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. HERO TITLE BANNER (Custom SVG)                                      │
│ - High-contrast Obsidian & Phosphor typography with hairline grid      │
├────────────────────────────────────────────────────────────────────────┤
│ 2. TOKYONIGHT SHIELD BADGES                                            │
│ - labelColor=1a1b26 (Obsidian/Slate), style=for-the-badge               │
│ - Colors: 7aa2f7 (Blue), bb9af7 (Purple), 9ece6a (Green), e0af68 (Gold)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. MONOSPACE QUICK-NAV BAR                                             │
│ - Centered <pre> bar with small-caps links                             │
│   ɢsᴀᴘ • ᴛʜʀᴇᴇ.ᴊs • ɢʟsʟ • ᴘɪxɪ.ᴊs • ᴡᴇʙɢᴘᴜ • ʜʏʙʀɪᴅ • ᴀᴜᴛᴏᴘsʏ • ᴅᴏᴄs  │
├────────────────────────────────────────────────────────────────────────┤
│ 4. THE 2-COLUMN SPECIMEN GALLERY (HTML Table)                          │
│ - Side-by-side cards with visual preview, telemetry stats & run links  │
├────────────────────────────────────────────────────────────────────────┤
│ 5. THE 6 ARCHITECTURAL AUTOPSIES (Senior Dev Deep-Dives)               │
│ - Precise mathematical and pipeline breakdowns of why each fails       │
├────────────────────────────────────────────────────────────────────────┤
│ 6. THE CURATED OFFICIAL DOCUMENTATION LIBRARY (100% Legal)             │
│ - Direct links to W3C, MDN, GreenSock, Three.js, Pixi, Inigo Quilez    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The 2-Column Gallery Card Schema

Each site is presented inside an HTML table adhering to the `qylock` aesthetic:

```html
<table style="border-collapse: collapse; border: none; width: 100%;">
<tr>
<td align="left" width="50%" style="padding: 16px; vertical-align: top; border: 1px solid rgba(255,255,255,0.08); background: #0A0A0C; border-radius: 8px;">
  <b>01 · GSAP HAUTE HOROLOGY</b><br>
  <i>DOM & SVG Compositor Substrate</i><br><br>
  <img src="./assets/previews/01-gsap.gif" width="100%" style="border-radius: 6px;"/><br><br>
  <b>Engine:</b> GSAP 3.x + ScrollTrigger + Flip<br>
  <b>Telemetry:</b> 0 WebGL Draws · 250 Concurrent Path Morphs<br>
  <b>Stress Test:</b> Zero Layout Reflows during active scrub<br>
  <b>Launch:</b> <code>npm run dev:gsap</code>
</td>
<td align="left" width="50%" style="padding: 16px; vertical-align: top; border: 1px solid rgba(255,255,255,0.08); background: #0A0A0C; border-radius: 8px;">
  <b>02 · THREE.JS OPTICAL MONOLITH</b><br>
  <i>WebGL 2.0 PBR Substrate</i><br><br>
  <img src="./assets/previews/02-three.gif" width="100%" style="border-radius: 6px;"/><br><br>
  <b>Engine:</b> Three.js r170+ (MeshPhysicalMaterial)<br>
  <b>Telemetry:</b> ≤ 30 Draw Calls · Real-Time Refraction IOR 1.52<br>
  <b>Stress Test:</b> 5 Overlapping refractive bodies at 60 FPS<br>
  <b>Launch:</b> <code>npm run dev:three</code>
</td>
</tr>
</table>
```

---

## 4. The 6 Senior Technical Autopsies

The README will contain an unapologetic, mathematically grounded autopsy for each substrate:

1. **Autopsy 1: DOM Layout Thrashing & The Compositor Bypass**
   - Dissecting the V8 / Blink rendering pipeline: DOM tree -> Layout Tree -> Paint -> Composite.
   - Proving how `translate3d` skips Layout & Paint entirely, and how FLIP computes transforms in memory.
2. **Autopsy 2: PBR Transmission, Roughness Mipmaps & Overdraw**
   - Explaining why transparent objects cannot use the hardware depth buffer ($Z$-buffer) and require manual back-to-front depth sorting.
   - The cost of roughness blur: generating downsampled frame buffer copies per frame.
3. **Autopsy 3: Raymarching Step Divergence on GPU Warps**
   - How SIMD warps (32 threads on NVIDIA / 64 wavefronts on AMD) execute in lockstep.
   - Why dynamic branching in ray loops causes execution serialization and how bounding spheres fix it.
4. **Autopsy 4: 2D Sprite Batching & Texture Atlas Thrashing**
   - The internal mechanism of Pixi's `BatchRenderer`: grouping vertices until a texture or blend mode changes.
   - Why individual SVG textures cause 50,000 draw calls, while a baked atlas yields 1 draw call.
5. **Autopsy 5: WebGPU Compute Shaders vs CPU Serialization**
   - Eliminating the `ArrayBuffer` transfer bottleneck between CPU and GPU.
   - Ping-pong storage buffers and workgroup memory barriers in WGSL.
6. **Autopsy 6: Virtual Scroll Desync in Hybrid WebGL Viewports**
   - The mathematical proof for projecting screen-space pixels into WebGL world-space units.
   - Handling dynamic DOM reflows via debounced `ResizeObserver` and font load promises.

---

## 5. Curated Official Documentation Reading Room (Zero Copyright Infringement)

To give developers an authentic learning path without violating any copyright or rehosting proprietary content, the README will curate verified links to official, first-party documentation:

| Technology | Official Resource Link | Focus Area |
|---|---|---|
| **WebGPU** | [W3C WebGPU Specification](https://www.w3.org/TR/webgpu/)<br>[MDN WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) | Compute pipelines, WGSL syntax, buffer binding |
| **Three.js** | [Three.js Official Manual](https://threejs.org/manual/)<br>[Three.js API Docs](https://threejs.org/docs/) | PBR materials, transmission, scene disposal |
| **GSAP** | [GreenSock Official Documentation](https://gsap.com/docs/v3/)<br>[GSAP ScrollTrigger Guide](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Timeline scrub curves, Flip plugin, transform matrix |
| **Pixi.js** | [Pixi.js v8 Official Documentation](https://pixijs.com/8.x/guides) | Sprite batching, ParticleContainer, WebGPU 2D |
| **GLSL & Math** | [Inigo Quilez Computer Graphics Articles](https://iquilezles.org/articles/)<br>[OpenGL ES 3.0 Reference](https://www.khronos.org/registry/OpenGL-Refpages/es3.0/) | Distance functions, raymarching, smooth minimum |
| **Lenis** | [Lenis GitHub & Documentation](https://github.com/darkroomengineering/lenis) | Virtual smooth scroll, inertia curves, rAF sync |

---

## 6. The 12 Micro-Phases for Epoch 7

| Micro-Phase | Module | Focus |
|---|---|---|
| **Phase 7.1** | Assets | Create custom SVG hero title banner (`assets/title-banner.svg`) |
| **Phase 7.2** | Assets | Generate visual gallery preview graphics for each site |
| **Phase 7.3** | README | Assemble header block, TokyoNight shields, small-caps quick-nav |
| **Phase 7.4** | README | Construct 2-column visual gallery HTML table with telemetry readouts |
| **Phase 7.5** | README | Author Autopsy 1 (DOM Compositor & FLIP math) |
| **Phase 7.6** | README | Author Autopsy 2 (PBR Transmission & Overdraw) |
| **Phase 7.7** | README | Author Autopsy 3 (GLSL Raymarching & Warp Divergence) |
| **Phase 7.8** | README | Author Autopsy 4 (Pixi 2D Batching & Texture Atlases) |
| **Phase 7.9** | README | Author Autopsy 5 (WebGPU Compute & Storage Buffers) |
| **Phase 7.10**| README | Author Autopsy 6 (Hybrid WebGL/DOM Projection Math) |
| **Phase 7.11**| README | Curate verified official documentation reading room |
| **Phase 7.12**| Audit  | Complete link validation, responsive table check, zero-slop audit |
