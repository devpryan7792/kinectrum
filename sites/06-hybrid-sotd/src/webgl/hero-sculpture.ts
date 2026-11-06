import * as THREE from 'three';

export class HeroSculpture {
  public group: THREE.Group;
  private ringOuter: THREE.Mesh;
  private ringMid: THREE.Mesh;
  private icosahedron: THREE.Mesh;
  private coreSphere: THREE.Mesh;
  private particleCloud: THREE.Points;

  // Damped rotation targets
  public targetRotX = 0;
  public targetRotY = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. Outer Cyan Torus Ring
    const geoOuter = new THREE.TorusGeometry(180, 3.5, 30, 120);
    const matOuter = new THREE.MeshBasicMaterial({
      color: 0x7AA2F7,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.ringOuter = new THREE.Mesh(geoOuter, matOuter);
    this.group.add(this.ringOuter);

    // 2. Mid Gold Torus Ring
    const geoMid = new THREE.TorusGeometry(135, 2.5, 24, 100);
    const matMid = new THREE.MeshBasicMaterial({
      color: 0xE0AF68,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    this.ringMid = new THREE.Mesh(geoMid, matMid);
    this.group.add(this.ringMid);

    // 3. Inner Icosahedron Lattice
    const geoIco = new THREE.IcosahedronGeometry(85, 1);
    const matIco = new THREE.MeshBasicMaterial({
      color: 0xBB9AF7,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    this.icosahedron = new THREE.Mesh(geoIco, matIco);
    this.group.add(this.icosahedron);

    // 4. Central Luminous Core
    const geoCore = new THREE.SphereGeometry(35, 32, 32);
    const matCore = new THREE.MeshStandardMaterial({
      color: 0x7DCFFF,
      emissive: 0x24283B,
      roughness: 0.2,
      metalness: 0.8
    });
    this.coreSphere = new THREE.Mesh(geoCore, matCore);
    this.group.add(this.coreSphere);

    // 5. Orbiting Swarm Particles
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 4;
      const radius = 100 + Math.random() * 140;
      posArray[i * 3 + 0] = Math.cos(theta) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 180;
      posArray[i * 3 + 2] = Math.sin(theta) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 4,
      color: 0x7DCFFF,
      transparent: true,
      opacity: 0.8
    });
    this.particleCloud = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.particleCloud);

    // Position in hero area (Z = -50 for spatial depth behind text)
    this.group.position.set(220, 40, -50);
  }

  public update(time: number, velocity: number): void {
    const velInfluence = Math.abs(velocity) * 0.003;

    // Smooth damped mouse tilting
    this.group.rotation.x += (this.targetRotX - this.group.rotation.x) * 0.06;
    this.group.rotation.y += (this.targetRotY - this.group.rotation.y) * 0.06;

    // Continuous dynamic gyroscopic precession
    this.ringOuter.rotation.x = time * 0.4 + velInfluence;
    this.ringOuter.rotation.y = time * 0.6;

    this.ringMid.rotation.y = -time * 0.7 - velInfluence;
    this.ringMid.rotation.z = time * 0.5;

    this.icosahedron.rotation.x = time * 0.8;
    this.icosahedron.rotation.y = -time * 0.9;

    // Core breathing pulsation
    const pulse = 1.0 + Math.sin(time * 3.0) * 0.08;
    this.coreSphere.scale.set(pulse, pulse, pulse);

    // Orbiting particle cloud spin
    this.particleCloud.rotation.y = time * 0.3 + (velocity * 0.001);
  }

  public setMouseTilt(normX: number, normY: number): void {
    this.targetRotY = normX * 0.5;
    this.targetRotX = -normY * 0.4;
  }
}
