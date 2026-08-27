import { gsap } from 'gsap';
import { config } from '../data/config.js';
import { uiManager } from '../ui/UIManager.js';
import { cameraController } from '../scene/CameraController.js';
import { audioManager } from '../audio/AudioManager.js';

export class MemoryScene {
  constructor(app, frameObj) {
    this.app = app;
    this.object = frameObj;
    this.currentIndex = 0;
    this._touchStartX = 0;
    this._touchStartTime = 0;
  }

  enter() {
    const targetPos = {
      x: this.object.position.x,
      y: this.object.position.y + 0.4,
      z: this.object.position.z + 2.5
    };
    cameraController.moveTo(targetPos, this.object.position, 1.5, () => {
      this.currentIndex = 0;
      this._buildUI();
    });
  }

  _buildUI() {
    const id = 'memory-overlay';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); delete uiManager.screens[id]; }

    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen active';
    screen.style.cssText = `
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 100%);
      pointer-events: auto;
      overflow: hidden;
    `;

    screen.innerHTML = `
      <div class="memory-container">
        <h2 class="memory-title">${config.memoriesTitle}</h2>
        <p class="memory-subtitle">Swipe or tap to explore →</p>

        <div class="memory-card-wrapper" id="mem-card-wrapper">
          <div class="memory-card" id="mem-card">
            <!-- image injected -->
          </div>
        </div>

        <p class="memory-caption" id="mem-caption"></p>

        <div class="memory-nav">
          <button class="memory-nav-btn" id="mem-prev">←</button>
          <div class="memory-dots" id="mem-dots"></div>
          <button class="memory-nav-btn" id="mem-next">→</button>
        </div>

        <div style="margin-top: 24px; opacity:0; transition: opacity 0.5s;" id="mem-back-btn-wrap">
          <button class="btn-secondary" id="mem-back">Back to the room</button>
        </div>
      </div>
    `;

    document.getElementById('overlays-container').appendChild(screen);

    // Build dots
    this._buildDots();
    this._updateCard(false);

    // Navigation
    document.getElementById('mem-prev').onclick = () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this._updateCard(true, 'right');
        audioManager.playSFX('click');
      }
    };

    document.getElementById('mem-next').onclick = () => {
      if (this.currentIndex < config.memories.length - 1) {
        this.currentIndex++;
        this._updateCard(true, 'left');
        audioManager.playSFX('click');
      } else {
        this._showEnd();
      }
    };

    // Touch swipe support
    const wrapper = document.getElementById('mem-card-wrapper');
    wrapper.addEventListener('touchstart', e => {
      this._touchStartX = e.touches[0].clientX;
      this._touchStartTime = Date.now();
    }, { passive: true });

    wrapper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - this._touchStartX;
      const dt = Date.now() - this._touchStartTime;
      if (Math.abs(dx) > 40 && dt < 400) {
        if (dx < 0 && this.currentIndex < config.memories.length - 1) {
          this.currentIndex++;
          this._updateCard(true, 'left');
          audioManager.playSFX('click');
        } else if (dx > 0 && this.currentIndex > 0) {
          this.currentIndex--;
          this._updateCard(true, 'right');
          audioManager.playSFX('click');
        } else if (dx < 0 && this.currentIndex === config.memories.length - 1) {
          this._showEnd();
        }
      }
    }, { passive: true });

    document.getElementById('mem-back').onclick = () => {
      this._close();
    };
  }

  _buildDots() {
    const dotsEl = document.getElementById('mem-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    config.memories.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'memory-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => {
        if (i !== this.currentIndex) {
          const dir = i > this.currentIndex ? 'left' : 'right';
          this.currentIndex = i;
          this._updateCard(true, dir);
        }
      };
      dotsEl.appendChild(dot);
    });
  }

  _updateCard(animate, dir = 'left') {
    const card = document.getElementById('mem-card');
    const caption = document.getElementById('mem-caption');
    const prev = document.getElementById('mem-prev');
    const next = document.getElementById('mem-next');
    if (!card || !caption) return;

    const mem = config.memories[this.currentIndex];

    const doUpdate = () => {
      // Update image
      const img = new Image();
      img.onload = () => {
        card.innerHTML = '';
        const imgEl = document.createElement('img');
        imgEl.src = mem.image;
        imgEl.alt = mem.caption;
        card.appendChild(imgEl);
      };
      img.onerror = () => {
        card.innerHTML = `
          <div class="memory-card-placeholder">
            <div class="placeholder-icon">📸</div>
            <span>Add your photo here</span>
          </div>
        `;
      };
      img.src = mem.image;

      caption.style.opacity = '0';
      caption.textContent = mem.caption + (mem.date ? `  ·  ${mem.date}` : '');
      gsap.to(caption, { opacity: 1, duration: 0.5, delay: 0.2 });

      // Dots
      document.querySelectorAll('.memory-dot').forEach((dot, i) => {
        dot.className = 'memory-dot' + (i === this.currentIndex ? ' active' : (i < this.currentIndex ? ' visited' : ''));
      });

      // Nav buttons
      prev.classList.toggle('invisible', this.currentIndex === 0);
      const isLast = this.currentIndex === config.memories.length - 1;
      next.textContent = isLast ? 'Finish ✓' : '→';
    };

    if (animate) {
      const fromX = dir === 'left' ? 60 : -60;
      gsap.to(card, {
        opacity: 0,
        x: -fromX * 0.5,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          doUpdate();
          gsap.fromTo(card, { opacity: 0, x: fromX }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
        }
      });
    } else {
      doUpdate();
      card.style.opacity = '1';
    }
  }

  _showEnd() {
    const captionEl = document.getElementById('mem-caption');
    if (captionEl) {
      gsap.to(captionEl, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          captionEl.innerHTML = `<em>${config.memoriesEnd}</em>`;
          gsap.to(captionEl, { opacity: 1, duration: 0.6 });
        }
      });
    }

    const backWrap = document.getElementById('mem-back-btn-wrap');
    if (backWrap) backWrap.style.opacity = '1';

    const next = document.getElementById('mem-next');
    if (next) next.style.visibility = 'hidden';
  }

  _close() {
    audioManager.playSFX('click');
    const overlay = document.getElementById('memory-overlay');
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          overlay.remove();
          delete uiManager.screens['memory-overlay'];
          cameraController.reset(1.5);
          this.app.goToState('ROOM');
        }
      });
    }
  }
}
