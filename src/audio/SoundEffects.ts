/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private thrusterNode: AudioNode | null = null;
  private thrusterGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private initialized: boolean = false;

  constructor() {
    const saved = localStorage.getItem('sky_roadster_muted');
    this.isMuted = saved === 'true';
  }

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupContinuousEngines();
      this.initialized = true;
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  private setupContinuousEngines() {
    if (!this.ctx || !this.masterGain) return;

    // Dual oscillator engine hum
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.engineGain = this.ctx.createGain();

    this.engineOsc1.type = 'sawtooth';
    this.engineOsc2.type = 'triangle';
    this.engineOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);
    this.engineOsc2.frequency.setValueAtTime(110, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.engineOsc1.connect(filter);
    this.engineOsc2.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();

    // Jet thruster (for flight hover & rocket turbo)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const thrusterFilter = this.ctx.createBiquadFilter();
    thrusterFilter.type = 'bandpass';
    thrusterFilter.frequency.setValueAtTime(900, this.ctx.currentTime);
    thrusterFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.thrusterGain = this.ctx.createGain();
    this.thrusterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(thrusterFilter);
    thrusterFilter.connect(this.thrusterGain);
    this.thrusterGain.connect(this.masterGain);
    whiteNoise.start();
    this.thrusterNode = whiteNoise;
  }

  public updateEngine(speedKmh: number, isBoosting: boolean, isFlying: boolean, isPlaying: boolean) {
    if (!this.ctx || !this.engineGain || !this.engineOsc1 || !this.engineOsc2 || !this.thrusterGain) return;
    if (!isPlaying) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      this.thrusterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }

    const t = this.ctx.currentTime;
    const basePitch = 55 + (speedKmh / 240) * 90 + (isBoosting ? 50 : 0);
    this.engineOsc1.frequency.setTargetAtTime(basePitch, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(basePitch * 1.5, t, 0.05);

    const targetEngineGain = isFlying ? 0.09 : isBoosting ? 0.25 : 0.16;
    this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : targetEngineGain, t, 0.05);

    const targetThrusterGain = isBoosting ? 0.35 : isFlying ? 0.28 : 0;
    this.thrusterGain.gain.setTargetAtTime(this.isMuted ? 0 : targetThrusterGain, t, 0.06);
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playAirFlop() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.12);
    osc.frequency.linearRampToValueAtTime(320, now + 0.28);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playRoadblockAlert() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.12);
    osc.frequency.setValueAtTime(880, now + 0.24);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.36);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playSlam() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playBoostStart() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.3);

    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playBarrelRoll() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.14);
    osc.frequency.linearRampToValueAtTime(420, now + 0.28);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playGoldCoin() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // High sparkling metallic gold chime
    const notes = [659.25, 830.61, 987.77, 1318.5]; // E5, G#5, B5, E6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0.22, now + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.22);
    });
  }

  public playNearMiss() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Low sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.65);

    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.7);

    // Noise blast
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.42);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('sky_roadster_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public userGesture() {
    this.initContext();
  }
}

export const soundEffects = new SoundEffectsManager();
