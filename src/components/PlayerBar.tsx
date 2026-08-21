import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, FileText } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const PlayerBar: React.FC = () => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleFavorite,
    favorites,
    setLyricsOpen,
    currentTime,
    duration
  } = useRadioStore();

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const isFav = favorites.includes(currentTrack?.id);

  const formatTime = (s: number) => {
    if (isNaN(s) || s < 0) return '00:00';
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-slate-950/95 border-t border-white/10 shadow-2xl shadow-slate-950/90">
      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Left: Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={currentTrack?.coverUrl}
            alt={currentTrack?.title}
            className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
              {currentTrack?.title}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {currentTrack?.artist}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={previousTrack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Time display (desktop) */}
        <span className="hidden sm:block text-xs font-mono text-slate-500 tabular-nums min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Right: Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleFavorite(currentTrack?.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isFav ? 'text-pink-400' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setLyricsOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};