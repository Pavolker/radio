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

  // Shuffle / Random Mode
  isShuffled: boolean;
  shuffleOrder: number[];
  shuffleIndex: number;

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
  toggleShuffle: () => void;
  reshuffle: () => void;

  // Modal Toggles
  setGithubModalOpen: (open: boolean) => void;
  setEqualizerModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;

  // Data Loading
  loadGithubCatalog: (url?: string) => Promise<boolean>;
  setStationCatalog: (data: RadioCatalogJSON) => void;
}

/**
 * Gera uma ordem aleatória dos índices das faixas,
 * garantindo que duas músicas do mesmo artista não sejam consecutivas.
 */
function generateShuffleOrder(tracks: Track[], seed?: number): number[] {
  const n = tracks.length;
  
  // Agrupar índices por artista
  const artistGroups: Record<string, number[]> = {};
  tracks.forEach((track, i) => {
    const artist = track.artist;
    if (!artistGroups[artist]) artistGroups[artist] = [];
    artistGroups[artist].push(i);
  });

  // Embaralhar cada grupo internamente (Fisher-Yates)
  const artists = Object.keys(artistGroups);
  for (const artist of artists) {
    const arr = artistGroups[artist];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Distribuir alternando entre artistas: pegar um de cada vez
  const result: number[] = [];
  const pointers: Record<string, number> = {};
  for (const artist of artists) pointers[artist] = 0;

  // Ordenar artistas por tamanho do grupo (do maior para o menor)
  const sortedArtists = [...artists].sort((a, b) => artistGroups[b].length - artistGroups[a].length);

  let lastArtist: string | null = null;
  let remaining = n;

  while (remaining > 0) {
    // Escolher artista que ainda tem músicas e não repetiu o último
    let chosen: string | null = null;

    for (const artist of sortedArtists) {
      if (pointers[artist] < artistGroups[artist].length && artist !== lastArtist) {
        chosen = artist;
        break;
      }
    }

    // Se todos os artistas restantes são o mesmo, pega dele mesmo (não tem jeito)
    if (!chosen) {
      for (const artist of sortedArtists) {
        if (pointers[artist] < artistGroups[artist].length) {
          chosen = artist;
          break;
        }
      }
    }

    if (!chosen) break; // segurança

    const idx = artistGroups[chosen][pointers[chosen]];
    pointers[chosen]++;
    result.push(idx);
    lastArtist = chosen;
    remaining--;
  }

  return result;
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

export const useRadioStore = create<RadioState>((set, get) => {
  // Ordem aleatória inicial (já embaralhada e sem artistas consecutivos)
  const initialShuffleOrder = generateShuffleOrder(INITIAL_TRACKS);

  return {
    stationInfo: INITIAL_STATION_INFO,
    tracks: INITIAL_TRACKS,
    currentTrackIndex: initialShuffleOrder[0] || 0,
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
    history: [],
    favorites: ['track-001', 'track-002'],
    isCinemaMode: false,
    theme: 'dark',
    currentBitrate: 320,
    isLiveMode: true,

    // Shuffle / Random Mode — ligado por padrão
    isShuffled: true,
    shuffleOrder: initialShuffleOrder,
    shuffleIndex: 0,

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
    const { tracks, history, currentTrackIndex, shuffleOrder } = get();
    if (index >= 0 && index < tracks.length) {
      const prevTrack = tracks[currentTrackIndex];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newHistory = prevTrack ? [{ track: prevTrack, playedAt: timeStr }, ...history.slice(0, 9)] : history;

      // Encontrar a posição no shuffleOrder
      const shuffleIdx = shuffleOrder.indexOf(index);
      const newShuffleIndex = shuffleIdx >= 0 ? shuffleIdx : 0;

      audioEngine.resumeContext();
      set({
        currentTrackIndex: index,
        isPlaying: true,
        streamStatus: 'connecting',
        history: newHistory,
        shuffleIndex: newShuffleIndex
      });
    }
  },

  nextTrack: () => {
    const { isShuffled, shuffleOrder, shuffleIndex, tracks, currentTrackIndex } = get();
    
    if (isShuffled) {
      const nextShuffleIdx = (shuffleIndex + 1) % shuffleOrder.length;
      const nextIdx = shuffleOrder[nextShuffleIdx];

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { history } = get();
      const prevTrack = tracks[currentTrackIndex];
      const newHistory = prevTrack ? [{ track: prevTrack, playedAt: timeStr }, ...history.slice(0, 9)] : history;

      audioEngine.resumeContext();
      set({
        currentTrackIndex: nextIdx,
        shuffleIndex: nextShuffleIdx,
        isPlaying: true,
        streamStatus: 'connecting',
        history: newHistory
      });
    } else {
      const nextIdx = (currentTrackIndex + 1) % tracks.length;
      get().playTrack(nextIdx);
    }
  },

  previousTrack: () => {
    const { isShuffled, shuffleOrder, shuffleIndex, tracks, currentTrackIndex } = get();
    
    if (isShuffled) {
      const prevShuffleIdx = (shuffleIndex - 1 + shuffleOrder.length) % shuffleOrder.length;
      const prevIdx = shuffleOrder[prevShuffleIdx];

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { history } = get();
      const prevTrack = tracks[currentTrackIndex];
      const newHistory = prevTrack ? [{ track: prevTrack, playedAt: timeStr }, ...history.slice(0, 9)] : history;

      audioEngine.resumeContext();
      set({
        currentTrackIndex: prevIdx,
        shuffleIndex: prevShuffleIdx,
        isPlaying: true,
        streamStatus: 'connecting',
        history: newHistory
      });
    } else {
      const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      get().playTrack(prevIdx);
    }
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

  toggleShuffle: () => {
    const { isShuffled } = get();
    if (isShuffled) {
      set({ isShuffled: false });
    } else {
      const { tracks, currentTrackIndex } = get();
      const newOrder = generateShuffleOrder(tracks);
      const idx = newOrder.indexOf(currentTrackIndex);
      if (idx > 0) {
        newOrder.splice(idx, 1);
        newOrder.unshift(currentTrackIndex);
      }
      set({ isShuffled: true, shuffleOrder: newOrder, shuffleIndex: 0 });
    }
  },

  reshuffle: () => {
    const { tracks, currentTrackIndex } = get();
    const newOrder = generateShuffleOrder(tracks);
    const idx = newOrder.indexOf(currentTrackIndex);
    if (idx > 0) {
      newOrder.splice(idx, 1);
      newOrder.unshift(currentTrackIndex);
    }
    set({ shuffleOrder: newOrder, shuffleIndex: 0 });
  },

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

    const newTracks = data.tracks && data.tracks.length > 0 ? data.tracks : get().tracks;
    const newOrder = generateShuffleOrder(newTracks);

    set({
      stationInfo: newStation,
      tracks: newTracks,
      schedule: data.schedule && data.schedule.length > 0 ? data.schedule : get().schedule,
      currentTrackIndex: newOrder[0] || 0,
      shuffleOrder: newOrder,
      shuffleIndex: 0,
      isShuffled: true
    });
  }
};
});

