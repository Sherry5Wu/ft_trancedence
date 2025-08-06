import React, { useEffect } from 'react';
import {
  Scene,
  Engine,
  Texture,
  Vector3,
  Ray,
  Color3,
  AbstractMesh,
} from '@babylonjs/core';

import { explodeBall, gatherBall, spawnFlash, flashPaddle, createFireTrail, updateFireTrail, resetFireTrail } from './effects';
import { createScene } from './sceneSetup';
import { createObjects } from './objects';
import { createMaterials } from './materials';
import { updatePauseOverlay, updateStartPrompt, updateScore } from './uiHelpers';

type GameCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  playerNames: [string, string];
};

const GameCanvas: React.FC<GameCanvasProps> = ({ canvasRef, playerNames }) => {
  const [p1Name, p2Name] = playerNames;
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { engine, scene } = createScene(canvas);
    const materials = createMaterials(scene);
    const { ballMaterial, warmYellow } = materials;
    const { ball, paddle1, paddle2, paddleDistance, wallTop, wallBottom, limits } = createObjects(scene, materials);
    const { upperLimitZ, lowerLimitZ } = limits;

    const flareTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", scene);
    const flameTexture = new Texture("https://playground.babylonjs.com/textures/flame.png", scene);
    createFireTrail(ball, scene, flameTexture);
    updateFireTrail(0);

    let score1 = 0, score2 = 0;
    let vx = 0.105, vz = 0.06;
    let paused = true;
    let awaitingStart = true;
    let acceptingInput = true;
    let boostLevel = 0;
    const boostPressed = new Set<string>();
    const keysPressed = new Set<string>();

    const pauseOverlay = document.getElementById("pauseOverlay")!;
    const startPrompt = document.getElementById("startPrompt") as HTMLElement;
    const scoreBoard = document.getElementById("scoreBoard") as HTMLElement;

    window.addEventListener("keydown", e => {
      if (!acceptingInput) return;
      keysPressed.add(e.key);

      if (e.key === "a") boostPressed.add("paddle1");
      if (e.key === "ArrowRight") boostPressed.add("paddle2");

      if (e.code === "Space") {
        if (awaitingStart) {
          awaitingStart = false;
          paused = false;
          updateStartPrompt(startPrompt, awaitingStart);
          updatePauseOverlay(pauseOverlay, paused, awaitingStart);
        } else {
          paused = !paused;
          updatePauseOverlay(pauseOverlay, paused, awaitingStart);
        }
      }
    });

    window.addEventListener("keyup", e => {
      keysPressed.delete(e.key);
      if (e.key === "a") boostPressed.delete("paddle1");
      if (e.key === "ArrowRight") boostPressed.delete("paddle2");
    });

    function resetPaddles() {
      paddle1.position.z = 0;
      paddle2.position.z = 0;
    }

    function resetBall() {
      awaitingStart = true;
      ball.isVisible = true;
      vx = (Math.random() < 0.5 ? -1 : 1) * 0.07;
      vz = (Math.random() < 0.5 ? -1 : 1) * 0.04;
      resetPaddles();
      updatePauseOverlay(pauseOverlay, paused, awaitingStart);
      updateStartPrompt(startPrompt, awaitingStart);

      ballMaterial.emissiveIntensity = 0;
      ballMaterial.emissiveColor     = new Color3(0, 0, 0);


      boostLevel = 0;
      resetFireTrail();
      updateFireTrail(0);
    }

    // Main game loop
    scene.onBeforeRenderObservable.add(() => {
      if (paused) return;
    
      const deltaFactor = engine.getDeltaTime() / (1000 / 60);
      const stepX = vx * deltaFactor;
      const stepZ = vz * deltaFactor;
      const stepLength = Math.hypot(stepX, stepZ);
      if (stepLength === 0) return;
    
      //Paddle movement
      const paddleSpeed = 0.125 * deltaFactor;
      if (keysPressed.has('ArrowUp'))   paddle2.position.z -= paddleSpeed;
      if (keysPressed.has('ArrowDown')) paddle2.position.z += paddleSpeed;
      if (keysPressed.has('w')) paddle1.position.z -= paddleSpeed;
      if (keysPressed.has('s')) paddle1.position.z += paddleSpeed;
      // Clamp each paddle within the top/bottom walls
      paddle1.position.z = Math.min(
        Math.max(paddle1.position.z, lowerLimitZ),
        upperLimitZ
      );
      paddle2.position.z = Math.min(
        Math.max(paddle2.position.z, lowerLimitZ),
        upperLimitZ
      );
    
      const origin = ball.position.clone();
      const dir = new Vector3(stepX, 0, stepZ).scale(1 / stepLength);
      const radius = ball.getBoundingInfo().boundingSphere.radius;
      const ray = new Ray(origin, dir, stepLength + radius);
      const bounceables: AbstractMesh[] = [paddle1, paddle2, wallTop, wallBottom];
    
      // 1) Get picks for checking collision (coalesce null into [])
      const picks = scene.multiPickWithRay(ray, mesh => bounceables.includes(mesh)) ?? [];
    
      // 2) No hits → just move the ball
      if (picks.length === 0) {
        ball.position = origin.add(dir.scale(stepLength));
      } else {
        // 3) We have at least one hit → pick nearest
        picks.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
        const pick = picks[0];
    
        // 4) If it’s really in range, bounce
        if (pick.hit && pick.distance! <= stepLength + radius) {
          const travel = Math.max(pick.distance! - radius, 0);
          ball.position = origin.add(dir.scale(travel));
    
          const N = pick.getNormal(true)!;
          const V = new Vector3(vx, 0, vz);
          const dot = Vector3.Dot(V, N);
          const R = V.subtract(N.scale(2 * dot));
    
          let boostMultiplier = 1;
          if (pick.pickedMesh === paddle1 && boostPressed.has("paddle1")) {
            boostMultiplier = 1.25; boostLevel++; updateFireTrail(boostLevel); flashPaddle(paddle1, scene);
          } else if (pick.pickedMesh === paddle2 && boostPressed.has("paddle2")) {
            boostMultiplier = 1.25; boostLevel++; updateFireTrail(boostLevel); flashPaddle(paddle2, scene);
          }
    
          if (boostLevel > 0) {
            ballMaterial.emissiveColor = new Color3(1, 0.4, 0);
            ballMaterial.emissiveIntensity = 0.05 * boostLevel ** 2;
          }
          vx = R.x * boostMultiplier;
          vz = R.z * boostMultiplier;
    
          spawnFlash(ball.position, scene, warmYellow, flareTexture);
    
          const leftover = stepLength - travel;
          ball.position = ball.position.add(new Vector3(vx, 0, vz).normalize().scale(leftover));
        } else {
          // ray hit something but not close enough: treat as no-hit
          ball.position = origin.add(dir.scale(stepLength));
        }
      }

      if (ball.position.x < -paddleDistance - 1.5 || ball.position.x > paddleDistance + 1.5) {
        paused = true;
        acceptingInput = false;

        resetFireTrail();

        if (ball.position.x > paddleDistance + 1.5) score2++;
        else score1++;

        updateScore(scoreBoard, score1, score2, p1Name, p2Name);
        const lastVx = vx, lastVz = vz;
        ball.isVisible = false;

        explodeBall(scene, ball, ballMaterial, lastVx, lastVz);
        setTimeout(() => {
          ballMaterial.emissiveIntensity = 0;
          ballMaterial.emissiveColor = new Color3(0, 0, 0);
          gatherBall(scene, ballMaterial, () => {
            ball.position.set(0, 0, 0);
            ball.isVisible = true;
            resetBall();
            acceptingInput = true;
          });
        }, 500);
      }
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());

    updateScore(scoreBoard, score1, score2, p1Name, p2Name);
    resetBall();
  }, [canvasRef, p1Name, p2Name]);

  return null;
};

export default GameCanvas;
