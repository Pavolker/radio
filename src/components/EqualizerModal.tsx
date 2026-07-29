import React from 'react';
import { SlidersHorizontal, X, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { useRadioStore } from '../lib/store';
import { EqualizerPreset, AudioEqualizerBands } from '../types';

export const EqualizerModal: React.FC = () => {
  const {
    isEqualizerModalOpen,
    setEqualizerModalOpen,
    equalizerPreset,
    setEqualizerPreset,
    equalizerBands,
    setEqualizerBand
  } = useRadioStore();

  if (!isEqualizerModalOpen) return null;

  const presetsList: { id: EqualizerPreset; label: string }[] = [
    { id: 'synthwave', label: 'Synthwave Glow' },
    { id: 'bass_boost', label: 'Bass Boost' },
    { id: 'vocal', label: 'Vocal Clarity' },
    { id: 'chillout', label: 'Chillout Space' },
    { id: 'club', label: 'Club Electro' },
    { id: 'flat', label: 'Flat (Neutro)' }
  ];

  const bandsList: { key: keyof AudioEqualizerBands; label: string; freq: string }[] = [
    { key: 'b60', label: 'GRAVES', freq: '60 Hz' },
    { key: 'b230', label: 'SUB-GRAVES', freq: '230 Hz' },
    { key: 'b910', label: 'MÉDIOS', freq: '910 Hz' },
    { key: 'b3k6', label: 'MÉDIO-ALTOS', freq: '3.6 kHz' },
    { key: 'b14k', label: 'AGUDOS', freq: '14 kHz' }
  ];

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setEqualizerModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Equalizador Gráfico DSP</h3>
            <p className="text-xs text-slate-400">
              Ajustes de áudio de alta fidelidade em tempo real via Web Audio API.
            </p>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="mb-6">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Presets Recomendados:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetsList.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setEqualizerPreset(preset.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  equalizerPreset === preset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg'
                    : 'bg-slate-950/50 hover:bg-slate-800 text-slate-300 border-white/5'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Equalizer Sliders */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4 mb-6">
          <div className="grid grid-cols-5 gap-3 text-center">
            {bandsList.map(({ key, label, freq }) => {
              const val = equalizerBands[key];
              return (
                <div key={key} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {val > 0 ? `+${val}` : val} dB
                  </span>
                  
                  {/* Vertical Slider */}
                  <div className="relative h-32 flex items-center justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={val}
                      onChange={(e) => setEqualizerBand(key, parseInt(e.target.value))}
                      className="w-28 h-2 appearance-none bg-slate-800 accent-cyan-400 cursor-pointer rounded-lg -rotate-90 origin-center"
                    />
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {freq}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setEqualizerPreset('flat')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar para Neutro</span>
          </button>

          <button
            onClick={() => setEqualizerModalOpen(false)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            Aplicar & Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
