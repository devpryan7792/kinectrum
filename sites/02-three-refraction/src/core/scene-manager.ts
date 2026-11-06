import * as THREE from 'three';
import { OpticalMonolith } from '../geometry/optical-monolith';
import { GimbalChassis } from '../geometry/gimbal-chassis';
import { StudioLightingRig } from './lighting-rig';
import { InertialCameraController } from './camera-controller';
import { createBorosilicateGlassMaterial } from '../materials/borosilicate-glass';
import { disposeSceneHierarchy } from '../lifecycle/resource-disposer';

export class SceneManager {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraController: InertialCameraController;
  public lightingRig: StudioLightingRig;

  public monolith: OpticalMonolith;
  public gimbal: GimbalChassis;

  // Stress test cluster
  private stressGroup: THREE.Group;
  private isStressMode = false;
  private stressMeshes: THREE.Mesh[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0A0A0C);

    // 1. WebGLRenderer with mandatory devicePixelRatio clamping
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 2. Camera Controller
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.cameraController = new InertialCameraController(canvas, aspect);

    // 3. Studio Lighting Rig
    this.lightingRig = new StudioLightingRig(this.scene);

    // 4. Primary Monolith & Gimbal Assembly
    this.monolith = new OpticalMonolith();
    this.scene.add(this.monolith.group);

    this.gimbal = new GimbalChassis();
    this.scene.add(this.gimbal.group);

    // 5. Contact Shadow Ground Plane
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 6. Stress Test Layer (5 Overlapping Refractive Bodies)
    this.stressGroup = new THREE.Group();
    this.stressGroup.visible = false;
    this.buildStressCluster();
    this.scene.add(this.stressGroup);
  }

  private buildStressCluster(): void {
    const geometries = [
      new THREE.TorusKnotGeometry(1.8, 0.25, 64, 16),
      new THREE.IcosahedronGeometry(2.1, 1),
      new THREE.OctahedronGeometry(2.4, 0),
      new THREE.DodecahedronGeometry(2.6, 0),
      new THREE.TorusGeometry(2.8, 0.15, 16, 48)
    ];

    geometries.forEach((geo, i) => {
      const mat = createBorosilicateGlassMaterial({
        roughness: 0.08 + i * 0.04,
        transmission: 0.92,
        ior: 1.45 + i * 0.03,
        thickness: 1.2
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      this.stressGroup.add(mesh);
      this.stressMeshes.push(mesh);
    });
  }

  public toggleStressTest(enable?: boolean): boolean {
    this.isStressMode = enable !== undefined ? enable : !this.isStressMode;
    this.stressGroup.visible = this.isStressMode;
    return this.isStressMode;
  }

  public resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.cameraController.setAspect(width / height);
  }

  public update(delta: number): void {
    this.cameraController.update(delta);
    this.monolith.update(delta);
    this.gimbal.update(delta);

    if (this.isStressMode) {
      this.stressMeshes.forEach((mesh, i) => {
        mesh.rotation.x += delta * (0.2 + i * 0.05);
        mesh.rotation.y += delta * (0.3 - i * 0.05);
      });
    }

    this.renderer.render(this.scene, this.cameraController.camera);
  }

  public destroy(): void {
    disposeSceneHierarchy(this.scene, this.renderer);
  }
}
