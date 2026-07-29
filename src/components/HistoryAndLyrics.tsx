import React, { useState } from 'react';
import { History, FileText, X, Heart, Play, Music, UserCheck, Sparkles } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const HistoryAndLyrics: React.FC = () => {
  const {
    history,
    tracks,
    currentTrackIndex,
    isLyricsOpen,
    setLyricsOpen,
    playTrack,
    favorites,
    toggleFavorite
  } = useRadioStore();

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const [activeTab, setActiveTab] = useState<'history' | 'lyrics'>('history');

  return (
    <>
      {/* Main Section */}
      <div className="w-full rounded-3xl p-6 backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl text-white">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico Recente
            </button>

            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'lyrics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Letra & Biografia
            </button>
          </div>

          <button
            onClick={() => setLyricsOpen(true)}
            className="text-xs text-cyan-400 hover:underline font-mono hidden sm:block"
          >
            Abrir em Tela Inteira →
          </button>
        </div>

        {/* Tab 1: Recently Played History */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <span className="text-[10px] font-mono text-slate-500">
                      Tocou às {playedAt}
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
              <p className="text-xs text-slate-500 italic py-4 col-span-3 text-center">
                O histórico de faixas tocará automaticamente conforme a transmissão ao vivo continuar.
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Track Lyrics Preview */}
        {activeTab === 'lyrics' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-xs text-slate-300">
                Exibindo letra e biografia de <strong className="text-white">{currentTrack?.title}</strong> por{' '}
                <strong className="text-cyan-300">{currentTrack?.artist}</strong>.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Letra da Música
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {currentTrack?.lyrics || 'Letra instrumental / Sem vocalização registrada.'}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Sobre o Artista
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto">
                  {currentTrack?.artistBio || 'Artista independente participante da rede de transmissão Aetheria Digital.'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Lyrics Full Modal Overlay */}
      {isLyricsOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-slate-950/90 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setLyricsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={currentTrack?.coverUrl}
                alt={currentTrack?.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  {currentTrack?.genre}
                </span>
                <h3 className="text-2xl font-black text-white">{currentTrack?.title}</h3>
                <p className="text-sm text-slate-300 font-medium">{currentTrack?.artist}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Letra Oficial
                </h4>
                <div className="p-5 rounded-2xl bg-slate-950 font-mono text-sm text-slate-200 whitespace-pre-line leading-relaxed border border-white/5">
                  {currentTrack?.lyrics || 'Música instrumental sem vocalização.'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Biografia do Artista
                </h4>
                <p className="p-5 rounded-2xl bg-slate-950 text-sm text-slate-300 leading-relaxed border border-white/5">
                  {currentTrack?.artistBio || 'Pioneiros da cena eletrônica digital e synthwave.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
