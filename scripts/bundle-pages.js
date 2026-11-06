import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(ROOT_DIR, 'dist-pages');

console.log('🚀 [Pages Bundle] Building all packages and sites...');
execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });

console.log('📦 [Pages Bundle] Assembling unified distribution into dist-pages/ ...');

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const sites = [
  { slug: '01-gsap', src: 'sites/01-gsap-horology/dist', title: '01 · GSAP HAUTE HOROLOGY', tag: 'DOM & SVG Compositor', desc: 'Involute gear geometry, harmonic balance wheel spring, and FLIP zero-reflow layout manager.' },
  { slug: '02-three', src: 'sites/02-three-refraction/dist', title: '02 · THREE.JS OPTICAL MONOLITH', tag: 'WebGL 2.0 PBR Glass', desc: 'Borosilicate optical transmission (IOR 1.52), brushed titanium gimbal, and 5-layer overdraw SLA.' },
  { slug: '03-glsl', src: 'sites/03-glsl-singularity/dist', title: '03 · RAW GLSL RAYMARCHED SINGULARITY', tag: 'Screen-Space SDF', desc: '1 hardware draw call, Inigo Quilez polynomial smin metaballs, and 128-step gyroid manifold.' },
  { slug: '04-pixi', src: 'sites/04-pixi-radar/dist', title: '04 · PIXI.JS V8 VECTOR RADAR', tag: '2D GPU Batching', desc: '1 GPU batch call, 50,000 particle sprite pool on contiguous Float32Array memory, and Web Audio sonar.' },
  { slug: '05-webgpu', src: 'sites/05-webgpu-swarm/dist', title: '05 · WEBGPU WGSL MILLION-BODY SWARM', tag: 'WGSL Compute Pipelines', desc: '64-thread compute workgroups, 3D simplex curl noise, ping-pong storage buffers, and 0 CPU readback.' },
  { slug: '06-hybrid', src: 'sites/06-hybrid-sotd/dist', title: '06 · AGENCY SOTD HYBRID MONOGRAPH', tag: 'SOTD Agency Standard', desc: '1:1 pixel-space camera alignment, Lenis smooth scroll, GSAP ScrollTrigger, and velocity wave shader.' }
];

// Copy each site's dist into dist-pages/<slug>
for (const site of sites) {
  const srcPath = path.resolve(ROOT_DIR, site.src);
  const destPath = path.resolve(OUT_DIR, site.slug);
  if (!fs.existsSync(srcPath)) {
    console.error(`❌ Missing dist directory for ${site.slug} at ${srcPath}`);
    process.exit(1);
  }
  fs.cpSync(srcPath, destPath, { recursive: true });
  console.log(`✓ Copied ${site.slug} -> dist-pages/${site.slug}`);
}

// Copy assets
const assetsSrc = path.resolve(ROOT_DIR, 'assets');
const assetsDest = path.resolve(OUT_DIR, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('✓ Copied assets -> dist-pages/assets');
}

// Generate master index.html portal
const portalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Kinetic Spectrum // Master Creative Compendium</title>
  <style>
    :root {
      --bg-obsidian: #07080B;
      --bg-card: #0D0E14;
      --bg-card-hover: #13151F;
      --text-bone: #F6F3EC;
      --text-muted: #7E8294;
      --hairline: rgba(255, 255, 255, 0.08);
      --accent-blue: #7AA2F7;
      --accent-purple: #BB9AF7;
      --accent-green: #9ECE6A;
      --accent-gold: #E0AF68;
      --accent-cyan: #7DCFFF;
      --accent-coral: #FF7A93;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-obsidian);
      color: var(--text-bone);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px 80px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1100px;
      width: 100%;
    }

    .banner-wrap {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--hairline);
      margin-bottom: 32px;
      background: #000;
    }
    .banner-wrap img {
      width: 100%;
      height: auto;
      display: block;
    }

    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--bg-card);
      border: 1px solid var(--hairline);
      border-radius: 6px;
      margin-bottom: 40px;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .nav-bar a {
      color: var(--accent-blue);
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-bar a:hover {
      color: var(--text-bone);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--hairline);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: border-color 0.2s, transform 0.2s, background 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .card:hover {
      border-color: rgba(122, 162, 247, 0.4);
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }

    .card-thumb {
      width: 100%;
      height: 200px;
      background: #040507;
      overflow: hidden;
      border-bottom: 1px solid var(--hairline);
      position: relative;
    }
    .card-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .card-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-tag {
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      font-size: 9.5px;
      letter-spacing: 0.1em;
      color: var(--accent-gold);
      margin-bottom: 6px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .card-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 20px;
      flex-grow: 1;
    }

    .card-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--hairline);
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--accent-blue);
      font-weight: 700;
    }
    .card:hover .card-action span.arrow {
      transform: translateX(4px);
    }
    .card-action span.arrow {
      transition: transform 0.2s;
    }

    footer {
      margin-top: 60px;
      text-align: center;
      font-family: ui-monospace, 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
    }
    footer a { color: var(--accent-blue); text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner-wrap">
      <img src="./assets/title-banner.svg" alt="The Kinetic Spectrum" />
    </div>

    <div class="nav-bar">
      <div><b>THE KINETIC SPECTRUM</b> // 6 DISCRETE ENGINES</div>
      <div><a href="https://github.com/devpryan7792/kinectrum" target="_blank" rel="noopener">VIEW SOURCE ON GITHUB ↗</a></div>
    </div>

    <main class="grid">
      ${sites.map((s, idx) => `
        <a class="card" href="./${s.slug}/">
          <div class="card-thumb">
            <img src="./assets/previews/${s.slug}.gif" alt="${s.title}" loading="lazy" />
          </div>
          <div class="card-content">
            <div class="card-tag">${s.tag.toUpperCase()}</div>
            <h2 class="card-title">${s.title}</h2>
            <p class="card-desc">${s.desc}</p>
            <div class="card-action">
              <span>LAUNCH SPECIMEN</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </a>
      `).join('')}
    </main>

    <footer>
      THE KINETIC SPECTRUM &bull; AUTHORED BY @devpryan7792 &bull; <a href="https://github.com/devpryan7792/kinectrum">GITHUB REPOSITORY</a>
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.resolve(OUT_DIR, 'index.html'), portalHtml, 'utf-8');
console.log('✓ Generated master portal at dist-pages/index.html');
console.log('🎉 [Pages Bundle] Completed successfully!');
