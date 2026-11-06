import { TelemetryConfig, TelemetryMetrics, SubstrateType } from './types';
import { SUBSTRATE_NOTES } from './commentary-drawer';

export class HUDUI {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isExpanded: boolean;
  private config: TelemetryConfig;

  // DOM element refs
  private fpsDisplay!: HTMLElement;
  private deltaDisplay!: HTMLElement;
  private drawsDisplay!: HTMLElement;
  private domNodesDisplay!: HTMLElement;
  private pillFps!: HTMLElement;
  private pillDraws!: HTMLElement;
  private pillDelta!: HTMLElement;
  private commentaryList!: HTMLElement;
  private substrateBadge!: HTMLElement;

  constructor(config: TelemetryConfig) {
    this.config = {
      position: 'bottom-right',
      initialExpanded: false,
      substrate: 'generic',
      title: 'TELEMETRY RIG',
      badge: 'MONITOR',
      ...config
    };
    this.isExpanded = !!this.config.initialExpanded;

    this.container = document.createElement('div');
    this.container.id = 'kinetic-telemetry-hud';
    this.setupStyles();
    this.buildDOM();

    this.canvas = this.container.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    const target = this.config.targetElement || document.body;
    target.appendChild(this.container);
  }

  private setupStyles(): void {
    const styleId = 'kinetic-telemetry-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #kinetic-telemetry-hud {
        position: fixed;
        z-index: 999999;
        font-family: ui-monospace, 'JetBrains Mono', 'Geist Mono', monospace;
        color: #F6F3EC;
        pointer-events: auto;
        user-select: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        font-size: 11px;
        line-height: 1.4;
      }
      #kinetic-telemetry-hud.pos-bottom-right { bottom: 16px; right: 16px; }
      #kinetic-telemetry-hud.pos-bottom-left { bottom: 16px; left: 16px; }
      #kinetic-telemetry-hud.pos-top-right { top: 16px; right: 16px; }
      #kinetic-telemetry-hud.pos-top-left { top: 16px; left: 16px; }

