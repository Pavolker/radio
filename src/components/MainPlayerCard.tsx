import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  FileText,
  Clock,
  Shuffle,
  Share2,
  Check
} from 'lucide-react';
import { useRadioStore } from '../lib/store';
import { audioEngine } from '../lib/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';

export const MainPlayerCard: React.FC = () => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    streamStatus,
    setStreamStatus,
    favorites,
    toggleFavorite,
    sleepTimerMinutes,
    sleepTimerSecondsLeft,
    setSleepTimer,
    decrementSleepTimer,
    isLiveMode,
    toggleLiveMode,
    setLyricsOpen,
    isShuffled,
    toggleShuffle,
    stationInfo
  } = useRadioStore();

  // Dual audio elements: current (playing) + next (preloading)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isHoveringVinyl, setIsHoveringVinyl] = useState(false);
  const preloadedIndexRef = useRef<number>(-1);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const isFav = favorites.includes(currentTrack?.id);
  const [copied, setCopied] = useState(false);

  // --- Get next track index (respecting shuffle) ---
  const getNextIndex = useCallback((): number => {
    const state = useRadioStore.getState();
    if (state.isShuffled) {
      const nextShuffleIdx = (state.shuffleIndex + 1) % state.shuffleOrder.length;
      return state.shuffleOrder[nextShuffleIdx];
    }
    return (state.currentTrackIndex + 1) % state.tracks.length;
  }, []);

  // --- Preload next track when current is 80% done ---
  useEffect(() => {
    const audio = currentAudioRef.current;
    if (!audio || !isPlaying || duration <= 0) return;

    const progress = currentTime / duration;
    if (progress < 0.7) return;

    const nextIdx = getNextIndex();
    if (nextIdx === preloadedIndexRef.current) return;

    const nextTrack = tracks[nextIdx];
    if (!nextTrack) return;

    const nextAudio = nextAudioRef.current;
    if (!nextAudio) return;

    // Preload next track
    nextAudio.src = nextTrack.audioUrl;
    nextAudio.load();
    nextAudio.volume = 0; // silent while preloading
    preloadedIndexRef.current = nextIdx;

    // eslint-disable-next-line no-console
    console.log('[Gapless] Preloaded:', nextTrack.title);
  }, [currentTime, duration, isPlaying, tracks, getNextIndex]);

  // --- Sync Current Audio Element with Zustand Store ---
  useEffect(() => {
    const audio = currentAudioRef.current;
    if (!audio) return;

    // Only reconnect WebAudio if this is a NEW track (not just play/pause)
    if (!audio.src || !audio.src.includes(currentTrack?.audioUrl || '')) {
      audio.src = currentTrack?.audioUrl || '';
      audio.load();
      // Reset preload state since we're changing tracks
      preloadedIndexRef.current = -1;
    }

    audioEngine.connectAudioElement(audio);

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStreamStatus('live');
          })
          .catch((err) => {
            console.warn('Audio play auto-block:', err);
            setStreamStatus('paused');
          });
      }
    } else {
      audio.pause();
      setStreamStatus('paused');
    }
  }, [isPlaying, currentTrackIndex, setStreamStatus, currentTrack?.audioUrl]);

  // --- Handle Track Time Updates & Auto-Next (Gapless) ---
  useEffect(() => {
    const audio = currentAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || currentTrack?.duration || 180);
    };

    const handleEnded = () => {
      // GAPLESS TRANSITION: if nextAudio is preloaded and ready, swap immediately
      const nextAudio = nextAudioRef.current;
      const nextIdx = preloadedIndexRef.current;
      const nextTrackData = nextIdx >= 0 ? tracks[nextIdx] : null;

      if (
        nextAudio &&
        nextTrackData &&
        nextAudio.src.includes(nextTrackData.audioUrl) &&
        nextAudio.readyState >= 2
      ) {
        // Swap audio elements
        const current = currentAudioRef.current;
        if (current) {
          current.pause();
        }

        // Swap the refs by swapping src and playing
        if (current) {
          current.src = nextAudio.src; // inherit the loaded audio
          current.currentTime = 0;
          const playPromise = current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => { /* ignore */ });
          }
        }

        // Clear nextAudio for next preload
        nextAudio.src = '';
        preloadedIndexRef.current = -1;

        // Advance Zustand state
        nextTrack();
      } else {
        // Fallback: normal nextTrack if preload failed
        nextTrack();
      }
    };

    const handleError = () => {
      setStreamStatus('offline');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [nextTrack, setStreamStatus, currentTrack, tracks]);

  // Handle Sleep Timer Countdown Interval
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) return;
    const interval = setInterval(() => {
      decrementSleepTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft, decrementSleepTimer]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (currentAudioRef.current) {
      currentAudioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?track=${currentTrack?.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Falha ao copiar link:', err);
    }
  };

  const accentHex = currentTrack?.accentColor || '#ec4899';

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-900/80 border border-white/10 shadow-2xl shadow-slate-950/80 overflow-hidden text-white transition-all duration-500">

      {/* Dynamic Ambient Blur Glow behind card */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: accentHex }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTrack?.secondaryColor || '#06b6d4' }}
      />

      {/* Current Audio Element (playing) */}
      <audio
        ref={currentAudioRef}
        preload="auto"
        crossOrigin="anonymous"
      />
      {/* Next Audio Element (preloading, hidden) */}
      <audio
        ref={nextAudioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      {/* Top Deck Header Info */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-300 uppercase tracking-widest font-semibold">
            {isLiveMode ? 'STREAM CONTINUO 24/7' : 'MODO PLAYLIST VIRTUAL'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Stream / Playlist Toggle */}
          <button
            onClick={toggleLiveMode}
            className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium transition-all ${
              isLiveMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isLiveMode ? '● Sintonizado Ao Vivo' : 'Modo Seleção'}
          </button>

          {/* Sleep Timer Indicator / Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {sleepTimerSecondsLeft !== null
                  ? `${Math.ceil(sleepTimerSecondsLeft / 60)}m`
                  : 'Timer'}
              </span>
            </button>

            {/* Dropdown Options */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-slate-900 border border-white/10 rounded-xl p-1.5 shadow-xl z-30 min-w-32">
              <button
                onClick={() => setSleepTimer(15)}
                className="text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                15 Minutos
              </button>
              <button
                onClick={() => setSleepTimer(30)}
                className="text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                30 Minutos
              </button>
              <button
                onClick={() => setSleepTimer(60)}
                className="text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                1 Hora
              </button>
              {sleepTimerSecondsLeft !== null && (
                <button
                  onClick={() => setSleepTimer(null)}
                  className="text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded-lg border-t border-white/5 mt-1"
                >
                  Cancelar Timer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Deck Layout: Left Vinyl Art + Right Track Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">

        {/* Left: Spinning Vinyl Disc & Album Art */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div
            onMouseEnter={() => setIsHoveringVinyl(true)}
            onMouseLeave={() => setIsHoveringVinyl(false)}
            className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center group cursor-pointer"
          >
            {/* Outer Pulsing Neon Aura Ring */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 ${
                isPlaying ? 'scale-105 opacity-80 animate-pulse' : 'scale-100 opacity-20'
              }`}
              style={{
                background: `radial-gradient(circle, ${accentHex} 0%, transparent 70%)`
              }}
            />

            {/* Vinyl Record Body */}
            <div
              className={`relative w-full h-full rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center transition-transform duration-1000 ${
                isPlaying ? 'animate-[spin_12s_linear_infinite]' : 'rotate-12'
              }`}
            >
              {/* Vinyl Groove Rings */}
              <div className="absolute inset-2 rounded-full border border-white/5" />
              <div className="absolute inset-6 rounded-full border border-white/5" />
              <div className="absolute inset-10 rounded-full border border-white/5" />
              <div className="absolute inset-14 rounded-full border border-white/5" />

              {/* Album Cover Center Disc Label */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-slate-700 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img
                  src={currentTrack?.coverUrl}
                  alt={currentTrack?.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* Center Vinyl Hole */}
                <div className="absolute inset-0 m-auto w-5 h-5 bg-slate-950 rounded-full border-2 border-slate-700 shadow-lg" />
              </div>
            </div>

            {/* Quick Hover Play Overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-400 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>
        </div>

        {/* Right: Track Information & Player Controls */}
        <div className="md:col-span-7 flex flex-col justify-center gap-4">

          {/* Genre Badge & Album */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {currentTrack?.album} ({currentTrack?.year || 2026})
            </span>
          </div>

          {/* Song Title & Artist */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white line-clamp-1 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
              {currentTrack?.title}
            </h2>
            <p className="text-base sm:text-lg font-medium text-cyan-400 mt-0.5">
              {currentTrack?.artist}
            </p>
          </div>

          {/* Audio Visualizer Inline Bar */}
          <div className="w-full rounded-xl bg-slate-950/60 p-2 border border-white/5">
            <AudioVisualizer height={55} compact />
          </div>

          {/* Time Progress Line */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 180}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 rounded-lg appearance-none bg-slate-800 accent-cyan-400 cursor-pointer transition-all"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Primary Controls Row */}
          <div className="flex items-center justify-between gap-4 pt-2">

            {/* Left Tools: Favorite & Lyrics */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(currentTrack?.id)}
                title={isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                  isFav
                    ? 'bg-pink-950/80 border-pink-500/50 text-pink-400'
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setLyricsOpen(true)}
                title="Ver Letras & Biografia do Artista"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95"
              >
                <FileText className="w-5 h-5" />
              </button>

              <button
                onClick={handleShare}
                title="Copiar link desta música"
                className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                  copied
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-white/10 text-slate-300 hover:text-cyan-400'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Center Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={previousTrack}
                title="Faixa Anterior"
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-white transition-all active:scale-90"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={toggleShuffle}
                title={isShuffled ? 'Aleatório: LIGADO • Clique para desligar' : 'Aleatório: DESLIGADO • Clique para ligar'}
                className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                  isShuffled
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-800 border-white/10 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Shuffle className={`w-4 h-4 ${isShuffled ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={togglePlay}
                title={isPlaying ? 'Pausar Rádio' : 'Reproduzir Rádio ao Vivo'}
                className="relative group p-4 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                title="Próxima Faixa"
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 hover:text-white transition-all active:scale-90"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right Tools: Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 sm:w-24 h-1.5 rounded-lg appearance-none bg-slate-800 accent-cyan-400 cursor-pointer"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
