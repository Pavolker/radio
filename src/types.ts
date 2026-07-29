export type StreamStatus = 'live' | 'connecting' | 'paused' | 'offline';

export type AudioVisualizerMode = 'spectrum' | 'waveform' | 'aurora' | 'vumeter' | 'particles';

export type EqualizerPreset = 'flat' | 'bass_boost' | 'synthwave' | 'vocal' | 'chillout' | 'club' | 'custom';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  duration: number; // in seconds
  year?: number;
  lyrics?: string;
  artistBio?: string;
  accentColor?: string; // hex or rgb for dynamic visual background
  secondaryColor?: string;
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
  timeSlot: string; // e.g. "00:00 - 04:00"
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
  reaction?: string; // e.g. '🔥' | '💜' | '⚡' | '🎧'
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
  b60: number;   // -12 to +12 dB
  b230: number;
  b910: number;
  b3k6: number;
  b14k: number;
}
