import type { Scene } from '@babylonjs/core';
import { UniversalCamera, Vector3, MeshBuilder } from '@babylonjs/core';

type MapKey = 'default' | 'large' | 'obstacles';

type SceneMaterials = ReturnType<typeof import('./materials').createMaterials>;
type ObjectsResult = ReturnType<typeof import('./objects').createObjects>;

export type MapApplier = (
  scene: Scene,
  materials: SceneMaterials,
  objects: ObjectsResult
) => (() => void) | void;

export type MapTuning = {
  mapSpeedMultiplier?: number;
};

const mapTuning: Record<MapKey, MapTuning> = {
  default: { mapSpeedMultiplier: 1 },
  large: { mapSpeedMultiplier: 2 },
  obstacles: { mapSpeedMultiplier: 2 },
};

export function getMapTuning(key: MapKey): MapTuning {
  return mapTuning[key] ?? mapTuning.default;
}

// Large map builder that is reused for other maps
function applyLargeBase(scene: Scene, materials: SceneMaterials, objects: ObjectsResult) {
  const { paddle1, paddle2, wallTop, wallBottom, namePlate1, namePlate2, limits } = objects;

  // capture previous state for cleanup
  const cam = scene.activeCamera as UniversalCamera | null;
  const prevCamPos = cam ? cam.position.clone() : null;

  const prevPaddle1X = paddle1.position.x;
  const prevPaddle2X = paddle2.position.x;

  const prevScaleP1 = paddle1.scaling.clone();
  const prevScaleP2 = paddle2.scaling.clone();

  const prevWallTopZ = wallTop.position.z;
  const prevWallBottomZ = wallBottom.position.z;

  const prevLimits = { ...limits };
  const prevName1X = namePlate1 ? namePlate1.position.x : undefined;
  const prevName2X = namePlate2 ? namePlate2.position.x : undefined;

  // scale multiplier
  const SCALE = 2;

  if (cam) {
    cam.position = new Vector3(cam.position.x, cam.position.y * SCALE, cam.position.z);
    cam.setTarget(Vector3.Zero());
  }

  objects.paddleDistance *= SCALE + 0.3;
  paddle1.position.x = objects.paddleDistance;
  paddle2.position.x = -objects.paddleDistance;

  paddle1.scaling.z *= 1.5;
  paddle2.scaling.z *= 1.5;

  wallTop.position.z    = prevWallTopZ * SCALE;
  wallBottom.position.z = prevWallBottomZ * SCALE;

  if (namePlate1 && prevName1X !== undefined) namePlate1.position.x = prevName1X * SCALE;
  if (namePlate2 && prevName2X !== undefined) namePlate2.position.x = prevName2X * SCALE;

  // Update the world matrix in order to get the new boundingInfo
  paddle1.computeWorldMatrix(true);
  paddle2.computeWorldMatrix(true);
  wallTop.computeWorldMatrix(true);
  wallBottom.computeWorldMatrix(true);

  const paddleHalfZ  = paddle1.getBoundingInfo().boundingBox.extendSizeWorld.z;
  const wallHalfZTop = wallTop.getBoundingInfo().boundingBox.extendSizeWorld.z;
  const wallHalfZBot = wallBottom.getBoundingInfo().boundingBox.extendSizeWorld.z;

  limits.upperLimitZ = wallTop.position.z    - wallHalfZTop - paddleHalfZ;
  limits.lowerLimitZ = wallBottom.position.z + wallHalfZBot + paddleHalfZ;

  return () => {
    if (cam && prevCamPos) cam.position.copyFrom(prevCamPos);

    paddle1.position.x = prevPaddle1X;
    paddle2.position.x = prevPaddle2X;

    paddle1.scaling.copyFrom(prevScaleP1);
    paddle2.scaling.copyFrom(prevScaleP2);

    wallTop.position.z = prevWallTopZ;
    wallBottom.position.z = prevWallBottomZ;

    if (namePlate1 && prevName1X !== undefined) namePlate1.position.x = prevName1X;
    if (namePlate2 && prevName2X !== undefined) namePlate2.position.x = prevName2X;

    limits.upperLimitZ = prevLimits.upperLimitZ;
    limits.lowerLimitZ = prevLimits.lowerLimitZ;
  };
}

// Main map generator logic
const maps: Record<MapKey, MapApplier> = {
  default: (scene, materials, { floor }) => {
    return () => {};
  },

  large: (scene, materials, objects) => applyLargeBase(scene, materials, objects),

  obstacles: (scene, materials, objects) => {
    const undoLarge = applyLargeBase(scene, materials, objects);

    const midWidth = 12;
    const midDepth = 0.2;
    const midHeight = 0.6;

    const midZ = Math.abs(objects.wallTop.position.z) * 0.40;

    const midWall1 = MeshBuilder.CreateBox('midWall1', { width: midWidth, height: midHeight, depth: midDepth }, scene);
    const midWall2 = MeshBuilder.CreateBox('midWall2', { width: midWidth, height: midHeight, depth: midDepth }, scene);

    midWall1.position.set(0, 0,  +midZ);
    midWall2.position.set(0, 0,  -midZ);

    // reuse the existing wall material for a consistent look
    midWall1.material = objects.wallTop.material;
    midWall2.material = objects.wallTop.material;

    // expose them so the game loop can include them in collision
    (objects as any).extraBounceables = [midWall1, midWall2];

    return () => {
      try { midWall1.dispose(); } catch {}
      try { midWall2.dispose(); } catch {}
      (objects as any).extraBounceables = undefined;
      undoLarge?.();
    };
  },
};

export function applyMap(
  key: MapKey,
  scene: Scene,
  materials: SceneMaterials,
  objects: ObjectsResult
) {
  const applier = maps[key] ?? maps.default;
  const undo = applier(scene, materials, objects);
  return typeof undo === 'function' ? undo : undefined;
}
