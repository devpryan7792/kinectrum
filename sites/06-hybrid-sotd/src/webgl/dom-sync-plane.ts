import * as THREE from 'three';
import { createWaveMaterial } from './wave-shader';

export interface DOMSyncItem {
  element: HTMLElement;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  crystal: THREE.Mesh;
}

export class DOMSyncPlaneManager {
  private scene: THREE.Scene;
  public items: DOMSyncItem[] = [];
  public mousePos = new THREE.Vector2(0, 0);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.bindDOMElements();
  }

  public bindDOMElements(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-webgl-sync]');
    const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);

    const themes = [
      { colorA: 0x1A1B26, colorB: 0x7AA2F7, crystalGeo: new THREE.TorusKnotGeometry(28, 7, 64, 16), crystalColor: 0x7AA2F7 },
      { colorA: 0x1F2335, colorB: 0xE0AF68, crystalGeo: new THREE.IcosahedronGeometry(36, 1), crystalColor: 0xE0AF68 },
      { colorA: 0x13151F, colorB: 0x73DACA, crystalGeo: new THREE.OctahedronGeometry(38, 0), crystalColor: 0x73DACA },
      { colorA: 0x24283B, colorB: 0xFF7A93, crystalGeo: new THREE.DodecahedronGeometry(34, 0), crystalColor: 0xFF7A93 }
    ];

    elements.forEach((el, index) => {
      const theme = themes[index % themes.length];
      const material = createWaveMaterial(theme.colorA, theme.colorB);
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);

      // Interactive 3D Spinning Crystal floating in perspective
      const crystalMat = new THREE.MeshStandardMaterial({
        color: theme.crystalColor,
        roughness: 0.15,
        metalness: 0.85,
        wireframe: true,
        transparent: true,
        opacity: 0.85
      });
      const crystal = new THREE.Mesh(theme.crystalGeo, crystalMat);
      this.scene.add(crystal);

      this.items.push({ element: el, mesh, material, crystal });
    });
  }

  public update(time: number, velocity: number): void {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;

    for (let i = 0; i < this.items.length; i++) {
      const { element, mesh, material, crystal } = this.items[i];
      const rect = element.getBoundingClientRect();

      // Synchronize exact dimensions and positions (1 unit = 1 pixel)
      mesh.scale.set(rect.width, rect.height, 1);
      const centerX = rect.left + rect.width / 2 - halfW;
      const centerY = -(rect.top + rect.height / 2 - halfH);

      mesh.position.x = centerX;
      mesh.position.y = centerY;
      mesh.position.z = -10; // Placed slightly behind DOM

      // Pass time, velocity and mouse coords to GLSL
      material.uniforms.u_time.value = time;
      material.uniforms.u_velocity.value = velocity;
      material.uniforms.u_mouse.value.set(this.mousePos.x, this.mousePos.y);

      // Position crystal floating in the upper-right corner of the card
      const crystalX = rect.right - 70 - halfW;
      const crystalY = -(rect.top + 70 - halfH);

      crystal.position.set(crystalX, crystalY, 35); // Floats 35 units in front of plane
      crystal.rotation.x = time * 0.9 + i;
      crystal.rotation.y = time * 1.2 + (velocity * 0.002);
      crystal.rotation.z = time * 0.5;

      // Gentle floating bob
      crystal.position.y += Math.sin(time * 2.5 + i) * 6;
    }
  }

  public setWireframeMode(enabled: boolean): void {
    for (const item of this.items) {
      item.material.uniforms.u_wireframe.value = enabled ? 1.0 : 0.0;
    }
  }
}
