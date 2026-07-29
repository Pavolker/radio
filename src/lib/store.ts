import { create } from 'zustand';
import {
  Track,
  RadioStationInfo,
  StreamStatus,
  AudioVisualizerMode,
  EqualizerPreset,
  AudioEqualizerBands,
  ProgramSchedule,
  ListenerComment,
  RadioCatalogJSON
} from '../types';
import { INITIAL_STATION_INFO, INITIAL_TRACKS, INITIAL_SCHEDULE, INITIAL_COMMENTS } from '../data/radioData';
import { audioEngine } from './audioEngine';

interface RadioState {
  stationInfo: RadioStationInfo;
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  streamStatus: StreamStatus;
  volume: number;
  isMuted: boolean;
  visualizerMode: AudioVisualizerMode;
  equalizerPreset: EqualizerPreset;
  equalizerBands: AudioEqualizerBands;
  sleepTimerMinutes: number | null;
  sleepTimerSecondsLeft: number | null;
  schedule: ProgramSchedule[];
  comments: ListenerComment[];
  history: { track: Track; playedAt: string }[];
  favorites: string[];
  isCinemaMode: boolean;
  theme: 'dark' | 'light';
  currentBitrate: number;
  isLiveMode: boolean;

  // Modals state
  isGithubModalOpen: boolean;
  isEqualizerModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isLyricsOpen: boolean;

  // GitHub Config
  customGithubUrl: string;
  isFetchingGithub: boolean;
  githubError: string | null;

