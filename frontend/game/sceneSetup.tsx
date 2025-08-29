import * as CANNON from 'cannon-es';
;(window as any).CANNON = CANNON;
import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin';
import {
  Engine,
  Scene,
  Vector3,
  UniversalCamera,
  HemisphericLight,
  DirectionalLight,
  GlowLayer,
  Color3,
  Color4,
} from '@babylonjs/core';

export type SceneSetupResult = {
  engine: Engine;
  scene: Scene;
  camera: UniversalCamera;
  sun: DirectionalLight;
  glow: GlowLayer;
};

function canCreateWebGL(canvas: HTMLCanvasElement): boolean {
  // Try WebGL2 first, then WebGL1
  const gl2 = canvas.getContext('webgl2');
  if (gl2) return true;
  const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl1;
}

export function createScene(canvas: HTMLCanvasElement): SceneSetupResult {
  // if WebGL is disabled/blocked, bail with a clear error
  if (!canCreateWebGL(canvas)) {
    throw new Error(
      'WebGL is disabled or unavailable in this browser. Enable WebGL in browser settings or try another browser.'
    );
  }

  // Engine & Scene
  let engine: Engine;
  try {
    engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
  } catch (e) {
    // Babylon can throw "WebGL not supported" here in some Firefox configs
    throw new Error('Failed to initialize the 3D engine (WebGL). Details: ' + (e as Error).message);
  }

  const scene = new Scene(engine);

  // Enable physics with Cannon.js
  const physicsPlugin = new CannonJSPlugin();
  scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

  // Camera
  const camera = new UniversalCamera('camera', new Vector3(0, 15, 0), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, false);
  camera.inputs.clear();

  // Lights
  const hemi = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  hemi.diffuse = Color3.White();
  hemi.groundColor = Color3.FromHexString('#888888');
  hemi.intensity = 0.8;

  const sun = new DirectionalLight('sun', new Vector3(0, -1, 0), scene);
  sun.position = new Vector3(0, 40, 0);
  sun.intensity = 0.2;

  // Glow
  const glow = new GlowLayer('glow', scene, { blurKernelSize: 32 });
  glow.intensity = 0.5;

  // Background
  scene.clearColor = new Color4(0, 0, 0, 1);

  return { engine, scene, camera, sun, glow };
}