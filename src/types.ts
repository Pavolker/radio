export type StreamStatus = 'live' | 'connecting' | 'paused' | 'offline';

export type AudioVisualizerMode = 'spectrum' | 'waveform' | 'aurora' | 'vumeter' | 'particles';

export type EqualizerPreset = 'flat' | 'bass_boost' | 'synthwave' | 'vocal' | 'chillout' | 'club' | 'custom';

export interface AudicaoTecnica {
  duracao: number;
  bpm: number;
  bpmSuperficie?: number;
  tonalidade: string;
  dinamicaDb: number;
  brilhoInicialHz?: number;
  brilhoPicoHz?: number;
  brilhoFinalHz?: number;
  percentualHarmonia: number;
  percentualPercussao: number;
}

export interface Audicao {
  autor: string;
  data: string;
  tecnica: AudicaoTecnica;
  texto: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  duration: number;
  year?: number;
  lyrics?: string;
  artistBio?: string;
  accentColor?: string;
  secondaryColor?: string;
  audicao?: Audicao;
}

export interface RadioStationInfo {
  name: string;
  tagline: string;
  frequency: string;
  description: string;
  streamUrl: string;
  backupStreamUrls?: string[];
  location: string;
  currentProgram: string;
  djHost: string;
  githubRepoUrl: string;
  githubJsonPath: string;
  bitrateKbps: number;
  format: string;
}

export interface ProgramSchedule {
  id: string;
  title: string;
  host: string;
  timeSlot: string;
  genre: string;
  coverImage: string;
  description: string;
  isCurrent?: boolean;
}

export interface ListenerComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  reaction?: string;
  isRequest?: boolean;
}

export interface RadioCatalogJSON {
  radio: {
    name: string;
    tagline?: string;
    streamUrl: string;
    description: string;
    frequency?: string;
    djHost?: string;
    currentProgram?: string;
  };
  tracks: Track[];
  schedule?: ProgramSchedule[];
}

export interface AudioEqualizerBands {
  b60: number;
  b230: number;
  b910: number;
  b3k6: number;
  b14k: number;
}