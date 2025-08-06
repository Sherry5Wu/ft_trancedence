import { Scene, Mesh, AbstractMesh, MeshBuilder, GroundMesh } from '@babylonjs/core';
import { SceneMaterials } from './materials';

export type ObjectsResult = {
  ball: Mesh;
  paddle1: Mesh;
  paddle2: Mesh;
  paddleDistance: number;
  wallTop: Mesh;
  wallBottom: Mesh;
  floor: GroundMesh;
  limits: { upperLimitZ: number; lowerLimitZ: number };
};

export function createObjects(
  scene: Scene,
  materials: SceneMaterials
): ObjectsResult {
  // Ball
  const ball = MeshBuilder.CreateSphere('ball', { diameter: 0.4 }, scene);
  ball.material = materials.ballMaterial;

  // Paddles
  const paddle1 = MeshBuilder.CreateBox(
    'paddle1',
    { width: 0.3, height: 0.3, depth: 2 },
    scene
  );
  const paddle2 = MeshBuilder.CreateBox(
    'paddle2',
    { width: 0.3, height: 0.3, depth: 2 },
    scene
  );
  paddle1.material = materials.paddleMaterial;
  paddle2.material = materials.paddleMaterial;

  const paddleDistance = 8;
  paddle1.position.x = paddleDistance;
  paddle2.position.x = -paddleDistance;

  // Walls
  const wallTop = MeshBuilder.CreateBox(
    'wallTop',
    { width: 100, height: 0.2, depth: 0.5 },
    scene
  );
  wallTop.material = materials.wallMaterial;
  const wallBottom = wallTop.clone('wallBottom') as Mesh;

  const wallDistance = 5;
  wallTop.position.z = wallDistance;
  wallBottom.position.z = -wallDistance;

  // Floor
  const floor = MeshBuilder.CreateGround(
    'floor',
    { width: 102, height: 102 },
    scene
  ) as GroundMesh;
  floor.position.y = -0.15;
  floor.material = materials.floorMat;

  // Compute movement limits based on bounding boxes
  const paddleHalfZ =
    (paddle1.getBoundingInfo().boundingBox.extendSize).z;
  const wallHalfZ = (wallTop.getBoundingInfo().boundingBox.extendSize).z;
  const upperLimitZ = wallTop.position.z - wallHalfZ - paddleHalfZ;
  const lowerLimitZ = wallBottom.position.z + wallHalfZ + paddleHalfZ;

  return {
    ball,
    paddle1,
    paddle2,
    paddleDistance,
    wallTop,
    wallBottom,
    floor,
    limits: { upperLimitZ, lowerLimitZ },
  };
}
