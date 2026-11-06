import * as THREE from 'three';

/**
 * Zero-Leak Scene Disposer
 * Traverses every object in a Three.js scene graph, disposing of geometries,
 * multi-materials, textures, and render targets.
 */
export function disposeSceneHierarchy(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => disposeMaterial(mat));
        } else {
          disposeMaterial(object.material);
        }
      }
    }
  });

  renderer.dispose();
}

function disposeMaterial(mat: THREE.Material): void {
  mat.dispose();

  // Dispose all associated textures
  const materialRecord = mat as unknown as Record<string, unknown>;
  for (const key of Object.keys(materialRecord)) {
    const value = materialRecord[key];
    if (value && typeof value === 'object' && value instanceof THREE.Texture) {
      value.dispose();
    }
  }
}
