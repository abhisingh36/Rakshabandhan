import * as THREE from 'three';
import { sceneManager } from './scene/SceneManager.js';
import { setupLighting } from './scene/Lighting.js';
import { uiManager } from './ui/UIManager.js';
import { audioManager } from './audio/AudioManager.js';
import { particleSystem } from './scene/ParticleSystem.js'; // init particles

import { createRoomEnvironment } from './objects/RoomEnvironment.js';
import {
  createTeddy,
  createPhotoFrame,
  createLetter,
  createRakhi,
  createFlowers,
  createGiftBox
} from './objects/Interactables.js';

import { IntroScene }  from './scenes/IntroScene.js';
import { RoomScene }   from './scenes/RoomScene.js';
import { TeddyScene, RakhiScene, LetterScene } from './scenes/SimpleScenes.js';
import { MemoryScene } from './scenes/MemoryScene.js';
import { QuizScene }   from './scenes/QuizScene.js';
import { GiftScene }   from './scenes/GiftScene.js';
import { FinaleScene } from './scenes/FinaleScene.js';
import { config }      from './data/config.js';

// ── Ensure asset directories exist (runtime check via config) ────────────────
// Place photos in: public/assets/images/diksha/memory1.jpg ... memory5.jpg
// Place audio in:  public/assets/audio/bgm.mp3, click.mp3, etc.

class Application {
  constructor() {
    this.state = 'LOADING';
    this.scenes = {};
    this.interactables = {};
  }

  async init() {
    try {
      // Setup 3D scene
      setupLighting();
      createRoomEnvironment();

      // ── Place interactable objects in the room ──────────────────────────
      // These positions are tuned for the new premium warm room:
      // desk is at z=-4.2, y=2.12 (desk surface)

      // Photo frame — on the back wall, left of center
      const frame = createPhotoFrame();
      frame.position.set(-1.0, 4.5, -6.8);
      frame.rotation.y = 0.06;

      // Letter — on desk surface, centre-left
      const letter = createLetter();
      letter.position.set(-1.0, 2.2, -3.2);
      letter.rotation.y = 0.1;

      // Teddy — on desk, right side
      const teddy = createTeddy();
      teddy.position.set(2.5, 2.12, -3.5);

      // Rakhi — on desk, left side
      const rakhi = createRakhi();
      rakhi.position.set(-2.8, 2.32, -3.5);
      rakhi.rotation.y = -0.15;

      // Flowers — on the desk, centre area (between letter and teddy)
      const flowers = createFlowers();
      flowers.position.set(0.8, 2.12, -3.4);
      flowers.scale.set(0.85, 0.85, 0.85);

      // Gift box — on the floor, in front-left, within view
      const gift = createGiftBox();
      gift.position.set(-2.2, 0, -0.8);
      gift.scale.set(0.85, 0.85, 0.85);
      gift.rotation.y = Math.PI / 10;

      this.interactables = { frame, letter, teddy, rakhi, flowers, gift };

      // Add to scene
      Object.values(this.interactables).forEach(obj => {
        sceneManager.scene.add(obj);
      });

      // Add subtle hover pulse indicators
      this._addPulseIndicators();

      // ── Initialize scenes ───────────────────────────────────────────────
      this.scenes = {
        'INTRO':    new IntroScene(this),
        'ROOM':     new RoomScene(this, this.interactables),
        'TEDDY':    new TeddyScene(this, teddy),
        'RAKHI':    new RakhiScene(this, rakhi),
        'LETTER':   new LetterScene(this, letter),
        'MEMORIES': new MemoryScene(this, frame),
        'QUIZ':     new QuizScene(this, flowers),
        'GIFT':     new GiftScene(this, gift),
        'FINALE':   new FinaleScene(this)
      };

      // ── Loading progress ─────────────────────────────────────────────────
      const progressFill = document.getElementById('loading-progress');
      let progress = 0;

      const loadingInterval = setInterval(() => {
        progress += Math.random() * 18;
        if (progress > 100) progress = 100;
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (progress >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => {
            uiManager.hideLoading();
            sceneManager.start();
            this.goToState('INTRO');
          }, 600);
        }
      }, 220);

    } catch (err) {
      console.error('App init error:', err);
      // Graceful fallback: still try to show intro
      uiManager.hideLoading();
      sceneManager.start();
      this.goToState('INTRO');
    }
  }

  _addPulseIndicators() {
    const indicatorMat = new THREE.MeshBasicMaterial({
      color: 0xFFE066,
      transparent: true,
      opacity: 0.8
    });

    Object.values(this.interactables).forEach(obj => {
      obj.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(obj);
      const topY = box.max.y;
      const center = new THREE.Vector3();
      box.getCenter(center);

      const indicator = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), indicatorMat.clone());
      
      indicator.position.set(
        center.x,
        topY + 0.25,
        center.z
      );

      // Frame is mounted on the wall, push indicator slightly forward
      if (obj === this.interactables.frame) {
        indicator.position.z += 0.15;
      }

      sceneManager.scene.add(indicator);

      const startY = indicator.position.y;
      sceneManager.addUpdatable({
        update: (delta, elapsed) => {
          indicator.position.y = startY + Math.sin(elapsed * 3.0) * 0.06;
          indicator.rotation.y += delta * 2.0;
          indicator.material.opacity = 0.4 + Math.sin(elapsed * 5.0) * 0.4;
        }
      });
    });
  }

  goToState(newState) {
    console.log(`→ Scene: ${newState}`);
    this.state = newState;
    if (this.scenes[newState]) {
      this.scenes[newState].enter();
    } else {
      console.error(`State "${newState}" not implemented.`);
    }
  }
}

const app = new Application();
app.init();
