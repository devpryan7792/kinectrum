import * as THREE from 'three';

export interface GlassConfig {
  roughness?: number;
  transmission?: number;
  ior?: number;
  thickness?: number;
  attenuationDistance?: number;
  attenuationColor?: THREE.Color;
}

export function createBorosilicateGlassMaterial(config: GlassConfig = {}): THREE.MeshPhysicalMaterial {
  const {
    roughness = 0.12,
    transmission = 0.94,
    ior = 1.52, // Optical Borosilicate glass
    thickness = 1.4,
    attenuationDistance = 2.5,
    attenuationColor = new THREE.Color(0.85, 0.93, 1.0)
  } = config;

  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0.0,
    roughness,
    transmission,
    ior,
    thickness,
    attenuationColor,
    attenuationDistance,
    transparent: true,
    opacity: 1.0,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 0.3,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false // Required for multi-pass transmission blending
  });
}
