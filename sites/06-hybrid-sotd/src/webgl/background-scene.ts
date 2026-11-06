import * as THREE from 'three';

export class BackgroundScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Mathematical 1 unit = 1 pixel camera setup
    const cameraDist = 1000;
    const fov = 2 * Math.atan(height / (2 * cameraDist)) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 3000);
    this.camera.position.z = cameraDist;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(width, height, false);

    // Studio Illumination for 3D Meshes & Sculpture
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambient);

    const lightCyan = new THREE.PointLight(0x7AA2F7, 3.5, 2000);
    lightCyan.position.set(250, 250, 400);
    this.scene.add(lightCyan);

    const lightPurple = new THREE.PointLight(0xBB9AF7, 2.8, 2000);
    lightPurple.position.set(-250, -200, 350);
    this.scene.add(lightPurple);
  }

  public resize(width: number, height: number): void {
    const cameraDist = 1000;
    this.camera.fov = 2 * Math.atan(height / (2 * cameraDist)) * (180 / Math.PI);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.renderer.dispose();
  }
}
