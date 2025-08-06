import { Scene } from '@babylonjs/core';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';

export type SceneMaterials = {
  warmYellow: Color3;
  wallMaterial: StandardMaterial;
  paddleMaterial: StandardMaterial;
  ballMaterial: PBRMaterial;
  floorMat: StandardMaterial;
};

export function createMaterials(scene: Scene): SceneMaterials {
  // Warm yellow color for diffuse/emissive use
  const warmYellow = Color3.FromHexString('#FFCC00');

  // Standard materials for environment
  const wallMaterial = new StandardMaterial('wallMat', scene);
  wallMaterial.diffuseColor = warmYellow;

  const paddleMaterial = new StandardMaterial('paddleMat', scene);
  paddleMaterial.diffuseColor = warmYellow;

  // PBR material for ball to support emissive intensity
  const ballMaterial = new PBRMaterial('ballMat', scene);
  ballMaterial.albedoColor = Color3.White();
  ballMaterial.emissiveColor = Color3.White();
  ballMaterial.emissiveIntensity = 0;
  ballMaterial.metallic         = 0;
  ballMaterial.roughness        = 1;

  // Floor material
  const floorMat = new StandardMaterial('floorMat', scene);
  floorMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
  floorMat.ambientColor = new Color3(0.5, 0.5, 0.5);

  // Shared specular settings
  [wallMaterial, paddleMaterial, floorMat].forEach((mat) => {
    mat.specularColor = Color3.Black();
    mat.specularPower = 1;
  });

  return {
    warmYellow,
    wallMaterial,
    paddleMaterial,
    ballMaterial,
    floorMat,
  };
}
