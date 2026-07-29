import { AudioEqualizerBands } from '../types';

class WebAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private isConnected = false;
  private currentElement: HTMLAudioElement | null = null;

  // Fallback synthetic wave generator if CORS prevents WebAudio capture
  private fallbackPhase = 0;
  private fallbackBuffer = new Uint8Array(128);

  public init() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        this.gainNode = this.audioCtx.createGain();

        // Build 5-band Equalizer
        const frequencies = [60, 230, 910, 3600, 14000];
        this.eqFilters = frequencies.map((freq) => {
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = freq === 60 ? 'lowshelf' : freq === 14000 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.gain.value = 0;
          return filter;
        });

        // Chain Filters: Gain -> EQ1 -> EQ2 -> EQ3 -> EQ4 -> EQ5 -> Analyser -> Destination
        let prevNode: AudioNode = this.gainNode;
        this.eqFilters.forEach((filter) => {
          prevNode.connect(filter);
          prevNode = filter;
        });
        prevNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }
  }

  public connectAudioElement(audioElement: HTMLAudioElement) {
    this.init();
    if (!this.audioCtx || !this.analyser || this.isConnected) return;

    try {
      if (this.currentElement !== audioElement) {
        this.currentElement = audioElement;
        this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
        if (this.gainNode) {
          this.sourceNode.connect(this.gainNode);
        } else {
          this.sourceNode.connect(this.analyser);
        }
        this.isConnected = true;
      }
    } catch (err) {
      console.warn('Unable to connect HTML5 Audio to AudioContext (likely CORS or re-bind):', err);
    }
  }

  public resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      // Check if data is non-zero
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      if (sum > 0) return data;
    }
    // Return synthetic lively frequencies if silent or cross-origin stream
    return this.generateSyntheticFrequencies();
  }

  public getWaveformData(): Uint8Array {
    if (this.analyser) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(data);
      let isFlat = true;
      for (let i = 0; i < data.length; i++) {
        if (data[i] !== 128) {
          isFlat = false;
          break;
        }
      }
      if (!isFlat) return data;
    }
    return this.generateSyntheticWaveform();
  }

  public setEqualizerBands(bands: AudioEqualizerBands) {
    if (this.eqFilters.length === 5) {
      this.eqFilters[0].gain.value = bands.b60;
      this.eqFilters[1].gain.value = bands.b230;
      this.eqFilters[2].gain.value = bands.b910;
      this.eqFilters[3].gain.value = bands.b3k6;
      this.eqFilters[4].gain.value = bands.b14k;
    }
  }

  public setGainVolume(volume: number) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioCtx.currentTime);
    }
  }

  private generateSyntheticFrequencies(): Uint8Array {
    this.fallbackPhase += 0.05;
    const len = 64;
    const data = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const bassVal = Math.sin(this.fallbackPhase * 2 + i * 0.1) * 80 + 120;
      const midVal = Math.cos(this.fallbackPhase * 1.5 + i * 0.2) * 60 + 80;
      const noise = Math.random() * 25;
      data[i] = Math.max(10, Math.min(255, (i < 10 ? bassVal : midVal) + noise));
    }
    return data;
  }

  private generateSyntheticWaveform(): Uint8Array {
    this.fallbackPhase += 0.08;
    const len = 128;
    for (let i = 0; i < len; i++) {
      const v = Math.sin(i * 0.15 + this.fallbackPhase) * 40 + Math.sin(i * 0.05 - this.fallbackPhase * 1.5) * 20 + 128;
      this.fallbackBuffer[i] = Math.max(0, Math.min(255, v));
    }
    return this.fallbackBuffer;
  }
}

export const audioEngine = new WebAudioEngine();
