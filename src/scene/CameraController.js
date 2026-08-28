import { gsap } from 'gsap';
import { sceneManager } from './SceneManager.js';

class CameraController {
  constructor() {
    this.camera = sceneManager.camera;

    // ── Default position = orbit360.fixedPos (inside room, eye level) ─────
    // Camera glides here during room entry, then orbit360 takes over.
    this.defaultPos    = { x: 0,   y: 3.2, z: 3.5 };
    this.defaultLookAt = { x: 0,   y: 2.5, z: -3 };

    this.lookAtTarget = { ...this.defaultLookAt };

    // When orbit360 is active it takes over camera control.
    // Set this flag so CameraController.update() yields.
    this.orbitActive = false;

    sceneManager.addUpdatable(this);
  }

  update() {
    // Yield to OrbitControls360 when it's running
    if (this.orbitActive) return;

    this.camera.lookAt(
      this.lookAtTarget.x,
      this.lookAtTarget.y,
      this.lookAtTarget.z
    );
  }

  moveTo(targetPos, targetLookAt, duration = 2, onComplete = null) {
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookAtTarget);

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration,
      ease: 'power2.inOut',
      onComplete
    });

    gsap.to(this.lookAtTarget, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration,
      ease: 'power2.inOut'
    });
  }

  reset(duration = 2, onComplete = null) {
    this.orbitActive = false; // ensure we control camera during reset
    this.moveTo(this.defaultPos, this.defaultLookAt, duration, onComplete);
  }
}

export const cameraController = new CameraController();
