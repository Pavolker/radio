import React from 'react';
import { History, Play, Clock } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const RecentHistory: React.FC = () => {
  const { history, tracks, playTrack } = useRadioStore();

  return (
    <div className="w-full rounded-3xl p-6 backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl text-white">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
        <History className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-white">
          Histórico Recente
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.length > 0 ? (
          history.map(({ track, playedAt }, idx) => (
            <div
              key={track.id + idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-800/80 border border-white/5 transition-all group"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-cyan-300">
                  {track.title}
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {track.artist}
                </p>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {playedAt}
                </span>
              </div>
              <button
                onClick={() => {
                  const foundIdx = tracks.findIndex((t) => t.id === track.id);
                  if (foundIdx !== -1) playTrack(foundIdx);
                }}
                title="Tocar Novamente"
                className="p-2 rounded-full bg-slate-800 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic py-4 col-span-2 text-center">
            O histórico de faixas tocará automaticamente conforme a transmissão ao vivo continuar.
          </p>
        )}
      </div>
    </div>
  );
};