      .k-hud-card {
        background: rgba(10, 10, 12, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }

      .k-hud-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        cursor: pointer;
        background: rgba(26, 27, 38, 0.85);
        border: 1px solid rgba(122, 162, 247, 0.25);
        border-radius: 20px;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .k-hud-pill:hover {
        border-color: #7AA2F7;
        background: rgba(26, 27, 38, 0.98);
      }
      .k-indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9ECE6A;
        box-shadow: 0 0 8px #9ECE6A;
      }
      .k-indicator-dot.warn { background: #E0AF68; box-shadow: 0 0 8px #E0AF68; }
      .k-indicator-dot.alert { background: #F7768E; box-shadow: 0 0 8px #F7768E; }

      .k-hud-expanded {
        width: 280px;
        padding: 12px;
      }

      .k-hud-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 6px;
      }
      .k-hud-title {
        font-weight: 700;
        letter-spacing: 0.1em;
        font-size: 10px;
        color: #A9B1D6;
      }
      .k-hud-badge {
        font-size: 9px;
        padding: 2px 6px;
        background: rgba(122, 162, 247, 0.15);
        border: 1px solid rgba(122, 162, 247, 0.3);
        border-radius: 4px;
        color: #7AA2F7;
        letter-spacing: 0.05em;
      }

      .k-graph-container {
        width: 100%;
        height: 32px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        margin-bottom: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .k-graph-container canvas {
        display: block;
        width: 100%;
        height: 100%;
      }

      .k-metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .k-metric-cell {
        background: rgba(26, 27, 38, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 6px 8px;
      }
      .k-metric-label {
        font-size: 9px;
        color: #565F89;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .k-metric-value {
        font-size: 13px;
        font-weight: 700;
        color: #C0CAF5;
        margin-top: 2px;
      }

      .k-commentary-section {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        font-size: 9.5px;
        color: #9AA5CE;
        max-height: 110px;
        overflow-y: auto;
      }
      .k-commentary-title {
        font-weight: 700;
        color: #7AA2F7;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .k-commentary-list {
        margin: 0;
        padding-left: 12px;
      }
      .k-commentary-list li {
        margin-bottom: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  private buildDOM(): void {
    this.container.className = `pos-${this.config.position || 'bottom-right'}`;

    this.container.innerHTML = `
      <div class="k-hud-pill-wrap" style="display: ${this.isExpanded ? 'none' : 'block'};">
        <div class="k-hud-pill" title="Click to expand architecture telemetry">
          <div class="k-indicator-dot"></div>
          <span class="k-pill-fps" style="font-weight: 700; color: #9ECE6A;">60 FPS</span>
          <span style="color: rgba(255,255,255,0.2);">·</span>
          <span class="k-pill-delta" style="color: #A9B1D6;">16.7ms</span>
          <span style="color: rgba(255,255,255,0.2);">·</span>
          <span class="k-pill-draws" style="color: #7AA2F7;">0 DRAWS</span>
          <span style="color: #565F89; margin-left: 4px;">[⌖]</span>
        </div>
      </div>

      <div class="k-hud-expanded-wrap k-hud-card" style="display: ${this.isExpanded ? 'block' : 'none'};">
        <div class="k-hud-expanded">
          <div class="k-hud-header">
            <span class="k-hud-title">${this.config.title || 'TELEMETRY RIG'}</span>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="k-hud-badge">${this.config.badge || 'PROBE'}</span>
              <button class="k-btn-close" style="background: none; border: none; color: #565F89; cursor: pointer; padding: 2px 4px; font-family: inherit;">✕</button>
            </div>
          </div>

          <div class="k-graph-container">
            <canvas width="256" height="32"></canvas>
          </div>

          <div class="k-metrics-grid">
            <div class="k-metric-cell">
              <div class="k-metric-label">Frame Rate</div>
              <div class="k-metric-value k-val-fps">60 FPS</div>
            </div>
            <div class="k-metric-cell">
              <div class="k-metric-label">Frame Delta</div>
              <div class="k-metric-value k-val-delta">16.6ms</div>
            </div>
            <div class="k-metric-cell">
              <div class="k-metric-label">GPU Draw Calls</div>
              <div class="k-metric-value k-val-draws">0</div>
            </div>
            <div class="k-metric-cell">
              <div class="k-metric-label">DOM Nodes</div>
              <div class="k-metric-value k-val-dom">0</div>
            </div>
          </div>

          <div class="k-commentary-section">
            <div class="k-commentary-title">Architectural Diagnostics</div>
            <ul class="k-commentary-list"></ul>
          </div>
        </div>
      </div>
    `;

    // Query elements
    this.fpsDisplay = this.container.querySelector('.k-val-fps')!;
    this.deltaDisplay = this.container.querySelector('.k-val-delta')!;
    this.drawsDisplay = this.container.querySelector('.k-val-draws')!;
    this.domNodesDisplay = this.container.querySelector('.k-val-dom')!;
    this.commentaryList = this.container.querySelector('.k-commentary-list')!;
    this.substrateBadge = this.container.querySelector('.k-hud-badge')!;

    this.pillFps = this.container.querySelector('.k-pill-fps')!;
    this.pillDelta = this.container.querySelector('.k-pill-delta')!;
    this.pillDraws = this.container.querySelector('.k-pill-draws')!;

    // Toggle events
    const pill = this.container.querySelector('.k-hud-pill')!;
    const btnClose = this.container.querySelector('.k-btn-close')!;

    pill.addEventListener('click', () => this.setExpanded(true));
    btnClose.addEventListener('click', () => this.setExpanded(false));

    this.updateCommentary(this.config.substrate || 'generic');
  }

  public setExpanded(expanded: boolean): void {
    this.isExpanded = expanded;
    const pillWrap = this.container.querySelector('.k-hud-pill-wrap') as HTMLElement;
    const expWrap = this.container.querySelector('.k-hud-expanded-wrap') as HTMLElement;
    pillWrap.style.display = expanded ? 'none' : 'block';
    expWrap.style.display = expanded ? 'block' : 'none';
  }

  public updateCommentary(substrate: SubstrateType, customNotes?: string[]): void {
    const notes = customNotes || SUBSTRATE_NOTES[substrate] || SUBSTRATE_NOTES['generic'];
    this.commentaryList.innerHTML = notes.map((n) => `<li>${n}</li>`).join('');
    this.substrateBadge.textContent = substrate.toUpperCase();
  }

  public update(metrics: TelemetryMetrics): void {
    const fpsText = `${Math.round(metrics.smoothedFps)} FPS`;
    const deltaText = `${metrics.frameDeltaMs.toFixed(1)}ms`;
    const drawsText = `${metrics.drawCalls} DRAWS`;

    // Update pill
    this.pillFps.textContent = fpsText;
    this.pillDelta.textContent = deltaText;
    this.pillDraws.textContent = drawsText;

    const dot = this.container.querySelector('.k-indicator-dot')!;
    dot.className = 'k-indicator-dot';
    if (metrics.smoothedFps < 30) {
      dot.classList.add('alert');
      this.pillFps.style.color = '#F7768E';
    } else if (metrics.smoothedFps < 55) {
      dot.classList.add('warn');
      this.pillFps.style.color = '#E0AF68';
    } else {
      this.pillFps.style.color = '#9ECE6A';
    }

    // Update expanded
    if (this.isExpanded) {
      this.fpsDisplay.textContent = fpsText;
      this.deltaDisplay.textContent = deltaText;
      this.drawsDisplay.textContent = `${metrics.drawCalls}`;
      this.domNodesDisplay.textContent = `${metrics.domNodes}`;

      if (this.config.maxDrawCallsSla && metrics.drawCalls > this.config.maxDrawCallsSla) {
        this.drawsDisplay.style.color = '#F7768E';
      } else {
        this.drawsDisplay.style.color = '#7AA2F7';
      }
    }
  }

  public getCanvasContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getCanvasDimensions(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  public destroy(): void {
    this.container.remove();
  }
}
