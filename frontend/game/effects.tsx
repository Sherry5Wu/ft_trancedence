import { Scene, MeshBuilder, AbstractMesh } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MeshExploder } from '@babylonjs/core/Misc/meshExploder';
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor';
import { Animation } from '@babylonjs/core/Animations/animation';
import { EasingFunction, QuinticEase } from '@babylonjs/core/Animations/easing';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { GPUParticleSystem } from '@babylonjs/core/Particles/gpuParticleSystem';
import { SphereParticleEmitter } from '@babylonjs/core/Particles/EmitterTypes/sphereParticleEmitter';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Texture } from '@babylonjs/core';
import { Sound } from '@babylonjs/core/Audio/sound';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';

//position: Vector3 at gatherball doesn't provide enough info for AbstractMesh, so we widen the sources to remove the warning at makeShard
interface PositionSource { position: Vector3; }

let fireTrail: GPUParticleSystem | null = null;

function makeShard(
  scene: Scene,
  ball: AbstractMesh | PositionSource,
  ballMaterial: PBRMaterial
): Mesh {
  const shard = MeshBuilder.CreateBox(
    'shard',
    {
      width: 0.1 + Math.random() * 0.1,
      height: 0.05 + Math.random() * 0.05,
      depth: 0.05 + Math.random() * 0.1,
    },
    scene
  ) as Mesh;

  // clone the ball material (which carries its current emissive settings)
  const shardMat = ballMaterial.clone(`shardMat_${Math.random()}`);
  shard.material = shardMat;

  // position & rotation untouched…
  shard.position = ball.position.add(
    new Vector3(
      (Math.random() - 0.5) * 0.2,
      0,
      (Math.random() - 0.5) * 0.2
    )
  );
  shard.rotation = new Vector3(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  return shard;
}

export function explodeBall(
  scene: Scene,
  ball: Mesh,
  ballMaterial: PBRMaterial,
  lastVx: number,
  lastVz: number
) {
  // pieces is now a Mesh[]
  const pieces: Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    pieces.push(makeShard(scene, ball, ballMaterial));
  }

  // Now this matches MeshExploder’s signature
  new MeshExploder(pieces).explode(0.1);

  const baseDir = new Vector3(lastVx, 0, lastVz).normalize();
  pieces.forEach((p) => {
    p.physicsImpostor = new PhysicsImpostor(
      p,
      PhysicsImpostor.SphereImpostor,
      { mass: 0.1, restitution: 0.6, friction: 0.5 },
      scene
    );
    const rnd = () => (Math.random() - 0.5) * 0.6;
    const dir = baseDir.add(new Vector3(rnd(), rnd(), rnd())).normalize();
    p.physicsImpostor.applyImpulse(dir.scale(1), p.getAbsolutePosition());
    setTimeout(() => p.dispose(), 3000);
  });
}

