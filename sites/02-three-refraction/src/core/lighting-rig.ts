import * as THREE from 'three';

export class StudioLightingRig {
  public keyLight: THREE.DirectionalLight;
  public rimLight: THREE.DirectionalLight;
  public fillLight: THREE.HemisphereLight;
  public envTexture: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    // 1. Procedural Studio Softbox Environment Map
    this.envTexture = this.generateStudioEnvironmentTexture();
    scene.environment = this.envTexture;

    // 2. Key Light (Warm, high-intensity studio key light with soft shadow)
    this.keyLight = new THREE.DirectionalLight(0xFFF7ED, 2.2);
    this.keyLight.position.set(5, 8, 6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.0005;
    scene.add(this.keyLight);

    // 3. Rim Light (Cool cyan grazing edge light)
    this.rimLight = new THREE.DirectionalLight(0x7AA2F7, 3.2);
    this.rimLight.position.set(-6, -3, -5);
    scene.add(this.rimLight);

    // 4. Fill Light (Subtle dark-slate ambient hemisphere)
    this.fillLight = new THREE.HemisphereLight(0x2A3144, 0x0A0A0C, 0.7);
    scene.add(this.fillLight);
  }

  private generateStudioEnvironmentTexture(): THREE.CanvasTexture {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark ambient studio background
    ctx.fillStyle = '#0F1015';
    ctx.fillRect(0, 0, width, height);

    // Top softbox light
    const gradTop = ctx.createRadialGradient(width / 2, height * 0.25, 10, width / 2, height * 0.25, 220);
    gradTop.addColorStop(0, '#FFFFFF');
    gradTop.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradTop.addColorStop(1, 'rgba(15, 16, 21, 0)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, width, height * 0.5);

    // Lateral rim softbox
    const gradRim = ctx.createLinearGradient(0, height * 0.3, width * 0.2, height * 0.7);
    gradRim.addColorStop(0, '#7AA2F7');
    gradRim.addColorStop(1, 'rgba(15, 16, 21, 0)');
    ctx.fillStyle = gradRim;
    ctx.fillRect(0, height * 0.2, width * 0.3, height * 0.6);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }
}
