import {
  Scene, Mesh, AbstractMesh, MeshBuilder, GroundMesh,
  DynamicTexture, StandardMaterial, Color3, Vector3
} from '@babylonjs/core';
import { SceneMaterials } from './materials';

export type ObjectsResult = {
  ball: Mesh;
  paddle1: Mesh;
  paddle2: Mesh;
  paddleDistance: number;
  wallTop: Mesh;
  wallBottom: Mesh;
  floor: GroundMesh;
  namePlate1?: Mesh;
  namePlate2?: Mesh;
  limits: { upperLimitZ: number; lowerLimitZ: number };
  extraBounceables?: AbstractMesh[];
  shield1?: Mesh;
  shield2?: Mesh;
};

type CreateObjectsOpts = {
  playerNames?: [string, string];
  nameOffset?: number;
  nameScale?: number;
};

// Nameplates behind the scoring line
function makeVerticalNameTexture(scene: Scene, text: string, fontPx = 64) {
  const padding = 16;
  const texW = Math.max(1, Math.floor(text.length * (fontPx * 0.75) + padding * 2));
  const texH = Math.max(1, Math.floor(fontPx + padding * 2));

  const dt = new DynamicTexture(`nameDT-${text}`, { width: texW, height: texH }, scene, true);
  const ctx = dt.getContext() as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, texW, texH);
  ctx.fillStyle = '#fff8e7';
  ctx.font = `bold ${fontPx}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 12;
  ctx.fillText(text, texW / 2, texH / 2);

  dt.update();
  return { texture: dt, texW, texH, fontPx };
}

function createNamePlate(
  scene: Scene,
  name: string,
  x: number,
  floorY: number,
  lowerLimitZ: number,
  upperLimitZ: number,
  faceInward: boolean,
  margin = 0.2,
  scale = 1
) {
  const { texture, texW, texH } = makeVerticalNameTexture(scene, name, 64);

  const mat = new StandardMaterial(`nameMat-${name}`, scene);
  mat.diffuseTexture = texture;
  (mat.diffuseTexture as DynamicTexture).hasAlpha = true;
  mat.useAlphaFromDiffuseTexture = true;
  mat.specularColor = Color3.Black();

  const spanZ = Math.max(0, upperLimitZ - lowerLimitZ);
  const maxLenZ = Math.max(0, spanZ - 2 * margin);
  const centerZ = lowerLimitZ + spanZ / 2;
  const base = 1.2 * scale;

  // Text sizes, Z = length, X = height
  const naturalU_alongZ = base * (texW / 80);
  const naturalV_alongX = base * (texH / 80);

  // Clamp ONLY the U length (along Z). Keep V (glyph height) constant.
  const widthAlongZ  = Math.min(naturalU_alongZ, maxLenZ); // shrink for long names
  const heightAlongX = naturalV_alongX;                    // keep glyph height unchanged

  // - plane.width corresponds to U (texture width)
  // - plane.height corresponds to V (texture height)
  // We'll rotate so plane.width → world Z and plane.height → world X.
  const plane = MeshBuilder.CreatePlane(`namePlate-${name}`, {
    width:  widthAlongZ,
    height: heightAlongX,
  }, scene);

  plane.material = mat;
  plane.isPickable = false;

  // Lay flat on floor
  plane.rotation.x = Math.PI / 2;
  plane.rotation.y = faceInward ? Math.PI / 2 : -Math.PI / 2;

  plane.position.set(x, floorY, centerZ);
  return plane;
}

export function createObjects(
  scene: Scene,
  materials: SceneMaterials,
  opts: CreateObjectsOpts = {}
): ObjectsResult {
  const { playerNames, nameOffset = 3, nameScale = 1 } = opts;

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
  paddle1.material = materials.paddle1Material;
  paddle2.material = materials.paddle2Material;

  const paddleDistance = 8;
  paddle1.position.x = paddleDistance;
  paddle2.position.x = -paddleDistance;

  // Shields
  const shieldMat = new StandardMaterial('shieldMat', scene);
  shieldMat.diffuseColor = new Color3(1, 1, 1);
  shieldMat.alpha = 0.4;

  const shield1 = MeshBuilder.CreateBox('shield1', {
    width: 0.2,
    height: 0.6,
    depth: 1.5,
  }, scene);
  shield1.material = shieldMat;
  shield1.isVisible = false;

  const shield2 = shield1.clone('shield2') as Mesh;
  shield2.isVisible = false;

  // Walls
  const wallTop = MeshBuilder.CreateBox(
    'wallTop',
    { width: 100, height: 0.2, depth: 0.5 },
    scene
  );
  wallTop.material = materials.wallMaterial;
  const wallBottom = wallTop.clone('wallBottom') as Mesh;

  const wallDistance = 6.2;
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

  let namePlate1: Mesh | undefined;
  let namePlate2: Mesh | undefined;
  if (playerNames) {
    const [p1Name, p2Name] = playerNames;
    const margin = 0.2;
    const floorY = floor.position.y + 0.001;
    const inwardshift = 1;

    namePlate1 = createNamePlate(
      scene, p1Name,
      +paddleDistance + nameOffset - inwardshift,
      floorY,
      lowerLimitZ, upperLimitZ,
      true,
      margin, 1
    );

    namePlate2 = createNamePlate(
      scene, p2Name,
      -paddleDistance - nameOffset + inwardshift,
      floorY,
      lowerLimitZ, upperLimitZ,
      false,
      margin, 1
    );
  }

  return {
    ball,
    paddle1,
    paddle2,
    paddleDistance,
    wallTop,
    wallBottom,
    floor,
    namePlate1,
    namePlate2,
    limits: { upperLimitZ, lowerLimitZ },
    shield1,
    shield2,
  };
}
