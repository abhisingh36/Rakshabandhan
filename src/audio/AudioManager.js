import { Howl } from 'howler';

class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfx = {};
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Use a placeholder or a very quiet ambient tone if no audio is provided
    // For now, we will just set up the infrastructure.
    // User can replace 'assets/audio/bgm.mp3'
    this.bgm = new Howl({
      src: ['./assets/audio/bgm.webm'], // Placeholder path
      loop: true,
      volume: 0.3,
      onloaderror: () => {
        console.warn("BGM failed to load. Provide 'public/assets/audio/bgm.mp3'");
      }
    });

    this.sfx = {
      click: new Howl({ src: ['./assets/audio/click.mp3'], volume: 0.5 }),
      sparkle: new Howl({ src: ['./assets/audio/sparkle.mp3'], volume: 0.6 }),
      success: new Howl({ src: ['./assets/audio/success.mp3'], volume: 0.5 }),
      wrong: new Howl({ src: ['./assets/audio/wrong.mp3'], volume: 0.5 }),
      open: new Howl({ src: ['./assets/audio/open.mp3'], volume: 0.6 })
    };

    // Ignore missing sound errors to prevent crashing
    Object.values(this.sfx).forEach(sound => {
      sound.once('loaderror', () => {
         // Silently ignore missing SFX
      });
    });

    this.initialized = true;
  }

  playBGM() {
    if (!this.initialized) this.init();
    if (!this.bgm.playing()) {
      this.bgm.play();
    }
  }

  playSFX(name) {
    if (this.isMuted || !this.sfx[name]) return;
    this.sfx[name].play();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    return this.isMuted;
  }
}

export const audioManager = new AudioManager();
