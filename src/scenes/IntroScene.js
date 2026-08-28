import { gsap } from 'gsap';
import { uiManager } from '../ui/UIManager.js';
import { sceneManager } from '../scene/SceneManager.js';
import { cameraController } from '../scene/CameraController.js';
import { config } from '../data/config.js';
import { audioManager } from '../audio/AudioManager.js';

export class IntroScene {
  constructor(app) {
    this.app = app;
    this._petals = [];
  }

  enter() {
    // Create intro screen
    if (!document.getElementById('intro-screen')) {
      uiManager.createScreen('intro-screen', `
        <div id="intro-petals"></div>
        <div id="intro-text-container" class="intro-text-container">
          <div class="intro-text-area" id="intro-text-area"></div>
        </div>
      `);
    }
    uiManager.showScreen('intro-screen');

    // Camera: begin high and far back, zooms in during sequence
    sceneManager.camera.position.set(0, 7, 16);
    cameraController.lookAtTarget = { x: 0, y: 2.5, z: -2 };

    this._spawnPetals();
    this._playSequence();
  }

  _spawnPetals() {
    const container = document.getElementById('intro-petals');
    if (!container) return;
    container.innerHTML = '';
    this._petals = [];

    const emojis = ['🌸', '✨', '🌷', '🍃', '💮'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'intro-petal';
      p.textContent = emojis[i % emojis.length];
      const left = 5 + Math.random() * 90;
      const dur  = 8 + Math.random() * 12;
      const delay = Math.random() * 6;
      const size = 0.9 + Math.random() * 0.8;
      p.style.cssText = `
        left: ${left}%;
        bottom: -5%;
        font-size: ${size}rem;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;
      container.appendChild(p);
      this._petals.push(p);
    }
  }

  _playSequence() {
    const container = document.getElementById('intro-text-container');
    container.innerHTML = '<div class="intro-text-area" id="intro-text-area"></div>';
    const textArea = document.getElementById('intro-text-area');

    const { intro } = config;

    const t1 = this._makeText(intro.line1);
    const t2 = this._makeText(intro.line2);
    const t3 = this._makeText(intro.line3);

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.id = 'intro-start-btn';
    btn.textContent = intro.buttonText;
    btn.style.display = 'none';

    textArea.append(t1, t2, t3);
    container.appendChild(btn); // button OUTSIDE text-area, below it in column

    const tl = gsap.timeline();

    tl.to({}, { duration: 1.2 })
      .to(t1, { opacity: 1, duration: 2.2, ease: 'power2.out' })
      .to(t1, { opacity: 0, duration: 1.2, delay: 2.0, ease: 'power2.in' })
      .to(t2, { opacity: 1, duration: 2.2, ease: 'power2.out' })
      .to(t2, { opacity: 0, duration: 1.2, delay: 2.5, ease: 'power2.in' })
      .to(t3, { opacity: 1, duration: 2.0, ease: 'power2.out' })
      .call(() => {
        btn.style.display = 'inline-flex';
        gsap.to(btn, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.5
        });

        btn.addEventListener('click', () => {
          // Request fullscreen on user interaction
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(e => console.log('Fullscreen failed:', e));
          } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
          }

          audioManager.playBGM();
          audioManager.playSFX('click');

          // Button press animation
          gsap.to(btn, {
            scale: 0.93,
            duration: 0.12,
            onComplete: () => {
              gsap.to(btn, {
                scale: 1,
                duration: 0.15,
                onComplete: () => this._exit()
              });
            }
          });
        }, { once: true });
      });
  }

  _makeText(text) {
    const el = document.createElement('div');
    el.className = 'intro-text';
    el.textContent = text;
    return el;
  }

  _exit() {
    // Camera glides to fixed look-around eye position inside the room
    cameraController.moveTo(
      { x: 0, y: 3.2, z: 3.5 },   // matches orbit360.fixedPos
      { x: 0, y: 2.5, z: -3 },
      2.2
    );

    gsap.to('#intro-screen', {
      opacity: 0,
      duration: 1.5,
      delay: 0.5,
      onComplete: () => {
        uiManager.hideScreen('intro-screen');
        uiManager.showAudioButton();
        this.app.goToState('ROOM');
      }
    });
  }
}
