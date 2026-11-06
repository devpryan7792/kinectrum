import * as THREE from 'three';
import { createWaveMaterial } from './wave-shader';

export interface DOMSyncItem {
  element: HTMLElement;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

export class DOMSyncPlaneManager {
  private scene: THREE.Scene;
  private items: DOMSyncItem[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.bindDOMElements();
  }

  public bindDOMElements(): void {
    // Query elements with data-webgl-sync
    const elements = document.querySelectorAll<HTMLElement>('[data-webgl-sync]');
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    elements.forEach((el, index) => {
      const color = index % 2 === 0 ? 0x1A1B26 : 0x24283B;
      const material = createWaveMaterial(color);
      const mesh = new THREE.Mesh(geometry, material);

      this.scene.add(mesh);
      this.items.push({ element: el, mesh, material });
    });
  }

  public update(time: number, velocity: number): void {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;

    for (let i = 0; i < this.items.length; i++) {
      const { element, mesh, material } = this.items[i];
      const rect = element.getBoundingClientRect();

      // Synchronize exact dimensions and positions
      mesh.scale.set(rect.width, rect.height, 1);
      mesh.position.x = rect.left + rect.width / 2 - halfW;
      mesh.position.y = -(rect.top + rect.height / 2 - halfH);

      // Pass time and scroll velocity to GLSL wave shader
      material.uniforms.u_time.value = time;
      material.uniforms.u_velocity.value = velocity;
    }
  }
}
