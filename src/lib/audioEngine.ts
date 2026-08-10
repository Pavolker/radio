import { AudioEqualizerBands } from '../types';

function isMobileDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  );
}

class WebAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private isConnected = false;
  private currentElement: HTMLAudioElement | null = null;
  private isMobile = isMobileDevice();

  // Reutilizar buffers (evita garbage collection)
  private freqBuffer: Uint8Array | null = null;
  private waveBuffer: Uint8Array | null = null;

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
        // Mobile: FFT menor = menos processamento
        this.analyser.fftSize = this.isMobile ? 128 : 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // Pré-alocar buffers reutilizáveis
        const binCount = this.analyser.frequencyBinCount;
        this.freqBuffer = new Uint8Array(binCount);
        this.waveBuffer = new Uint8Array(binCount);

        this.gainNode = this.audioCtx.createGain();

        // Build 5-band Equalizer — apenas desktop ativa por padrão
        const frequencies = [60, 230, 910, 3600, 14000];
        this.eqFilters = frequencies.map((freq) => {
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = freq === 60 ? 'lowshelf' : freq === 14000 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.gain.value = 0;
          return filter;
        });

        // Chain: Gain -> EQ (se não mobile) -> Analyser -> Destination
        let prevNode: AudioNode = this.gainNode;
        if (!this.isMobile) {
          this.eqFilters.forEach((filter) => {
            prevNode.connect(filter);
            prevNode = filter;
          });
        }
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
    if (!this.analyser || !this.freqBuffer) {
      return this.generateSyntheticFrequencies();
    }
    this.analyser.getByteFrequencyData(this.freqBuffer);
    // Check if data is non-zero
    let sum = 0;
    for (let i = 0; i < this.freqBuffer.length; i++) sum += this.freqBuffer[i];
    if (sum > 0) return this.freqBuffer;
    return this.generateSyntheticFrequencies();
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser || !this.waveBuffer) {
      return this.generateSyntheticWaveform();
    }
    this.analyser.getByteTimeDomainData(this.waveBuffer);
    let isFlat = true;
    for (let i = 0; i < this.waveBuffer.length; i++) {
      if (this.waveBuffer[i] !== 128) {
        isFlat = false;
        break;
      }
    }
    if (!isFlat) return this.waveBuffer;
    return this.generateSyntheticWaveform();
  }

  public setEqualizerBands(bands: AudioEqualizerBands) {
    // Mobile: equalizador não ativo por padrão (evita chain extra de filtros)
    if (this.isMobile || this.eqFilters.length !== 5) return;
    this.eqFilters[0].gain.value = bands.b60;
    this.eqFilters[1].gain.value = bands.b230;
    this.eqFilters[2].gain.value = bands.b910;
    this.eqFilters[3].gain.value = bands.b3k6;
    this.eqFilters[4].gain.value = bands.b14k;
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
