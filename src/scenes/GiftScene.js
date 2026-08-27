import { gsap } from 'gsap';
import { uiManager } from '../ui/UIManager.js';
import { cameraController } from '../scene/CameraController.js';
import { config } from '../data/config.js';
import { particleSystem } from '../scene/ParticleSystem.js';
import { audioManager } from '../audio/AudioManager.js';

export class GiftScene {
  constructor(app, giftObj) {
    this.app = app;
    this.object = giftObj;
    this._originalPos = null;
  }

  enter() {
    this._originalPos = this.object.position.clone();

    cameraController.moveTo(
      {
        x: this.object.position.x,
        y: this.object.position.y + 1.0,
        z: this.object.position.z + 2.8
      },
      this.object.position,
      2.0,
      () => this._showGiftSequence()
    );
  }

  _showGiftSequence() {
    const { gift } = config;

    // Create overlay
    const id = 'gift-overlay';
    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen active';
    screen.style.cssText = `
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 70%, #EDD8A0 100%);
      pointer-events: auto;
    `;
    screen.innerHTML = `
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 14%; pointer-events: none;">
        <div id="gift-text" class="gift-big-text"></div>
      </div>
      <div style="position: absolute; bottom: 7%; width: 100%; display: flex; justify-content: center; pointer-events: auto; opacity: 0;" id="gift-tap-hint">
        <p style="font-family: var(--font-serif); font-style: italic; font-size: 1.1rem; color: var(--charcoal-muted); animation: softPulse 2s ease-in-out infinite;">
          ${gift.tapHint} 🎁
        </p>
      </div>
    `;
    document.getElementById('overlays-container').appendChild(screen);

    const textEl = document.getElementById('gift-text');
    const tapHint = document.getElementById('gift-tap-hint');
    const lines = [gift.line1, gift.line2, gift.line3];

    const tl = gsap.timeline();
    tl.to({}, { duration: 0.5 });

    lines.forEach((line, i) => {
      tl.call(() => {
        textEl.style.opacity = '0';
        textEl.textContent = line;
      })
        .to(textEl, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' })
        .to(textEl, { opacity: 0, duration: 0.7, delay: i < lines.length - 1 ? 1.5 : 0.5 });
    });

    tl.call(() => {
      gsap.to(tapHint, { opacity: 1, duration: 0.8 });
      screen.style.pointerEvents = 'auto';
      screen.onclick = () => {
        screen.onclick = null;
        audioManager.playSFX('click');
        gsap.to([tapHint, textEl], { opacity: 0, duration: 0.4 });
        this._openGift(screen);
      };
    });
  }

  _openGift(screen) {
    const pos = this.object.position;
    audioManager.playSFX('open');

    // 1. Shake the box
    const shakeX = { val: pos.x };
    gsap.to(shakeX, {
      val: pos.x + 0.12,
      duration: 0.07,
      yoyo: true,
      repeat: 9,
      ease: 'none',
      onUpdate: () => { this.object.position.x = shakeX.val; },
      onComplete: () => { this.object.position.x = pos.x; }
    });

    // 2. After shake: lid flies up
    setTimeout(() => {
      const lid = this.object.children[1]; // lid mesh
      if (lid) {
        gsap.to(lid.position, {
          y: lid.position.y + 3.0,
          duration: 0.8,
          ease: 'power3.out'
        });
        gsap.to(lid.rotation, {
          x: -Math.PI / 3,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      // Lift whole box slightly
      gsap.to(this.object.position, {
        y: pos.y + 0.4,
        duration: 1.2,
        ease: 'power2.out'
      });

      // 3. Warm light burst from box
      setTimeout(() => {
        audioManager.playSFX('sparkle');

        // Multi-color burst
        particleSystem.burst(
          { x: pos.x, y: pos.y + 1.2, z: pos.z },
          0xFFE8C0, 80
        );
        setTimeout(() => particleSystem.burst(
          { x: pos.x, y: pos.y + 1.2, z: pos.z }, 0xD4A76A, 60
        ), 150);
        setTimeout(() => particleSystem.burst(
          { x: pos.x, y: pos.y + 1.2, z: pos.z }, 0xF5C5A3, 50
        ), 300);
        setTimeout(() => particleSystem.petalFloat(
          { x: pos.x, y: pos.y + 1.0, z: pos.z }
        ), 200);

        // Camera zoom in slightly
        cameraController.moveTo(
          { x: pos.x, y: pos.y + 1.5, z: pos.z + 2.2 },
          { x: pos.x, y: pos.y + 1.2, z: pos.z },
          1.2
        );

        // Box shrinks away
        gsap.to(this.object.scale, {
          x: 0, y: 0, z: 0,
          duration: 0.8,
          delay: 0.6,
          ease: 'back.in(1.7)'
        });

        // Transition to book reveal, THEN finale
        setTimeout(() => {
          if (screen) {
            const el = document.getElementById('gift-overlay');
            if (el) el.remove();
            delete uiManager.screens['gift-overlay'];
          }
          this._showBookReveal();
        }, 2500);

      }, 900);
    }, 800);
  }

  _showBookReveal() {
    const revealId = 'gift-reveal-overlay';

    const el = document.createElement('div');
    el.id = revealId;
    el.className = 'screen active';
    el.style.cssText = `
      position: absolute; inset: 0;
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 60%, #EDD8A0 100%);
      pointer-events: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 48px 24px 48px;
      box-sizing: border-box;
      opacity: 0;
    `;

    el.innerHTML = `
      <div id="book-reveal-card" style="
        width: 100%; max-width: 400px; display: flex; flex-direction: column;
        align-items: center; gap: 24px; opacity: 0; transform: translateY(32px);
      ">
        <!-- Top label -->
        <p style="
          font-family: var(--font-serif); font-style: italic;
          font-size: 1rem; color: var(--charcoal-muted); text-align: center;
          margin: 0;
        ">Tera Raksha Bandhan gift... 🎁</p>

        <!-- Book photo -->
        <div style="
          width: 100%; border-radius: 18px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(120,80,30,0.18), 0 4px 12px rgba(0,0,0,0.08);
          transform: rotate(-1.5deg);
        ">
          <div class="gift-photo-container">
            <img class="gift-photo" 
            src="./assets/images/diksha/gift.jpg" 
            alt="Gift Surprise" 
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="photo-placeholder hidden">
              <span>🎁</span>
            </div>
          </div>
        </div>

        <!-- Book name -->
        <div style="text-align: center;">
          <p style="
            font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600;
            color: var(--charcoal); margin: 0 0 6px; letter-spacing: 0.03em;
          ">YOU CAN</p>
          <p style="
            font-family: var(--font-sans); font-size: 0.85rem;
            color: var(--charcoal-muted); margin: 0;
          ">by George Matthew Adams</p>
        </div>

        <!-- Personal message -->
        <div style="
          background: rgba(255,255,255,0.75); border-radius: 16px;
          padding: 20px 24px; border: 1px solid rgba(212,167,106,0.25);
          backdrop-filter: blur(10px); text-align: center;
          box-shadow: 0 4px 20px rgba(160,120,60,0.08);
        ">
          <p style="
            font-family: var(--font-sans); font-size: 0.97rem;
            line-height: 1.8; color: var(--charcoal-lt); margin: 0;
          ">
            Ye book tumhare liye hai, Diksha. 📖<br><br>
            Kyunki main chahta hoon ki tum jano —<br>
            jo bhi karna chahti ho zindagi mein,<br>
            <strong>tum kar sakti ho.</strong><br><br>
            Seriously. You can. 🌸
          </p>
        </div>

        <!-- Continue button -->
        <button class="btn-primary" id="book-continue-btn" style="opacity:1; transform:none; margin-top: 8px;">
          Aage chalte hain ✨
        </button>
      </div>
    `;

    document.getElementById('overlays-container').appendChild(el);

    // Animate in
    gsap.to(el, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    setTimeout(() => {
      const card = document.getElementById('book-reveal-card');
      if (card) {
        gsap.to(card, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
        });
      }
    }, 200);

    // Button click → ROOM
    document.getElementById('book-continue-btn').onclick = () => {
      audioManager.playSFX('click');
      gsap.to(el, {
        opacity: 0, duration: 0.5, onComplete: () => {
          el.remove();
          cameraController.reset(1.5);
          this.app.goToState('ROOM');
        }
      });
    };
  }
}
