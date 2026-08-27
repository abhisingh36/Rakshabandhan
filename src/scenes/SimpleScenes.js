import { gsap } from 'gsap';
import { uiManager } from '../ui/UIManager.js';
import { cameraController } from '../scene/CameraController.js';
import { config } from '../data/config.js';
import { audioManager } from '../audio/AudioManager.js';
import { particleSystem } from '../scene/ParticleSystem.js';

// ─────────────────────────────────────────────────────────────────
// TEDDY SCENE
// ─────────────────────────────────────────────────────────────────
export class TeddyScene {
  constructor(app, teddyObj) {
    this.app = app;
    this.object = teddyObj;
  }

  enter() {
    const { teddy } = config;

    // Bounce animation
    const origY = this.object.position.y;
    gsap.to(this.object.position, {
      y: origY + 0.3,
      duration: 0.25,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3,
      onComplete: () => { this.object.position.y = origY; }
    });

    // Head tilt (wobble rotation)
    gsap.to(this.object.rotation, {
      z: 0.2,
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 5
    });

    // Camera move
    cameraController.moveTo(
      { x: this.object.position.x, y: this.object.position.y + 0.5, z: this.object.position.z + 2.5 },
      this.object.position,
      1.5,
      () => {
        // Two-step message
        uiManager.showWarmModal(teddy.message1, null, null, false);

        setTimeout(() => {
          uiManager.closeModal(() => {
            uiManager.showWarmModal(
              teddy.message2,
              'Back to the room',
              () => {
                cameraController.reset(1.5);
                this.app.goToState('ROOM');
              }
            );
          });
        }, 2200);
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// RAKHI SCENE
// ─────────────────────────────────────────────────────────────────
export class RakhiScene {
  constructor(app, rakhiObj) {
    this.app = app;
    this.object = rakhiObj;
    this._spinTween = null;
  }

  enter() {
    const { rakhi } = config;

    // Start gentle spin
    this._spinTween = gsap.to(this.object.rotation, {
      z: '+=' + Math.PI * 2,
      duration: 6,
      repeat: -1,
      ease: 'none'
    });

    // Petal float burst
    particleSystem.petalFloat(this.object.position);

    cameraController.moveTo(
      { x: this.object.position.x, y: this.object.position.y + 0.3, z: this.object.position.z + 2.8 },
      this.object.position,
      1.5,
      () => {
        // 3-message sequence
        uiManager.showWarmModal(rakhi.message1, null, null, false);

        setTimeout(() => {
          uiManager.closeModal(() => {
            uiManager.showWarmModal(rakhi.message2, null, null, false);
            setTimeout(() => {
              uiManager.closeModal(() => {
                uiManager.showWarmModal(
                  rakhi.message3,
                  'Back to the room',
                  () => {
                    if (this._spinTween) this._spinTween.kill();
                    cameraController.reset(1.5);
                    this.app.goToState('ROOM');
                  }
                );
              });
            }, 2800);
          });
        }, 2500);
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// LETTER SCENE — envelope open + beautiful handwritten note
// ─────────────────────────────────────────────────────────────────
export class LetterScene {
  constructor(app, letterObj) {
    this.app = app;
    this.object = letterObj;
  }

  enter() {
    const { letter } = config;

    // Envelope lid opening animation
    gsap.to(this.object.children[1].rotation, {
      x: -Math.PI,
      duration: 0.8,
      ease: 'power2.inOut'
    });

    cameraController.moveTo(
      { x: this.object.position.x, y: this.object.position.y + 0.6, z: this.object.position.z + 2.0 },
      this.object.position,
      1.5,
      () => {
        this._showLetter(letter);
      }
    );
  }

  _showLetter(letter) {
    const screenId = 'letter-overlay';
    if (document.getElementById(screenId)) {
      const el = document.getElementById(screenId);
      el.remove();
      delete uiManager.screens[screenId];
    }

    const html = `
      <div class="letter-screen screen active" id="${screenId}">
        <div class="letter-container" id="letter-card">
          <div class="letter-seal">💌</div>
          <span class="letter-to">${letter.salutation}</span>
          <div class="letter-divider"></div>
          <div class="letter-content">${letter.content.replace(/\n/g, '<br>')}</div>
          <div class="letter-divider"></div>
          <span class="letter-signature">${letter.signature}</span>
          <div style="margin-top: 28px; display: flex; justify-content: center;">
            <button class="btn-primary" id="letter-close-btn" style="opacity:1; transform:none;">
              Back to the room
            </button>
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.getElementById('overlays-container').appendChild(wrapper.firstElementChild);

    // Animate card in
    setTimeout(() => {
      document.getElementById('letter-card').classList.add('show');
    }, 60);

    document.getElementById('letter-close-btn').onclick = () => {
      audioManager.playSFX('click');
      const card = document.getElementById('letter-card');
      gsap.to(card, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        onComplete: () => {
          const el = document.getElementById('letter-overlay');
          if (el) el.remove();
          delete uiManager.screens['letter-overlay'];
          cameraController.reset(1.5);
          this.app.goToState('ROOM');
        }
      });
    };
  }
}
