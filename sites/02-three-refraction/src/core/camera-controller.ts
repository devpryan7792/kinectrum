import * as THREE from 'three';

export class InertialCameraController {
  public camera: THREE.PerspectiveCamera;
  public targetTheta = 0;
  public targetPhi = Math.PI / 2.5;
  public currentTheta = 0;
  public currentPhi = Math.PI / 2.5;
  public radius = 7.5;

  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private domElement: HTMLElement;

  constructor(domElement: HTMLElement, aspect: number) {
    this.domElement = domElement;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.updateCameraPosition();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.domElement.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) {
        // Subtle ambient parallax
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        this.targetTheta = normX * 0.45;
        this.targetPhi = Math.PI / 2.5 + normY * 0.25;
        return;
      }

      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.targetTheta += dx * 0.008;
      this.targetPhi = Math.min(Math.PI - 0.15, Math.max(0.15, this.targetPhi + dy * 0.008));
    });

    // Zoom on wheel
    this.domElement.addEventListener('wheel', (e) => {
      this.radius = Math.min(12, Math.max(4.5, this.radius + e.deltaY * 0.004));
    }, { passive: true });
  }

  public update(delta: number): void {
    // Exponential decay damping: current + (target - current) * (1 - exp(-lambda * delta))
    const lambda = 10.0;
    const factor = 1 - Math.exp(-lambda * delta);

    this.currentTheta += (this.targetTheta - this.currentTheta) * factor;
    this.currentPhi += (this.targetPhi - this.currentPhi) * factor;

    this.updateCameraPosition();
  }

  private updateCameraPosition(): void {
    const sinPhi = Math.sin(this.currentPhi);
    const cosPhi = Math.cos(this.currentPhi);
    const sinTheta = Math.sin(this.currentTheta);
    const cosTheta = Math.cos(this.currentTheta);

    this.camera.position.x = this.radius * sinPhi * sinTheta;
    this.camera.position.y = this.radius * cosPhi;
    this.camera.position.z = this.radius * sinPhi * cosTheta;

    this.camera.lookAt(0, 0, 0);
  }

  public setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
