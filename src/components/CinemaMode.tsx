import React, { useEffect } from 'react';
import { Minimize2, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio, Heart } from 'lucide-react';
import { useRadioStore } from '../lib/store';
import { AudioVisualizer } from './AudioVisualizer';

export const CinemaMode: React.FC = () => {
  const {
    isCinemaMode,
    toggleCinemaMode,
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
    favorites,
    toggleFavorite,
    stationInfo
  } = useRadioStore();

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const isFav = favorites.includes(currentTrack?.id);

  // Close Cinema Mode on Esc Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        toggleCinemaMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaMode, toggleCinemaMode]);

  if (!isCinemaMode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${currentTrack?.accentColor || '#ec4899'} 0%, transparent 60%)`
        }}
      />

      {/* Top Floating HUD */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-wider text-white">
              {stationInfo.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              MODO CINEMA STUDIO • {stationInfo.frequency}
            </p>
          </div>
        </div>

        <button
          onClick={toggleCinemaMode}
          title="Sair do Modo Cinema (ESC)"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <Minimize2 className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Sair do Modo Cinema</span>
        </button>
      </div>

      {/* Centerpiece Showcase */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
        
        {/* Album Artwork & Vinyl */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-cyan-500/10 group">
            <img
              src={currentTrack?.coverUrl}
              alt={currentTrack?.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>
        </div>

        {/* Track Title, Artist & Lyrics */}
        <div className="md:col-span-7 space-y-4 text-left">

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white line-clamp-2">
            {currentTrack?.title}
          </h1>

          <p className="text-xl font-medium text-cyan-400">
            {currentTrack?.artist}
          </p>

          {/* Audio Visualizer */}
          <div className="pt-2">
            <AudioVisualizer height={100} />
          </div>

          {/* Floating Lyrics Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto whitespace-pre-line leading-relaxed">
            {currentTrack?.lyrics || 'Trilha sonora instrumental ao vivo.'}
          </div>
        </div>

      </div>

      {/* Bottom Controls HUD */}
      <div className="relative z-10 max-w-3xl mx-auto w-full backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-3xl p-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Favorite */}
        <button
          onClick={() => toggleFavorite(currentTrack?.id)}
          className={`p-3 rounded-2xl border transition-all ${
            isFav ? 'bg-pink-950 border-pink-500 text-pink-400' : 'bg-slate-800 border-white/10 text-slate-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Playback */}
        <div className="flex items-center gap-4">
          <button
            onClick={previousTrack}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-slate-400 hover:text-white">
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 appearance-none bg-slate-800 accent-cyan-400 rounded-lg cursor-pointer"
          />
        </div>

      </div>

    </div>
  );
};
