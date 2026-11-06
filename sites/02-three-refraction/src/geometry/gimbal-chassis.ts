import * as THREE from 'three';
import { createBrushedTitaniumMaterial } from '../materials/brushed-titanium';

export class GimbalChassis {
  public group: THREE.Group;
  public ringOuter: THREE.Mesh;
  public ringInner: THREE.Mesh;
  public axlePins: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    const titaniumMaterial = createBrushedTitaniumMaterial();

    // 1. Outer Gimbal Ring
    const outerGeo = new THREE.TorusGeometry(2.6, 0.08, 16, 64);
    this.ringOuter = new THREE.Mesh(outerGeo, titaniumMaterial);
    this.ringOuter.castShadow = true;
    this.group.add(this.ringOuter);

    // 2. Inner Gimbal Ring (nested inside outer ring)
    const innerGeo = new THREE.TorusGeometry(2.35, 0.07, 16, 64);
    this.ringInner = new THREE.Mesh(innerGeo, titaniumMaterial);
    this.ringInner.rotation.x = Math.PI / 4;
    this.ringInner.castShadow = true;
    this.group.add(this.ringInner);

    // 3. Precision Axle Mounts and Vernier Registration Knurls
    this.axlePins = new THREE.Group();
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xE0AF68, // Gold registration pins
      metalness: 0.95,
      roughness: 0.15
    });

    const positions: [number, number, number][] = [
      [2.6, 0, 0],
      [-2.6, 0, 0],
      [0, 2.6, 0],
      [0, -2.6, 0]
    ];

    positions.forEach(([x, y, z]) => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);
      if (x !== 0) pin.rotation.z = Math.PI / 2;
      this.axlePins.add(pin);
    });

    this.group.add(this.axlePins);
  }

  public update(delta: number): void {
    this.ringOuter.rotation.z += delta * 0.1;
    this.ringInner.rotation.y += delta * 0.2;
    this.ringInner.rotation.x += delta * 0.08;
  }
}
