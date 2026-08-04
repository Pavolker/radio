import React from 'react';
import { Play, Heart, Music, Clock } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const TrackList: React.FC = () => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    playTrack,
    favorites,
    toggleFavorite
  } = useRadioStore();

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full rounded-3xl backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl text-white overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-950/80 border border-pink-500/30 text-pink-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white tracking-wide">
              Todas as Faixas
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {tracks.length} músicas • {Math.floor(tracks.reduce((acc, t) => acc + t.duration, 0) / 60)} min
            </p>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-white/5">
        <span className="col-span-1 text-center">#</span>
        <span className="col-span-5">Título</span>
        <span className="col-span-3">Artista</span>
        <span className="col-span-2">Álbum</span>
        <span className="col-span-1 text-right">
          <Clock className="w-3.5 h-3.5 inline-block" />
        </span>
      </div>

      {/* Scrollable Track List */}
      <div className="overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {tracks.map((track, index) => {
          const isCurrent = index === currentTrackIndex;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id}
              onClick={() => playTrack(index)}
              className={`grid grid-cols-12 gap-4 items-center px-6 py-3 cursor-pointer transition-all duration-200 group ${
                isCurrent
                  ? 'bg-cyan-950/40 border-l-2 border-cyan-400'
                  : 'hover:bg-slate-800/60 border-l-2 border-transparent'
              }`}
            >
              {/* Track Number or Play Icon */}
              <div className="col-span-1 flex justify-center">
                {isCurrent && isPlaying ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                    {index + 1}
                  </span>
                )}
                <Play className="w-3.5 h-3.5 text-cyan-400 hidden group-hover:block fill-current" />
              </div>

              {/* Cover + Title */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-lg object-cover border shrink-0 transition-all duration-300 ${
                    isCurrent ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20' : 'border-white/10'
                  }`}
                />
                <div className="min-w-0">
                  <h4 className={`text-sm font-semibold truncate transition-colors ${
                    isCurrent ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {track.title}
                  </h4>
                  {/* Mobile: show artist below title */}
                  <p className="text-xs text-slate-400 truncate sm:hidden">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Artist (desktop only) */}
              <span className="hidden sm:block col-span-3 text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                {track.artist}
              </span>

              {/* Album (desktop only) */}
              <span className="hidden sm:block col-span-2 text-xs text-slate-500 truncate">
                {track.album}
              </span>

              {/* Duration + Favorite */}
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                    isFav
                      ? 'text-pink-400 opacity-100'
                      : 'text-slate-400 hover:text-pink-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};