/**
 * LookAround360
 * ─────────────────────────────────────────────────────────────────────────────
 * Camera stays FIXED at room centre and rotates on its own axes —
 * exactly like a person standing in the middle of the room and looking around.
 *
 * • No position drift — camera never leaves its fixed spot
 * • Full 360° horizontal yaw
 * • Pitch clamped so you don't look straight up/down
 * • Smooth exponential damping on all axes
 */

import * as THREE from 'three';
import { sceneManager } from './SceneManager.js';
import { cameraController } from './CameraController.js';

class OrbitControls360 {
  constructor() {
    this.camera  = sceneManager.camera;
    this.enabled = false;

    // ── Fixed eye position (centre of room, eye level) ───────────────────────
    // Camera NEVER moves from this point — it only rotates.
    this.fixedPos = new THREE.Vector3(0, 3.2, 3.5);

    // ── Look angles ──────────────────────────────────────────────────────────
    // yaw=0 → looking toward -Z (back wall / desk)
    // yaw=π → looking toward +Z (front wall / bed)
    this.yaw   = 0;
    this.pitch = -0.10; // slight downward tilt (natural eye level)

    this._targetYaw   = this.yaw;
    this._targetPitch = this.pitch;

    // ── Pitch limits ─────────────────────────────────────────────────────────
    this.minPitch = -0.55;   // don't look straight down at floor
    this.maxPitch =  0.42;   // don't look straight up at ceiling

    // ── Damping & speed ──────────────────────────────────────────────────────
    this.dampingFactor = 0.07;  // lower = more inertia / cinematic feel
    this.rotateSpeed   = 0.005; // drag pixels → angle radians

    // ── Drag state ───────────────────────────────────────────────────────────
    this._isDragging    = false;
    this._lastX         = 0;
    this._lastY         = 0;
    this._lastPinchDist = null;

    // Bind
    this._onMouseDown  = this._onMouseDown.bind(this);
    this._onMouseMove  = this._onMouseMove.bind(this);
    this._onMouseUp    = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove  = this._onTouchMove.bind(this);
    this._onTouchEnd   = this._onTouchEnd.bind(this);

    sceneManager.addUpdatable(this);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    cameraController.orbitActive = true;

    window.addEventListener('mousedown',  this._onMouseDown);
    window.addEventListener('mousemove',  this._onMouseMove);
    window.addEventListener('mouseup',    this._onMouseUp);
    window.addEventListener('touchstart', this._onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  this._onTouchMove,  { passive: false });
    window.addEventListener('touchend',   this._onTouchEnd);

    // Immediately snap camera to fixed position so it
    // doesn't jump on the first update frame.
    this.camera.position.copy(this.fixedPos);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    cameraController.orbitActive = false;

    window.removeEventListener('mousedown',  this._onMouseDown);
    window.removeEventListener('mousemove',  this._onMouseMove);
    window.removeEventListener('mouseup',    this._onMouseUp);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove',  this._onTouchMove);
    window.removeEventListener('touchend',   this._onTouchEnd);
  }

  // ── Mouse ───────────────────────────────────────────────────────────────────

  _onMouseDown(e) {
    if (!this.enabled || e.button !== 0) return;
    this._isDragging = true;
    this._lastX = e.clientX;
    this._lastY = e.clientY;
  }

  _onMouseMove(e) {
    if (!this.enabled || !this._isDragging) return;
    const dx = e.clientX - this._lastX;
    const dy = e.clientY - this._lastY;
    this._lastX = e.clientX;
    this._lastY = e.clientY;
    this._applyDrag(dx, dy);
  }

  _onMouseUp() { this._isDragging = false; }

  // ── Touch ───────────────────────────────────────────────────────────────────

  _onTouchStart(e) {
    if (!this.enabled) return;
    if (e.touches.length === 1) {
      this._isDragging    = true;
      this._lastX         = e.touches[0].clientX;
      this._lastY         = e.touches[0].clientY;
      this._lastPinchDist = null;
    } else if (e.touches.length === 2) {
      this._isDragging    = false;
      this._lastPinchDist = this._pinchDist(e.touches);
    }
  }

  _onTouchMove(e) {
    if (!this.enabled) return;
    if (e.touches.length === 1 && this._isDragging) {
      const dx = e.touches[0].clientX - this._lastX;
      const dy = e.touches[0].clientY - this._lastY;
      this._lastX = e.touches[0].clientX;
      this._lastY = e.touches[0].clientY;
      this._applyDrag(dx, dy);
    }
  }

  _onTouchEnd(e) {
    if (e.touches.length === 0) {
      this._isDragging    = false;
      this._lastPinchDist = null;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _pinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _applyDrag(dx, dy) {
    // Horizontal drag → yaw (unrestricted 360°)
    this._targetYaw -= dx * this.rotateSpeed;

    // Vertical drag → pitch (clamped)
    this._targetPitch = THREE.MathUtils.clamp(
      this._targetPitch - dy * this.rotateSpeed * 0.65,
      this.minPitch,
      this.maxPitch
    );
  }

  // ── Per-frame update ────────────────────────────────────────────────────────

  update(delta) {
    if (!this.enabled) return;

    // Smooth lerp toward targets
    const k = 1 - Math.pow(this.dampingFactor, delta * 60);
    this.yaw   += (this._targetYaw   - this.yaw)   * k;
    this.pitch += (this._targetPitch - this.pitch)  * k;

    // Hard clamp pitch
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);

    // Fix camera position — never moves
    this.camera.position.copy(this.fixedPos);

    // Compute look-at point 10 units ahead in the look direction
    const DIST = 10;
    const lookAt = new THREE.Vector3(
      this.fixedPos.x + Math.sin(this.yaw)  * Math.cos(this.pitch) * DIST,
      this.fixedPos.y + Math.sin(this.pitch) * DIST,
      this.fixedPos.z - Math.cos(this.yaw)  * Math.cos(this.pitch) * DIST
    );
    this.camera.lookAt(lookAt);
  }
}

export const orbit360 = new OrbitControls360();
