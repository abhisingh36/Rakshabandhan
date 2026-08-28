import * as THREE from 'three';
import { sceneManager } from '../scene/SceneManager.js';
import { cameraController } from '../scene/CameraController.js';
import { orbit360 } from '../scene/OrbitControls360.js';
import { uiManager } from '../ui/UIManager.js';
import { particleSystem } from '../scene/ParticleSystem.js';
import { audioManager } from '../audio/AudioManager.js';
import { config } from '../data/config.js';

export class RoomScene {
  constructor(app, interactables) {
    this.app = app;
    this.interactables = interactables;
    this.isActive = false;
    this.hoveredObject = null;
    this._firstEnter = true;

    // Drag detection: if pointer travels more than this threshold it's a drag, not a click
    this._DRAG_THRESHOLD = 10; // pixels

    this._pointerDownPos = null;
    this._isDragging = false;

    this.onPointerMove  = this.onPointerMove.bind(this);
    this.onPointerDown  = this.onPointerDown.bind(this);
    this.onPointerUp    = this.onPointerUp.bind(this);
    this.onTouchStart   = this.onTouchStart.bind(this);
    this.onTouchEnd     = this.onTouchEnd.bind(this);
  }

  enter() {
    this.isActive = true;

    // Camera glides to room default position first
    cameraController.reset(2.0);

    // Enable 360° orbit after camera settles
    setTimeout(() => {
      orbit360.enable();
    }, 2100);

    // Show room hint on first entry
    if (this._firstEnter) {
      this._firstEnter = false;
      setTimeout(() => {
        uiManager.showRoomHint(config.roomHint || '✨ Drag to look around • Tap objects to explore');
      }, 2500);
    }

    // Event listeners
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup',   this.onPointerUp);
    window.addEventListener('touchstart',  this.onTouchStart, { passive: true });
    window.addEventListener('touchend',    this.onTouchEnd);
  }

  exit() {
    this.isActive = false;
    orbit360.disable();

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup',   this.onPointerUp);
    window.removeEventListener('touchstart',  this.onTouchStart);
    window.removeEventListener('touchend',    this.onTouchEnd);
    uiManager.hideTooltip();

    // Reset hover state
    if (this.hoveredObject) {
      this.hoveredObject.scale.copy(this.hoveredObject.userData.originalScale);
      this.hoveredObject = null;
    }
    document.body.style.cursor = 'default';
  }

  // ── Pointer (mouse + pen) ──────────────────────────────────────────────────

  onPointerDown(event) {
    if (!this.isActive || event.pointerType === 'touch') return;
    this._pointerDownPos = { x: event.clientX, y: event.clientY };
    this._isDragging = false;
  }

  onPointerMove(event) {
    if (!this.isActive || event.pointerType === 'touch') return;

    // Track whether it became a drag
    if (this._pointerDownPos) {
      const dx = Math.abs(event.clientX - this._pointerDownPos.x);
      const dy = Math.abs(event.clientY - this._pointerDownPos.y);
      if (dx > this._DRAG_THRESHOLD || dy > this._DRAG_THRESHOLD) {
        this._isDragging = true;
      }
    }

    // Only show hover highlight when not dragging
    if (!this._isDragging) {
      this._updateHover(event);
    }
  }

  onPointerUp(event) {
    if (!this.isActive || event.pointerType === 'touch') return;

    if (!this._isDragging) {
      // It was a genuine click — fire interaction
      this._fireClick();
    }

    this._pointerDownPos = null;
    this._isDragging = false;
  }

  // ── Touch ──────────────────────────────────────────────────────────────────

  onTouchStart(event) {
    if (!this.isActive || !event.touches.length) return;
    this._touchStartPos = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    this._updateHover(event);
  }

  onTouchEnd(event) {
    if (!this.isActive) return;
    if (!this._touchStartPos || !event.changedTouches.length) return;

    const dx = Math.abs(event.changedTouches[0].clientX - this._touchStartPos.x);
    const dy = Math.abs(event.changedTouches[0].clientY - this._touchStartPos.y);

    // Tap (not swipe) → fire click
    if (dx < this._DRAG_THRESHOLD && dy < this._DRAG_THRESHOLD) {
      this._updateHover(event);
      this._fireClick();
    }
    this._touchStartPos = null;
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  _updateHover(event) {
    const interactableList = Object.values(this.interactables);
    const intersected = sceneManager.getIntersectedObject(event, interactableList);

    if (intersected) {
      if (this.hoveredObject !== intersected) {
        if (this.hoveredObject) {
          this.hoveredObject.scale.copy(this.hoveredObject.userData.originalScale);
        }
        this.hoveredObject = intersected;
        const s = this.hoveredObject.userData.originalScale;
        this.hoveredObject.scale.set(s.x * 1.08, s.y * 1.08, s.z * 1.08);
        document.body.style.cursor = 'pointer';
        uiManager.showTooltip(this.hoveredObject.userData.hoverText);
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.scale.copy(this.hoveredObject.userData.originalScale);
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
        uiManager.hideTooltip();
      }
    }
  }

  _fireClick() {
    if (!this.hoveredObject) return;

    const id = this.hoveredObject.userData.id;
    audioManager.playSFX('click');
    particleSystem.burst(this.hoveredObject.position, 0xD4A76A, 30);

    this.exit(); // disable room interactions while in sub-scene

    switch (id) {
      case 'teddy':    this.app.goToState('TEDDY');    break;
      case 'frame':    this.app.goToState('MEMORIES'); break;
      case 'letter':   this.app.goToState('LETTER');   break;
      case 'rakhi':    this.app.goToState('RAKHI');    break;
      case 'flowers':  this.app.goToState('QUIZ');     break;
      case 'gift':     this.app.goToState('GIFT');     break;
      default: console.warn('Unknown interactable:', id);
    }
  }
}
