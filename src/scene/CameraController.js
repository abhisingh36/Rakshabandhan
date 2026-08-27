import { gsap } from 'gsap';
import { sceneManager } from './SceneManager.js';

class CameraController {
  constructor() {
    this.camera = sceneManager.camera;

    // ── Default room overview position ───────────────────────────────────
    // Camera is further back (z=12) and higher (y=3.8) to compensate for
    // portrait mobile's narrow horizontal FOV. With 65° VFOV this gives
    // enough horizontal coverage to see all desk objects + gift on floor.
    this.defaultPos    = { x: 0.5, y: 3.8, z: 12 };
    this.defaultLookAt = { x: 0,   y: 2.2, z: -2 };

    this.lookAtTarget = { ...this.defaultLookAt };

    sceneManager.addUpdatable(this);
  }

  update() {
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
    this.moveTo(this.defaultPos, this.defaultLookAt, duration, onComplete);
  }
}

export const cameraController = new CameraController();
