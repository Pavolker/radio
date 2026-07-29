import React, { useState, useEffect } from 'react';
import { Mic, Sparkles, Volume2, RefreshCw } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const AIRadioHostBanner: React.FC = () => {
  const { tracks, currentTrackIndex, stationInfo, isPlaying } = useRadioStore();
  const [hostText, setHostText] = useState<string>(
    `"Bem-vindos à SINAPSES DOS VENTOS 108.8 FM! Estação no ar 24 horas por dia com o melhor do synthwave, chillhop e ambiente do espaço digital."`
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const currentTrack = tracks[currentTrackIndex];
  const nextTrack = tracks[(currentTrackIndex + 1) % tracks.length];

  const fetchAIHostJingle = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/radio/ai-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrack,
          nextTrack,
          stationName: stationInfo.name
        })
      });
      const data = await response.json();
      if (data && data.hostMessage) {
        setHostText(`"${data.hostMessage}"`);
      }
    } catch (err) {
      console.warn('Erro ao carregar vinheta do locutor AI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically refresh AI host speech when track changes
  useEffect(() => {
    if (isPlaying && currentTrack) {
      fetchAIHostJingle();
    }
  }, [currentTrackIndex]);

  return (
    <div className="w-full rounded-2xl p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 text-white backdrop-blur-xl shadow-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shrink-0">
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              VINHETA DO LOCUTOR ({stationInfo.djHost})
            </span>
          </div>
          <p className="text-xs text-slate-200 italic mt-0.5 line-clamp-2 leading-relaxed">
            {hostText}
          </p>
        </div>
      </div>

      <button
        onClick={fetchAIHostJingle}
        disabled={isGenerating}
        title="Gerar Nova Fala do Locutor AI"
        className="p-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all shrink-0 active:scale-90"
      >
        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
