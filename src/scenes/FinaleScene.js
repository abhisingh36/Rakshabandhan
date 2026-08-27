import { gsap } from 'gsap';
import { uiManager } from '../ui/UIManager.js';
import { config } from '../data/config.js';
import { createRakhi } from '../objects/Interactables.js';
import { sceneManager } from '../scene/SceneManager.js';
import { cameraController } from '../scene/CameraController.js';
import { particleSystem } from '../scene/ParticleSystem.js';
import { audioManager } from '../audio/AudioManager.js';

export class FinaleScene {
  constructor(app) {
    this.app = app;
    this._finalRakhi = null;
    this._screenEl = null;
  }

  enter() {
    // Move camera to a clean, high, centred position — will look at the rakhi
    cameraController.moveTo(
      { x: 0, y: 4, z: 8 },
      { x: 0, y: 3.5, z: 0 },
      2.0,
      () => this._buildScreen()
    );
  }

  _buildScreen() {
    // Fade in a warm overlay that covers the 3D scene
    const id = 'finale-screen';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); delete uiManager.screens[id]; }

    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen';
    screen.style.cssText = `
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 60%, #EDD8A0 100%);
      pointer-events: auto;
    `;
    screen.innerHTML = `
      <div id="finale-msg" class="finale-message"></div>
      <div id="finale-end" class="finale-credits" style="display:none;"></div>
    `;

    document.getElementById('overlays-container').appendChild(screen);
    this._screenEl = screen;

    // Fade in the overlay, then show final scene directly (no text wall)
    screen.classList.add('active');
    setTimeout(() => this._showFinalScene(), 800);
  }

  _playMessages() {
    const msgEl = document.getElementById('finale-msg');
    const messages = config.finale.messages;
    const tl = gsap.timeline({ onComplete: () => this._showFinalScene() });

    tl.to({}, { duration: 0.5 });

    messages.forEach((msg) => {
      tl.call(() => {
        msgEl.style.opacity = '0';
        msgEl.innerHTML = msg.replace(/\n/g, '<br>');
      })
        .to(msgEl, { opacity: 1, duration: 1.8, ease: 'power2.out' })
        .to(msgEl, { opacity: 0, duration: 1.2, delay: 2.8, ease: 'power2.in' });
    });
  }

  _showFinalScene() {
    const msgEl = document.getElementById('finale-msg');
    if (msgEl) gsap.set(msgEl, { display: 'none' });

    // Spawn the Finale Rakhi in 3D scene
    this._finalRakhi = createRakhi();
    this._finalRakhi.position.set(0, 4, 0);
    this._finalRakhi.scale.set(2.5, 2.5, 2.5);
    sceneManager.scene.add(this._finalRakhi);

    // Camera focus on the finale Rakhi
    cameraController.moveTo(
      { x: 0, y: 4.5, z: 5 },
      { x: 0, y: 4, z: 0 },
      1.5
    );

    // Gentle continuous rotation
    gsap.to(this._finalRakhi.rotation, {
      z: '+=' + Math.PI * 2,
      duration: 12,
      repeat: -1,
      ease: 'none'
    });

    // Petals around Rakhi
    particleSystem.petalFloat({ x: 0, y: 4, z: 0 }, 50);
    setTimeout(() => particleSystem.burst({ x: 0, y: 4, z: 0 }, 0xD4A76A, 60), 500);

    // Show credits
    const endEl = document.getElementById('finale-end');
    if (endEl) {
      endEl.style.display = 'block';
      endEl.innerHTML = `
        <p class="finale-credits-main">${config.finale.endTitle}</p>
        <p class="finale-credits-sub">${config.finale.endSubtitle.replace(/\n/g, '<br>')}</p>
        <button class="btn-primary" id="replay-btn" style="opacity: 1; transform: none; pointer-events: auto;">
          Kamre mein wapas jaao 🏠
        </button>
      `;
      gsap.to(endEl, { opacity: 1, duration: 1.5, delay: 0.5 });

      document.getElementById('replay-btn').onclick = () => {
        // Remove the finale 3D rakhi from scene
        if (this._finalRakhi) {
          sceneManager.scene.remove(this._finalRakhi);
          this._finalRakhi = null;
        }
        // Fade out and remove the finale screen
        gsap.to(this._screenEl, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => {
            const el = document.getElementById('finale-screen');
            if (el) el.remove();
            // Reset camera back to room default
            cameraController.reset(1.5);
            this.app.goToState('ROOM');
          }
        });
      };
    }
  }
}
