import * as THREE from 'three';
import { createBorosilicateGlassMaterial } from '../materials/borosilicate-glass';

export class OpticalMonolith {
  public group: THREE.Group;
  public glassMesh: THREE.Mesh;
  public coreMesh: THREE.Mesh;
  public outerPrism: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // 1. Primary Faceted Glass Body (Chamfered Icosahedron with rounded bevels)
    const glassGeometry = new THREE.IcosahedronGeometry(1.4, 1);
    const glassMaterial = createBorosilicateGlassMaterial({
      roughness: 0.1,
      transmission: 0.95,
      ior: 1.52,
      thickness: 1.6
    });

    this.glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    this.glassMesh.castShadow = true;
    this.glassMesh.receiveShadow = true;
    this.group.add(this.glassMesh);

    // 2. Inner Glowing Core / Chromatic Reflector (Tetrahedron inside the glass)
    const coreGeometry = new THREE.OctahedronGeometry(0.55, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x7AA2F7,
      emissive: 0x2A3D66,
      emissiveIntensity: 0.8,
      metalness: 0.85,
      roughness: 0.2
    });

    this.coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    this.group.add(this.coreMesh);

    // 3. Surrounding Concentric Faceted Glass Ring
    const outerGeometry = new THREE.TorusGeometry(2.1, 0.12, 16, 48);
    const outerMaterial = createBorosilicateGlassMaterial({
      roughness: 0.22,
      transmission: 0.88,
      ior: 1.48,
      thickness: 0.8
    });
    this.outerPrism = new THREE.Mesh(outerGeometry, outerMaterial);
    this.outerPrism.rotation.x = Math.PI / 2;
    this.group.add(this.outerPrism);
  }

  public update(delta: number): void {
    this.glassMesh.rotation.y += delta * 0.35;
    this.glassMesh.rotation.x += delta * 0.15;

    this.coreMesh.rotation.y -= delta * 0.7;
    this.coreMesh.rotation.z += delta * 0.4;

    this.outerPrism.rotation.z += delta * 0.2;
  }
}
