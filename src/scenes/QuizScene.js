import { gsap } from 'gsap';
import { config } from '../data/config.js';
import { uiManager } from '../ui/UIManager.js';
import { cameraController } from '../scene/CameraController.js';
import { audioManager } from '../audio/AudioManager.js';
import { particleSystem } from '../scene/ParticleSystem.js';

export class QuizScene {
  constructor(app, flowersObj) {
    this.app = app;
    this.object = flowersObj;
    this.currentQ = 0;
    this.score = 0;
  }

  enter() {
    this.currentQ = 0;
    this.score = 0;

    cameraController.moveTo(
      {
        x: this.object.position.x,
        y: this.object.position.y + 0.8,
        z: this.object.position.z + 2.5
      },
      this.object.position,
      1.5,
      () => this._showIntro()
    );
  }

  _showIntro() {
    const { flowers } = config;
    // Two-step intro message
    uiManager.showWarmModal(flowers.message1, null, null, false);
    setTimeout(() => {
      uiManager.closeModal(() => {
        uiManager.showWarmModal(
          flowers.message2,
          flowers.buttonText,
          () => this._renderQuestion(),
          true
        );
      });
    }, 2000);
  }

  _renderQuestion() {
    const id = 'quiz-overlay';
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); delete uiManager.screens[id]; }

    const qData = config.quiz[this.currentQ];
    const total = config.quiz.length;

    // Build dots HTML
    let dotsHtml = '';
    for (let i = 0; i < total; i++) {
      const cls = i < this.currentQ ? 'quiz-dot done' : (i === this.currentQ ? 'quiz-dot active' : 'quiz-dot');
      dotsHtml += `<div class="${cls}"></div>`;
    }

    // Build options HTML
    let optionsHtml = '';
    qData.options.forEach((opt, idx) => {
      optionsHtml += `<button class="quiz-option-btn" data-index="${idx}">${opt}</button>`;
    });

    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen active';
    screen.style.cssText = `
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 100%);
      pointer-events: auto;
    `;
    screen.innerHTML = `
      <div class="warm-modal show" style="width: 92%; max-width: 400px; text-align: left;">
        <div style="text-align: center; margin-bottom: 6px;">
          <p style="font-family: var(--font-serif); font-size: 1.1rem; font-style: italic; color: var(--charcoal-muted); margin-bottom: 10px;">
            ${config.quizTitle}
          </p>
          <div class="quiz-header">${dotsHtml}</div>
        </div>

        <div class="modal-divider"></div>

        <p style="font-size: 1.05rem; font-weight: 500; color: var(--charcoal); line-height: 1.5; margin-bottom: 0; text-align: center;">
          ${qData.question}
        </p>

        <div class="quiz-options">${optionsHtml}</div>

        <p class="quiz-feedback" id="quiz-feedback"></p>
      </div>
    `;

    document.getElementById('overlays-container').appendChild(screen);

    const buttons = screen.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', e => {
        this._handleAnswer(parseInt(e.currentTarget.dataset.index), buttons);
      });
    });
  }

  _handleAnswer(selectedIdx, buttons) {
    const qData = config.quiz[this.currentQ];
    const correct = selectedIdx === qData.correctIndex;

    // Disable all buttons
    buttons.forEach(btn => { btn.style.pointerEvents = 'none'; });

    if (correct) {
      this.score++;
      buttons[selectedIdx].classList.add('correct');
      audioManager.playSFX('success');
      particleSystem.burst(this.object.position, 0xC8DFC5, 40);
    } else {
      buttons[selectedIdx].classList.add('wrong');
      buttons[qData.correctIndex].classList.add('correct');
      audioManager.playSFX('wrong');
    }

    const feedback = document.getElementById('quiz-feedback');
    if (feedback) {
      feedback.textContent = correct ? qData.correctResponse : qData.wrongResponse;
      feedback.className = `quiz-feedback show ${correct ? 'correct' : 'wrong'}`;
    }

    setTimeout(() => {
      const overlay = document.getElementById('quiz-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            overlay.remove();
            delete uiManager.screens['quiz-overlay'];
            this.currentQ++;
            if (this.currentQ < config.quiz.length) {
              this._renderQuestion();
            } else {
              this._showScore();
            }
          }
        });
      }
    }, 2200);
  }

  _showScore() {
    const total = config.quiz.length;
    const { quizScoreMessages } = config;

    let scoreData;
    if (this.score === total) {
      scoreData = quizScoreMessages.perfect;
    } else if (this.score >= 3) {
      scoreData = quizScoreMessages.good;
    } else {
      scoreData = quizScoreMessages.low;
    }

    const id = 'quiz-score-overlay';
    const screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen active';
    screen.style.cssText = `
      background: linear-gradient(160deg, #FDFAF5 0%, #F5EFE3 100%);
      pointer-events: auto;
    `;
    screen.innerHTML = `
      <div class="warm-modal" id="score-card" style="text-align: center;">
        <p style="font-family: var(--font-sans); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--charcoal-muted); text-transform: uppercase; margin-bottom: 4px;">
          Your Diksha Score
        </p>
        <div class="score-big">${this.score}<span style="font-size: 1.5rem; color: var(--charcoal-muted);">/${total}</span></div>
        <div class="modal-divider"></div>
        <p style="font-size: 1.05rem; color: var(--charcoal-lt); white-space: pre-line; margin-bottom: 24px;">
          ${scoreData.message}
        </p>
        <button class="btn-primary" id="score-close-btn" style="opacity: 1; transform: none;">
          Back to the room
        </button>
      </div>
    `;

    document.getElementById('overlays-container').appendChild(screen);
    setTimeout(() => document.getElementById('score-card').classList.add('show'), 60);

    // Burst for celebration
    particleSystem.burst(this.object.position, 0xD4A76A, 80);
    setTimeout(() => particleSystem.burst(this.object.position, 0xF5C5A3, 60), 400);

    document.getElementById('score-close-btn').onclick = () => {
      audioManager.playSFX('click');
      gsap.to(screen, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          screen.remove();
          delete uiManager.screens[id];
          cameraController.reset(1.5);
          this.app.goToState('ROOM');
        }
      });
    };
  }
}
