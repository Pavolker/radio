import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Sparkles, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const AIRadioHostBanner: React.FC = () => {
  const { tracks, currentTrackIndex, stationInfo, isPlaying } = useRadioStore();
  const [hostText, setHostText] = useState<string>(
    `"Bem-vindos à SINAPSES DOS VENTOS 108.8 FM! Estação no ar 24 horas por dia com o melhor do synthwave, chillhop e ambiente do espaço digital."`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechEnabledRef = useRef(true); // ref síncrona para usar dentro de speakText

  const currentTrack = tracks[currentTrackIndex];
  const nextTrack = tracks[(currentTrackIndex + 1) % tracks.length];

  // Fala o texto usando a Web Speech API
  const speakText = useCallback((text: string) => {
    if (!speechEnabledRef.current) return;

    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn('Web Speech API não disponível neste navegador.');
      return;
    }

    try {
      // Cancela qualquer fala anterior
      synth.cancel();

      const cleanText = text.replace(/["""]/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('Erro na síntese de fala:', e.error);
        setIsSpeaking(false);
      };

      // Tenta usar voz em português do Brasil se disponível
      const voices = synth.getVoices();
      const ptVoice = voices.find(
        (v) => v.lang.startsWith('pt') && v.name.toLowerCase().includes('brazil')
      ) || voices.find((v) => v.lang.startsWith('pt'));
      if (ptVoice) utterance.voice = ptVoice;

      utteranceRef.current = utterance;
      synth.speak(utterance);
    } catch (err) {
      console.warn('Erro ao falar texto:', err);
      setIsSpeaking(false);
    }
  }, []); // sem dependência de speechEnabled — usa a ref

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
        const msg = `"${data.hostMessage}"`;
        setHostText(msg);
        speakText(data.hostMessage);
      }
    } catch (err) {
      console.warn('Erro ao carregar vinheta do locutor AI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically refresh AI host speech when track changes OR playback starts
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (isPlaying && currentTrack) {
      // Evita dupla chamada na inicialização
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        fetchAIHostJingle();
      }
    } else {
      hasFetchedRef.current = false;
    }
  }, [currentTrackIndex, isPlaying]);

  // Carrega vozes disponíveis (necessário em alguns navegadores)
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Workaround para Chrome: fala e cancela utterance vazio para "acordar" o speechSynthesis
    const warmup = new SpeechSynthesisUtterance('');
    warmup.volume = 0; // silencioso
    synth.speak(warmup);
    synth.cancel();

    // Força o carregamento das vozes (Chrome precisa desse trigger)
    synth.getVoices();

    const handleVoicesChanged = () => {
      synth.getVoices();
    };
    synth.onvoiceschanged = handleVoicesChanged;

    return () => {
      synth.cancel();
      synth.onvoiceschanged = null;
    };
  }, []);

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

      <div className="flex items-center gap-1.5">
        {/* Botão Ativar/Desativar Fala */}
        <button
          onClick={() => {
            if (speechEnabled) {
              // Desligando — cancela a fala
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
              speechEnabledRef.current = false;
            } else {
              // Ligando — fala o texto atual imediatamente
              speechEnabledRef.current = true;
              const cleanText = hostText.replace(/["""]/g, '');
              if (cleanText.trim()) {
                speakText(cleanText);
              }
            }
            setSpeechEnabled(!speechEnabled);
          }}
          title={speechEnabled ? 'Desativar voz do locutor' : 'Ativar voz do locutor'}
          className={`p-2 rounded-xl border transition-all shrink-0 active:scale-90 ${
            speechEnabled
              ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/30 hover:bg-indigo-800 hover:text-white'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/30 hover:text-slate-300'
          }`}
        >
          {speechEnabled && isSpeaking ? (
            <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
          ) : speechEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={fetchAIHostJingle}
          disabled={isGenerating}
          title="Gerar Nova Fala do Locutor AI"
          className="p-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all shrink-0 active:scale-90"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
