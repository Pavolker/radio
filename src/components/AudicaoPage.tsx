import React, { useState } from 'react';
import { useRadioStore } from '../lib/store';
import { Sparkles, Disc, Music, Headphones, Quote } from 'lucide-react';

export const AudicaoPage: React.FC = () => {
  const { tracks } = useRadioStore();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Find tracks that have audicao analysis
  const tracksWithAudicao = tracks.filter(t => t.audicao);
  const selectedTrack = tracksWithAudicao.find(t => t.id === selectedTrackId) || tracksWithAudicao[0];

  if (tracksWithAudicao.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-6 text-center">
        <div className="p-6 rounded-3xl backdrop-blur-2xl bg-slate-900/80 border border-white/10">
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/20">
              <Headphones className="w-12 h-12 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Audição em Preparação</h2>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Chopin está analisando cada música do acervo — extraindo pulso, tonalidade, dinâmica
              e traduzindo os números em poesia sonora. As análises aparecerão aqui assim que
              estiverem prontas.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-mono">Chopin no estúdio...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl p-6 backdrop-blur-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20">
            <Headphones className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Análise Sonora</h2>
            <p className="text-xs text-slate-400">
              {tracksWithAudicao.length} de {tracks.length} músicas analisadas por Chopin
            </p>
          </div>
        </div>

        {/* Track selector */}
        <div className="flex flex-wrap gap-2">
          {tracksWithAudicao.map(track => (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedTrack?.id === track.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <Music className="w-3 h-3" />
              {track.title}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Card */}
      {selectedTrack && selectedTrack.audicao && (
        <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-slate-900/80 border border-white/10">
          {/* Track header */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-white/10">
            <img
              src={selectedTrack.coverUrl}
              alt={selectedTrack.title}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
            />
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white">{selectedTrack.title}</h3>
              <p className="text-sm text-cyan-400">{selectedTrack.artist}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Analisado por {selectedTrack.audicao.autor} — {selectedTrack.audicao.data}
              </p>
            </div>
          </div>

          {/* Technical data grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Pulso', value: `${selectedTrack.audicao.tecnica.bpm} BPM`, icon: '♩' },
              { label: 'Tonalidade', value: selectedTrack.audicao.tecnica.tonalidade, icon: '♫' },
              { label: 'Dinâmica', value: `${selectedTrack.audicao.tecnica.dinamicaDb} dB`, icon: '↕' },
              { label: 'Corpo', value: `${selectedTrack.audicao.tecnica.percentualHarmonia}% harmonia / ${selectedTrack.audicao.tecnica.percentualPercussao}% percussão`, icon: '◉' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-xs text-slate-500 font-mono mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Poetic analysis text */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                A Audição de Chopin
              </span>
            </div>

            <div className="prose prose-invert max-w-none">
              {selectedTrack.audicao.texto.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-lg font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
                }
                if (line.startsWith('|')) {
                  // Skip table for now (rendered as data above)
                  return null;
                }
                if (line.startsWith('---')) {
                  return <hr key={i} className="border-white/10 my-6" />;
                }
                if (line.startsWith('**')) {
                  const bold = line.replace(/\*\*/g, '');
                  return <p key={i} className="text-base font-semibold text-cyan-300 leading-relaxed">{bold}</p>;
                }
                if (line.trim() === '') {
                  return <div key={i} className="h-3" />;
                }
                return (
                  <p key={i} className="text-sm leading-[1.85] text-slate-300 font-serif">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};