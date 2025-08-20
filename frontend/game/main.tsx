import React, { useEffect } from 'react';
import { Texture, Vector3, Ray, Color3, AbstractMesh } from '@babylonjs/core';
import { explodeBall, gatherBall, spawnFlash, flashPaddle, createFireTrail, updateFireTrail, resetFireTrail } from './effects';
import { createScene } from './sceneSetup';
import { createObjects } from './objects';
import { createMaterials } from './materials';
import { updatePauseOverlay, updateStartPrompt, updateScore } from './uiHelpers';
import { applyMap, getMapTuning } from './maps';

type WinMode = 'bo5' | 'bo9' | 'bo19';
type MapKey = 'default' | 'large' | 'obstacles';
type KeyBinding = { up: string; down: string; boost: string, shield: string };
type KeyBindings = { p1: KeyBinding; p2: KeyBinding };

type GameCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  playerNames: [string, string];
  isTournament: boolean;
  baseSpeed: number;
  winMode: WinMode;
  winTarget: number;
  mapKey?: MapKey;
  onMatchEnd?: (winner: string, score1: number, score2: number) => void;
  keyBindings: KeyBindings;
};

const GameCanvas: React.FC<GameCanvasProps> = ({
  canvasRef,
  playerNames: [p1Name, p2Name],
  isTournament,
  baseSpeed,
  winMode,
  winTarget,
  mapKey = 'default',
  onMatchEnd,
  keyBindings,
}) => {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const { engine, scene } = createScene(canvas);
    const materials = createMaterials(scene);
    const { ballMaterial, warmYellow } = materials;
    const objects = createObjects(scene, materials, { playerNames: [p1Name, p2Name], nameOffset: 3, nameScale: 1 });
    const { ball, paddle1, paddle2, wallTop, wallBottom, limits } = objects;
    const undoMap = applyMap(mapKey, scene, materials, objects);
    const { mapSpeedMultiplier = 1 } = getMapTuning(mapKey);

    type ShieldSide = 'paddle1' | 'paddle2';
    type ShieldState = { hp: number; broken: boolean };
    const MAX_SHIELD_HP = 3;
    const shieldState: Record<ShieldSide, ShieldState> = {
      paddle1: { hp: MAX_SHIELD_HP, broken: false },
      paddle2: { hp: MAX_SHIELD_HP, broken: false },
    };

    const flareTexture = new Texture("../assets/game/flare.png", scene);
    const flameTexture = new Texture("../assets/game/fire.jpg", scene);

    createFireTrail(ball, scene, flameTexture);
    updateFireTrail(0);
    let score1 = 0, score2 = 0;
    let vx = 0, vz = 0;
    let paused = true;
    let awaitingStart = true;
    let acceptingInput = true;
    let boostLevel = 0;
    let ended = false;
    let matchEndFired = false;
    const boostPressed = new Set<'paddle1' | 'paddle2'>();
    const shieldPressed = new Set<'paddle1' | 'paddle2'>();
    const keysPressed = new Set<string>();
    const pauseOverlay = document.getElementById("pauseOverlay")!;
    const startPrompt = document.getElementById("startPrompt") as HTMLElement;
    const scoreBoard = document.getElementById("scoreBoard") as HTMLElement;

    function setInitialVelocity() {
      const nx = 0.07, nz = 0.04;
      const mag = Math.hypot(nx, nz);
      const effective = baseSpeed * mapSpeedMultiplier;
      const s = effective / mag;
      vx = (Math.random() < 0.5 ? -1 : 1) * nx * s;
      vz = (Math.random() < 0.5 ? -1 : 1) * nz * s;
    }

    function placeShieldAtPaddleSnapshot(paddle: AbstractMesh, shield: AbstractMesh) {
      const padBB = paddle.getBoundingInfo().boundingBox.extendSize;
      const shBB  = shield.getBoundingInfo().boundingBox.extendSize;

      const gap = 0.05;
      const centerDir = paddle.position.x > 0 ? -1 : 1;

      const x = paddle.position.x + centerDir * (padBB.x + shBB.x + gap);
      const z = paddle.position.z;
      shield.position.set(x, 0, z);
    }

    function updateShieldVisual(shield: AbstractMesh, hp: number) {
      const sm = shield.material as any;
      if (!sm) return;
      const damage = Math.max(0, MAX_SHIELD_HP - hp);
      const tint = Math.min(1, damage / MAX_SHIELD_HP);
      sm.diffuseColor = new Color3(1, 1 - 0.4 * tint, 1 - 0.4 * tint);
      sm.alpha = 0.4 - 0.08 * damage;
    }

    function breakShield(side: ShieldSide) {
      const s = side === 'paddle1' ? objects.shield1 : objects.shield2;
      const st = shieldState[side];
      if (!s) return;
      st.hp = 0;
      st.broken = true;
      s.isVisible = false;
      spawnFlash(s.position, scene, warmYellow, flareTexture);
    }

    function canActivateShield(side: ShieldSide) {
      return !shieldState[side].broken && acceptingInput && !paused && !awaitingStart;
    }

    //Button press
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // prevent page scroll for arrows/space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();

      if (ended) return;
      if (!acceptingInput) return;

      keysPressed.add(e.code);

      // Boost flags from bindings
      if (e.code === keyBindings.p1.boost) boostPressed.add('paddle1');
      if (e.code === keyBindings.p2.boost) boostPressed.add('paddle2');

      // Shield flags from bindings
      if (!paused && e.code === keyBindings.p1.shield && !shieldPressed.has('paddle1')) {
        if (canActivateShield('paddle1')) {
          shieldPressed.add('paddle1');
          if (objects.shield1) {
            placeShieldAtPaddleSnapshot(paddle1, objects.shield1);
            objects.shield1.isVisible = true;
            updateShieldVisual(objects.shield1, shieldState.paddle1.hp);
          }
        }
      }
      if (!paused && e.code === keyBindings.p2.shield && !shieldPressed.has('paddle2')) {
        if (canActivateShield('paddle2')) {
          shieldPressed.add('paddle2');
          if (objects.shield2) {
            placeShieldAtPaddleSnapshot(paddle2, objects.shield2);
            objects.shield2.isVisible = true;
            updateShieldVisual(objects.shield2, shieldState.paddle2.hp);
          }
        }
      }

      if (e.code === 'Space') {
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
    };

    //Button release
    const onKeyUp = (e: KeyboardEvent) => {
      if (ended) return;
      keysPressed.delete(e.code);
      if (e.code === keyBindings.p1.boost) boostPressed.delete('paddle1');
      if (e.code === keyBindings.p2.boost) boostPressed.delete('paddle2');
      if (e.code === keyBindings.p1.shield) {shieldPressed.delete('paddle1');
        if (objects.shield1) objects.shield1.isVisible = false;
      }
      if (e.code === keyBindings.p2.shield) {shieldPressed.delete('paddle2');
        if (objects.shield2) objects.shield2.isVisible = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function resetPaddles() {
      paddle1.position.z = 0;
      paddle2.position.z = 0;
    }

    function resetBall() {
      awaitingStart = true;
      ball.isVisible = true;
      setInitialVelocity();
      resetPaddles();
      updatePauseOverlay(pauseOverlay, paused, awaitingStart);
      updateStartPrompt(startPrompt, awaitingStart);
      ballMaterial.emissiveIntensity = 0;
      ballMaterial.emissiveColor = new Color3(0, 0, 0);
      boostLevel = 0;
      resetFireTrail();
      updateFireTrail(0);
      shieldPressed.clear();
      if (objects.shield1) objects.shield1.isVisible = false;
      if (objects.shield2) objects.shield2.isVisible = false;
      shieldState.paddle1 = { hp: MAX_SHIELD_HP, broken: false };
      shieldState.paddle2 = { hp: MAX_SHIELD_HP, broken: false };
      if (objects.shield1) updateShieldVisual(objects.shield1, MAX_SHIELD_HP);
      if (objects.shield2) updateShieldVisual(objects.shield2, MAX_SHIELD_HP);
    }

    // Main game loop
    scene.onBeforeRenderObservable.add(() => {
      if (paused || ended) return;
    
      const deltaFactor = engine.getDeltaTime() / (1000 / 60);
      const stepX = vx * deltaFactor;
      const stepZ = vz * deltaFactor;
      const stepLength = Math.hypot(stepX, stepZ);
      if (stepLength === 0) return;
    
      // Paddle movement
      const paddleSpeed = 0.2 * mapSpeedMultiplier * deltaFactor;
      if (keysPressed.has(keyBindings.p2.up))   paddle2.position.z -= paddleSpeed;
      if (keysPressed.has(keyBindings.p2.down)) paddle2.position.z += paddleSpeed;
      if (keysPressed.has(keyBindings.p1.up))   paddle1.position.z -= paddleSpeed;
      if (keysPressed.has(keyBindings.p1.down)) paddle1.position.z += paddleSpeed;
      // Clamp each paddle within the top/bottom walls
      paddle1.position.z = Math.min(
        Math.max(paddle1.position.z, limits.lowerLimitZ),
        limits.upperLimitZ
      );
      paddle2.position.z = Math.min(
        Math.max(paddle2.position.z, limits.lowerLimitZ),
        limits.upperLimitZ
      );
    
      // Calculate where the ball will be after a step
      const origin = ball.position.clone();
      const dir = new Vector3(stepX, 0, stepZ).scale(1 / stepLength);
      const radius = ball.getBoundingInfo().boundingSphere.radius;
      const ray = new Ray(origin, dir, stepLength + radius);
      const bounceables: AbstractMesh[] = [paddle1, paddle2, wallTop, wallBottom,
        ...(objects.extraBounceables ?? []),
        ...(objects.shield1?.isVisible ? [objects.shield1] : []),
        ...(objects.shield2?.isVisible ? [objects.shield2] : []),];
    
      // Get picks for checking collision (coalesce null into [])
      const picks = scene.multiPickWithRay(ray, mesh => bounceables.includes(mesh)) ?? [];
    
      // No hits, just move the ball
      if (picks.length === 0) {
        ball.position = origin.add(dir.scale(stepLength));
      } else {
        // We have at least one hit, pick nearest
        picks.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
        const pick = picks[0];
    
        // If it’s really in range, bounce
        if (pick.hit && pick.distance! <= stepLength + radius) {
          const travel = Math.max(pick.distance! - radius, 0);
          ball.position = origin.add(dir.scale(travel));
    
          const N = pick.getNormal(true)!;
          const V = new Vector3(vx, 0, vz);
          const dot = Vector3.Dot(V, N);
          const R = V.subtract(N.scale(2 * dot));
    
          // --- Shield damage logic
          if (pick.pickedMesh === objects.shield1 && objects.shield1?.isVisible) {
            const st = shieldState.paddle1;
            if (st.hp > 0) {
              st.hp -= 1;
              updateShieldVisual(objects.shield1, st.hp);
              if (st.hp <= 0) {
                breakShield('paddle1');
                shieldPressed.delete('paddle1');
              }
            }
          }
          if (pick.pickedMesh === objects.shield2 && objects.shield2?.isVisible) {
            const st = shieldState.paddle2;
            if (st.hp > 0) {
              st.hp -= 1;
              updateShieldVisual(objects.shield2, st.hp);
              if (st.hp <= 0) {
                breakShield('paddle2');
                shieldPressed.delete('paddle2');
              }
            }
          }

          // Boost logic
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
          // ray hit something but not close enough, treat as no-hit
          ball.position = origin.add(dir.scale(stepLength));
        }
      }

      // Scoring
      if (ball.position.x < -objects.paddleDistance - 1.5 || ball.position.x > objects.paddleDistance + 1.5) {
        paused = true;
        acceptingInput = false;
        shieldPressed.clear();
        if (objects.shield1) objects.shield1.isVisible = false;
        if (objects.shield2) objects.shield2.isVisible = false;
        resetFireTrail();
        if (ball.position.x > objects.paddleDistance + 1.5) score2++;
        else score1++;
        updateScore(scoreBoard, score1, score2, p1Name, p2Name);
        const lastVx = vx, lastVz = vz;
        ball.isVisible = false;
        explodeBall(scene, ball, ballMaterial, lastVx, lastVz);

        // Match end logic
        if (score1 === winTarget || score2 === winTarget) {
          const winner = score1 === winTarget ? p1Name : p2Name;

          // extra guard
          ended = true;
          acceptingInput = false;
          paused = true;
          awaitingStart = false; 

          startPrompt.textContent = `${winner} wins!`;
          updateStartPrompt(startPrompt, true);

          setTimeout(() => {
            onMatchEnd?.(winner, score1, score2);
          }, 900);
        
          return;
        }

        // Prevent input until animations finish
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

    // Clean up everything after match end
    return () => {
      undoMap?.();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      scene.onBeforeRenderObservable.clear();
      try { scene.dispose(); } catch {}
      try { engine.dispose(); } catch {}
    };

  }, [canvasRef, p1Name, p2Name, isTournament, baseSpeed, winMode, winTarget, onMatchEnd, mapKey]);

  return null;
};

export default GameCanvas;
