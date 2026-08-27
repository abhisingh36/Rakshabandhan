import { config } from '../data/config.js';
import { audioManager } from '../audio/AudioManager.js';
import { gsap } from 'gsap';

class UIManager {
  constructor() {
    this.overlaysContainer = document.getElementById('overlays-container');
    this.screens = {};
    this._activeModal = null;

    // Audio button
    this.audioBtn = document.getElementById('audio-toggle');
    this.iconUnmuted = document.getElementById('icon-unmuted');
    this.iconMuted   = document.getElementById('icon-muted');

    this.audioBtn.addEventListener('click', () => {
      const muted = audioManager.toggleMute();
      this.iconUnmuted.classList.toggle('hidden', muted);
      this.iconMuted.classList.toggle('hidden', !muted);
    });
  }

  // ── Screens ────────────────────────────────────────────────────────────────
  hideLoading() {
    const el = document.getElementById('loading-screen');
    if (el) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => el.classList.remove('active')
      });
    }
  }

  showAudioButton() {
    if (this.audioBtn) this.audioBtn.classList.remove('hidden');
  }

  createScreen(id, htmlContent) {
    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen';
    screen.innerHTML = htmlContent;
    this.overlaysContainer.appendChild(screen);
    this.screens[id] = screen;
    return screen;
  }

  showScreen(id) {
    // Deactivate all
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    if (this.screens[id]) this.screens[id].classList.add('active');
  }

  hideScreen(id) {
    if (this.screens[id]) this.screens[id].classList.remove('active');
  }

  hideAll() {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
  }

  // ── Tooltip ────────────────────────────────────────────────────────────────
  showTooltip(text) {
    let tooltip = document.getElementById('interaction-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'interaction-tooltip';
      this.overlaysContainer.appendChild(tooltip);
    }
    tooltip.textContent = text;
    tooltip.classList.add('show');
  }

  hideTooltip() {
    const tooltip = document.getElementById('interaction-tooltip');
    if (tooltip) tooltip.classList.remove('show');
  }

  // ── Room Hint ──────────────────────────────────────────────────────────────
  showRoomHint(text) {
    let hint = document.getElementById('room-hint-el');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'room-hint-el';
      hint.className = 'room-hint';
      this.overlaysContainer.appendChild(hint);
    }
    hint.textContent = text;
    // auto-animates via CSS keyframe
  }

  // ── Warm Modal (primary modal style) ──────────────────────────────────────
  /**
   * @param {string} text - The main content
   * @param {string|null} btnLabel - If null, no button is shown (auto-dismiss by scene)
   * @param {Function|null} onAction - Called when button is tapped
   * @param {boolean} showCloseX - Show × close button
   */
  showWarmModal(text, btnLabel = null, onAction = null, showCloseX = true) {
    // Remove existing modal
    const existingId = 'warm-modal-overlay';
    const existing = document.getElementById(existingId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = existingId;
    overlay.className = 'screen active';
    overlay.style.cssText = `background: rgba(253, 248, 240, 0.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: auto;`;

    const btnHtml = btnLabel
      ? `<button class="btn-primary" id="warm-modal-action-btn" style="opacity:1; transform:none; margin-top: 8px;">${btnLabel}</button>`
      : '';

    const closeHtml = showCloseX
      ? `<button class="close-btn" id="warm-modal-close">×</button>`
      : '';

    overlay.innerHTML = `
      <div class="warm-modal" id="warm-modal-card">
        ${closeHtml}
        <p style="font-size: 1.1rem; line-height: 1.75; color: var(--charcoal-lt); white-space: pre-line; margin-bottom: ${btnLabel ? '20px' : '0'};">
          ${text}
        </p>
        <div style="display: flex; justify-content: center;">${btnHtml}</div>
      </div>
    `;

    this.overlaysContainer.appendChild(overlay);
    this._activeModal = overlay;

    setTimeout(() => document.getElementById('warm-modal-card')?.classList.add('show'), 50);

    if (showCloseX) {
      document.getElementById('warm-modal-close')?.addEventListener('click', () => {
        audioManager.playSFX('click');
        this.closeModal(onAction);
      });
    }

    document.getElementById('warm-modal-action-btn')?.addEventListener('click', () => {
      audioManager.playSFX('click');
      this.closeModal(onAction);
    });
  }

  closeModal(callback = null) {
    const modal = document.getElementById('warm-modal-card');
    if (modal) {
      gsap.to(modal, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          const overlay = document.getElementById('warm-modal-overlay');
          if (overlay) overlay.remove();
          this._activeModal = null;
          if (callback) callback();
        }
      });
    } else {
      const overlay = document.getElementById('warm-modal-overlay');
      if (overlay) overlay.remove();
      this._activeModal = null;
      if (callback) callback();
    }
  }

  // Legacy showModal kept for compatibility
  showModal(text, onClose) {
    this.showWarmModal(text, 'Got it ✓', onClose, false);
  }
}

export const uiManager = new UIManager();
