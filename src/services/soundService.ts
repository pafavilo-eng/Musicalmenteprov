// Web Audio API based sound synthesizer for MusicalMente
// Completely self-contained, zero external network dependency, 100% reliable

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEffects: boolean = false; // Initially MUTED
  private music: boolean = false; // Initially MUTED
  private volume: number = 0.7;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  public isAudioActive(): boolean {
    return this.soundEffects || this.music;
  }

  private initCtx() {
    if (!this.soundEffects && !this.music) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public enableAudio() {
    this.soundEffects = true;
    this.music = true;
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    // Gentle cheerful chime to confirm audio is now on
    setTimeout(() => {
      this.playTap();
    }, 50);
  }

  public disableAudio() {
    this.soundEffects = false;
    this.music = false;
    this.stopMusic();
  }

  public setSettings(sfx: boolean, bgm: boolean, vol: number) {
    this.soundEffects = sfx;
    this.music = bgm;
    this.volume = Math.max(0, Math.min(1, vol));

    if ((!this.soundEffects && !this.music) || !this.music) {
      if (this.isMusicPlaying) {
        this.stopMusic();
      }
    } else if (this.music && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  // Button Tap Sound: Warm Marimba Pop
  public playTap() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(329.63, t + 0.08); // E4

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch {
      // Audio safety
    }
  }

  // Correct Answer: Cheerful Ascending C-Major Triad (C4, E4, G4, C5)
  public playCorrect() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.45);
      });
    } catch {
      // Audio safety
    }
  }

  // Incorrect Answer: Friendly Gentle Boing (Not harsh or scary)
  public playIncorrect() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.exponentialRampToValueAtTime(196.00, now + 0.25); // G3 (soft downward)

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Audio safety
    }
  }

  // Combo Sound: Musical Harp Glissando (pitch scales with combo count)
  public playCombo(comboCount: number) {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const baseFreq = Math.min(600, 300 + comboCount * 35);
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {
      // Audio safety
    }
  }

  // Achievement Fanfare: Golden Triumphant Chime
  public playAchievement() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [
        { freqs: [261.63, 329.63, 392.00], delay: 0, dur: 0.25 },
        { freqs: [329.63, 392.00, 523.25], delay: 0.2, dur: 0.25 },
        { freqs: [392.00, 523.25, 659.25], delay: 0.4, dur: 0.6 },
      ];
      const now = this.ctx.currentTime;

      chords.forEach(({ freqs, delay, dur }) => {
        freqs.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + delay;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.18 * this.volume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      });
    } catch {
      // Audio safety
    }
  }

  // Question Advance
  public playNextQuestion() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);

      gain.gain.setValueAtTime(0.15 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  // Victory Fanfare at match completion
  public playVictory() {
    if (!this.soundEffects) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 523.25, d: 0.15, gap: 0 },
        { f: 523.25, d: 0.15, gap: 0.15 },
        { f: 523.25, d: 0.15, gap: 0.3 },
        { f: 659.25, d: 0.4, gap: 0.45 },
        { f: 587.33, d: 0.2, gap: 0.8 },
        { f: 523.25, d: 0.2, gap: 1.0 },
        { f: 659.25, d: 0.15, gap: 1.2 },
        { f: 783.99, d: 0.6, gap: 1.35 },
      ];
      const now = this.ctx.currentTime;

      notes.forEach(({ f, d, gap }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + gap;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.2 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + d + 0.05);
      });
    } catch {}
  }

  // Background Music: Gentle, playful Pentatonic Music Box Loop
  public startMusic() {
    if (!this.music || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const melody = [
      261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 329.63,
      261.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66, 261.63,
    ];
    let noteIndex = 0;

    const playNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.music) return;
      try {
        const freq = melody[noteIndex % melody.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const t = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        // Warm music box filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);

        // Low volume background level (never obtrusive)
        const bgVolume = 0.07 * this.volume;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(bgVolume, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.65);

        noteIndex++;
      } catch {}
    };

    // Play every 450ms
    this.musicInterval = setInterval(playNote, 450);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundService = new SoundService();