export function gatherBall(
  scene: Scene,
  ballMaterial: PBRMaterial,
  onComplete: () => void
): void {
  const pieces: Mesh[] = [];
  const count = 32;
  const radiusOuter = 2.5;

  for (let i = 0; i < count; i++) {
    const p = makeShard(scene, { position: Vector3.Zero() }, ballMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = radiusOuter * (0.8 + 0.2 * Math.random());
    const height = (Math.random() - 0.5) * 0.5;

    p.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    p.scaling = new Vector3(0, 0, 0);
    pieces.push(p);
  }

  pieces.forEach((p) => {
    const posAnim = new Animation(
      'gatherPos',
      'position',
      40,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    posAnim.setKeys([
      { frame: 0, value: p.position.clone() },
      { frame: 40, value: Vector3.Zero() },
    ]);

    const scaleAnim = new Animation(
      'gatherScale',
      'scaling',
      40,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    scaleAnim.setKeys([
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 40, value: new Vector3(1, 1, 1) },
    ]);

    const ease = new QuinticEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    posAnim.setEasingFunction(ease);
    scaleAnim.setEasingFunction(ease);

    p.animations = [posAnim, scaleAnim];
    scene.beginAnimation(p, 0, 40, false, 0.7, () => {
      p.dispose();
      if (pieces.every((m) => m.isDisposed())) {
        onComplete();
      }
    });
  });
}

export function spawnFlash(
  position: Vector3,
  scene: Scene,
  warmYellow: Color3,
  flareTexture: Texture
): void {
  const flash = new ParticleSystem('flash', 30, scene);
  flash.particleTexture = flareTexture;
  flash.emitter = position.clone();
  flash.minEmitBox = flash.maxEmitBox = Vector3.Zero();
  flash.color1 = new Color4(warmYellow.r, warmYellow.g, warmYellow.b, 1);
  flash.color2 = new Color4(1, 1, 1, 1);
  flash.minSize = 0.15;
  flash.maxSize = 0.3;
  flash.minLifeTime = 0.15;
  flash.maxLifeTime = 0.25;
  flash.emitRate = 1000;
  flash.gravity = Vector3.Zero();
  flash.direction1 = new Vector3(-0.5, 0.3, 0.1);
  flash.direction2 = new Vector3(0.5, -0.3, -0.1);
  flash.manualEmitCount = 30;
  flash.disposeOnStop = true;
  flash.start();
  setTimeout(() => flash.stop(), 100);

  const light = new PointLight('flashLight', position.clone(), scene);
  light.diffuse = new Color3(1, 0.9, 0.5);
  light.intensity = 2;
  light.range = 2;

  let fade = 1;
  const fadeInterval = setInterval(() => {
    fade -= 0.1;
    light.intensity = fade * 2;
    if (fade <= 0) {
      light.dispose();
      clearInterval(fadeInterval);
    }
  }, 30);

  const paddleSound = new Sound(
    'paddleHit',
    'https://cdn.jsdelivr.net/gh/anrisan/assets/audio/ping.mp3',
    scene,
    null,
    { autoplay: true, volume: 0.7, spatialSound: true, maxDistance: 10, refDistance: 1 }
  );
  paddleSound.setPosition(position);
}

export function flashPaddle(
  paddle: AbstractMesh,
  scene: Scene,
  color: Color3 = new Color3(1, 0.5, 0)
): void {
  const material = paddle.material as any;
  const originalEmissive = (material.emissiveColor as Color3).clone();

  const anim = new Animation(
    'paddleGlow',
    'emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  anim.setKeys([
    { frame: 0, value: originalEmissive },
    { frame: 5, value: color },
    { frame: 15, value: originalEmissive },
  ]);

  material.animations = [anim];
  scene.beginAnimation(material, 0, 15, false);
}

export function createFireTrail(
  ball: AbstractMesh,          // <-- now typed as an AbstractMesh
  scene: Scene,
  flameTexture: Texture
): void {
  fireTrail = new GPUParticleSystem('fireTrail', { capacity: 2000 }, scene);
  fireTrail.particleTexture = flameTexture;

  // Keep a properly typed emitter for SphereParticleEmitter
  const sphereEmitter = new SphereParticleEmitter();
  sphereEmitter.radius = 0.2;
  sphereEmitter.radiusRange = 1;
  fireTrail.particleEmitterType = sphereEmitter;

  // Now assign the mesh directly—no TypeScript error:
  fireTrail.emitter = ball;

  fireTrail.color1 = new Color4(1, 1, 0, 0.6);
  fireTrail.color2 = new Color4(1, 1, 0, 0.4);
  fireTrail.colorDead = new Color4(0, 0, 0, 0);
  fireTrail.minLifeTime = 0.15;
  fireTrail.maxLifeTime = 0.25;
  fireTrail.minEmitPower = 0.1;
  fireTrail.maxEmitPower = 0.3;
  fireTrail.direction1 = new Vector3(0, 1, 0);
  fireTrail.direction2 = new Vector3(0, 1, 0);
  fireTrail.addSizeGradient(0, 0.4).addSizeGradient(1, 0.01);
  fireTrail.addColorGradient(0, new Color4(1, 1, 0, 0.6));
  fireTrail.addColorGradient(0.7, new Color4(1, 1, 0, 0.4));
  fireTrail.addColorGradient(1, new Color4(0, 0, 0, 0));
  fireTrail.addVelocityGradient(0, 0).addVelocityGradient(1, -0.3);

  fireTrail.start();
  fireTrail.emitRate = 0;
  fireTrail.minSize = 0;
  fireTrail.maxSize = 0;
}

export function updateFireTrail(boostLevel: number): void {
  if (!fireTrail) return;
  if (boostLevel <= 0) {
    fireTrail.emitRate = 0;
    fireTrail.minSize = 0;
    fireTrail.maxSize = 0;
  } else if (boostLevel > 5) {
    fireTrail.emitRate = 50 * boostLevel - 5;
    fireTrail.minSize = 0.05 * boostLevel - 5;
    fireTrail.maxSize = 0.1 * boostLevel - 5;
  }
}

export function resetFireTrail(): void {
  if (!fireTrail) return;
  fireTrail.reset();
  fireTrail.emitRate = 0;
  fireTrail.minSize = 0;
  fireTrail.maxSize = 0;
}