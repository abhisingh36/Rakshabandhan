import * as THREE from 'three';
import { sceneManager } from '../scene/SceneManager.js';
import { cameraController } from '../scene/CameraController.js';
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

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onClick       = this.onClick.bind(this);
    this.onTouchStart  = this.onTouchStart.bind(this);
    this.onTouchEnd    = this.onTouchEnd.bind(this);

    this._touchStartPos = null;
  }

  enter() {
    this.isActive = true;

    // Camera glides to room default position
    cameraController.reset(2.0);

    // Show room hint on first entry
    if (this._firstEnter) {
      this._firstEnter = false;
      setTimeout(() => {
        uiManager.showRoomHint(config.roomHint);
      }, 2500);
    }

    // Event listeners
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click',       this.onClick);
    window.addEventListener('touchstart',  this.onTouchStart, { passive: true });
    window.addEventListener('touchend',    this.onTouchEnd);
  }

  exit() {
    this.isActive = false;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click',       this.onClick);
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

  onTouchStart(event) {
    if (!this.isActive || !event.touches.length) return;
    this._touchStartPos = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
    // Also update hover from touch position
    this._updateHover(event);
  }

  onTouchEnd(event) {
    if (!this.isActive) return;
    if (!this._touchStartPos || !event.changedTouches.length) return;

    const dx = Math.abs(event.changedTouches[0].clientX - this._touchStartPos.x);
    const dy = Math.abs(event.changedTouches[0].clientY - this._touchStartPos.y);

    // Only fire click if it was a tap (not a swipe)
    if (dx < 12 && dy < 12) {
      this._updateHover(event);
      this._fireClick();
    }
    this._touchStartPos = null;
  }

  onPointerMove(event) {
    if (!this.isActive || event.pointerType === 'touch') return;
    this._updateHover(event);
  }

  onClick(event) {
    if (!this.isActive || event.type === 'click' && event.pointerType === 'touch') return;
    this._fireClick();
  }

  _updateHover(event) {
    const interactableList = Object.values(this.interactables);
    const intersected = sceneManager.getIntersectedObject(event, interactableList);

    if (intersected) {
      if (this.hoveredObject !== intersected) {
        // Reset previous
        if (this.hoveredObject) {
          this.hoveredObject.scale.copy(this.hoveredObject.userData.originalScale);
        }
        this.hoveredObject = intersected;
        // Subtle scale up on hover
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