  // Actions
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setStreamStatus: (status: StreamStatus) => void;
  setVisualizerMode: (mode: AudioVisualizerMode) => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setEqualizerBand: (band: keyof AudioEqualizerBands, value: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  decrementSleepTimer: () => void;
  toggleFavorite: (trackId: string) => void;
  addComment: (text: string, reaction?: string, isRequest?: boolean) => void;
  toggleCinemaMode: () => void;
  toggleTheme: () => void;
  setBitrate: (bitrate: number) => void;
  toggleLiveMode: () => void;

  // Modal Toggles
  setGithubModalOpen: (open: boolean) => void;
  setEqualizerModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;

  // Data Loading
  loadGithubCatalog: (url?: string) => Promise<boolean>;
  setStationCatalog: (data: RadioCatalogJSON) => void;
}

const DEFAULT_EQ_BANDS: Record<EqualizerPreset, AudioEqualizerBands> = {
  flat: { b60: 0, b230: 0, b910: 0, b3k6: 0, b14k: 0 },
  bass_boost: { b60: 8, b230: 5, b910: 1, b3k6: -2, b14k: -1 },
  synthwave: { b60: 6, b230: 3, b910: 0, b3k6: 4, b14k: 7 },
  vocal: { b60: -2, b230: 1, b910: 6, b3k6: 4, b14k: 2 },
  chillout: { b60: 4, b230: 2, b910: 0, b3k6: 2, b14k: 4 },
  club: { b60: 7, b230: 4, b910: 2, b3k6: 5, b14k: 6 },
  custom: { b60: 0, b230: 0, b910: 0, b3k6: 0, b14k: 0 }
};

export const useRadioStore = create<RadioState>((set, get) => ({
  stationInfo: INITIAL_STATION_INFO,
  tracks: INITIAL_TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  streamStatus: 'paused',
  volume: 0.85,
  isMuted: false,
  visualizerMode: 'aurora',
  equalizerPreset: 'synthwave',
  equalizerBands: DEFAULT_EQ_BANDS.synthwave,
  sleepTimerMinutes: null,
  sleepTimerSecondsLeft: null,
  schedule: INITIAL_SCHEDULE,
  comments: INITIAL_COMMENTS,
  history: [
    { track: INITIAL_TRACKS[4], playedAt: '20:15' },
    { track: INITIAL_TRACKS[3], playedAt: '20:30' }
  ],
  favorites: ['track-001', 'track-002'],
  isCinemaMode: false,
  theme: 'dark',
  currentBitrate: 320,
  isLiveMode: true,

  isGithubModalOpen: false,
  isEqualizerModalOpen: false,
  isShortcutsModalOpen: false,
  isLyricsOpen: false,

  customGithubUrl: 'https://raw.githubusercontent.com/Pavolker/radio/main/public/radio-catalog.json',
  isFetchingGithub: false,
  githubError: null,

  togglePlay: () => {
    const { isPlaying, streamStatus } = get();
    audioEngine.resumeContext();
    if (isPlaying) {
      set({ isPlaying: false, streamStatus: 'paused' });
    } else {
      set({ isPlaying: true, streamStatus: 'connecting' });
    }
  },

  playTrack: (index) => {
    const { tracks, history, currentTrackIndex } = get();
    if (index >= 0 && index < tracks.length) {
      const prevTrack = tracks[currentTrackIndex];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newHistory = prevTrack ? [{ track: prevTrack, playedAt: timeStr }, ...history.slice(0, 9)] : history;

      audioEngine.resumeContext();
      set({
        currentTrackIndex: index,
        isPlaying: true,
        streamStatus: 'connecting',
        history: newHistory
      });
    }
  },

  nextTrack: () => {
    const { currentTrackIndex, tracks } = get();
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    get().playTrack(nextIdx);
  },

  previousTrack: () => {
    const { currentTrackIndex, tracks } = get();
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    get().playTrack(prevIdx);
  },

  setVolume: (vol) => {
    audioEngine.setGainVolume(vol);
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      audioEngine.setGainVolume(volume || 0.85);
      set({ isMuted: false });
    } else {
      audioEngine.setGainVolume(0);
      set({ isMuted: true });
    }
  },

  setStreamStatus: (status) => set({ streamStatus: status }),

  setVisualizerMode: (mode) => set({ visualizerMode: mode }),

  setEqualizerPreset: (preset) => {
    const bands = DEFAULT_EQ_BANDS[preset] || DEFAULT_EQ_BANDS.flat;
    audioEngine.setEqualizerBands(bands);
    set({ equalizerPreset: preset, equalizerBands: bands });
  },

  setEqualizerBand: (band, value) => {
    const { equalizerBands } = get();
    const updated = { ...equalizerBands, [band]: value };
    audioEngine.setEqualizerBands(updated);
    set({ equalizerBands: updated, equalizerPreset: 'custom' });
  },

  setSleepTimer: (minutes) => {
    if (minutes === null) {
      set({ sleepTimerMinutes: null, sleepTimerSecondsLeft: null });
    } else {
      set({ sleepTimerMinutes: minutes, sleepTimerSecondsLeft: minutes * 60 });
    }
  },

  decrementSleepTimer: () => {
    const { sleepTimerSecondsLeft, isPlaying } = get();
    if (sleepTimerSecondsLeft === null) return;
    if (sleepTimerSecondsLeft <= 1) {
      set({ sleepTimerMinutes: null, sleepTimerSecondsLeft: null, isPlaying: false, streamStatus: 'paused' });
    } else {
      set({ sleepTimerSecondsLeft: sleepTimerSecondsLeft - 1 });
    }
  },

  toggleFavorite: (trackId) => {
    const { favorites } = get();
    if (favorites.includes(trackId)) {
      set({ favorites: favorites.filter((id) => id !== trackId) });
    } else {
      set({ favorites: [...favorites, trackId] });
    }
  },

  addComment: (text, reaction, isRequest = false) => {
    const { comments } = get();
    const newComment: ListenerComment = {
      id: `comm-${Date.now()}`,
      userName: 'Você (Ouvinte VIP)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text,
      timestamp: 'Agora mesmo',
      reaction,
      isRequest
    };
    set({ comments: [newComment, ...comments] });
  },

  toggleCinemaMode: () => set((state) => ({ isCinemaMode: !state.isCinemaMode })),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setBitrate: (bitrate) => set({ currentBitrate: bitrate }),

  toggleLiveMode: () => set((state) => ({ isLiveMode: !state.isLiveMode })),

  setGithubModalOpen: (open) => set({ isGithubModalOpen: open }),
  setEqualizerModalOpen: (open) => set({ isEqualizerModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setLyricsOpen: (open) => set({ isLyricsOpen: open }),

  loadGithubCatalog: async (url) => {
    const targetUrl = url || get().customGithubUrl;
    set({ isFetchingGithub: true, githubError: null });

    try {
      const response = await fetch(`/api/radio/catalog?url=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        throw new Error(`Falha ao carregar catálogo (${response.status})`);
      }
      const data: RadioCatalogJSON = await response.json();
      if (data && data.tracks && data.tracks.length > 0) {
        get().setStationCatalog(data);
        set({ isFetchingGithub: false, customGithubUrl: targetUrl });
        return true;
      } else {
        throw new Error('Formato do arquivo JSON inválido ou lista de faixas vazia.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar ao GitHub.';
      set({ isFetchingGithub: false, githubError: errorMessage });
      return false;
    }
  },

  setStationCatalog: (data) => {
    const currentStation = get().stationInfo;
    const newStation: RadioStationInfo = {
      ...currentStation,
      name: data.radio.name || currentStation.name,
      tagline: data.radio.tagline || currentStation.tagline,
      description: data.radio.description || currentStation.description,
      streamUrl: data.radio.streamUrl || currentStation.streamUrl,
      djHost: data.radio.djHost || currentStation.djHost,
      currentProgram: data.radio.currentProgram || currentStation.currentProgram
    };

    set({
      stationInfo: newStation,
      tracks: data.tracks && data.tracks.length > 0 ? data.tracks : get().tracks,
      schedule: data.schedule && data.schedule.length > 0 ? data.schedule : get().schedule,
      currentTrackIndex: 0
    });
  }
}));
