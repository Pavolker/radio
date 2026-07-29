import React from 'react';
import {
  Radio,
  SlidersHorizontal,
  Maximize2,
  Moon,
  Sun,
  Github,
  Keyboard,
  Users,
  Activity,
  BarChart3,
  Waves,
  Disc,
  Volume2
} from 'lucide-react';
import { useRadioStore } from '../lib/store';
import { AudioVisualizerMode } from '../types';

export const Navbar: React.FC = () => {
  const {
    stationInfo,
    streamStatus,
    visualizerMode,
    setVisualizerMode,
    toggleCinemaMode,
    theme,
    toggleTheme,
    setGithubModalOpen,
    setEqualizerModalOpen,
    setShortcutsModalOpen,
    currentBitrate
  } = useRadioStore();

  const visualizerModesList: { id: AudioVisualizerMode; label: string; icon: React.ReactNode }[] = [
    { id: 'aurora', label: 'Aurora', icon: <Disc className="w-3.5 h-3.5" /> },
    { id: 'spectrum', label: 'Espectro', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'waveform', label: 'Onda', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'vumeter', label: 'VU Meter', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'particles', label: 'Partículas', icon: <Volume2 className="w-3.5 h-3.5" /> }
  ];

  const cycleVisualizer = () => {
    const modes: AudioVisualizerMode[] = ['aurora', 'spectrum', 'waveform', 'vumeter', 'particles'];
    const currentIdx = modes.indexOf(visualizerMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    setVisualizerMode(modes[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 bg-slate-950/80 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Radio Station Logo & Live Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative group flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {stationInfo.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {stationInfo.frequency}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs">
              {stationInfo.tagline}
            </p>
          </div>
        </div>

        {/* Center: Live Status & Listener Count Badge */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs font-medium">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2.5 w-2.5 ${streamStatus === 'live' ? 'opacity-100' : 'opacity-70'}`}>
              {streamStatus === 'live' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  streamStatus === 'live'
                    ? 'bg-emerald-500'
                    : streamStatus === 'connecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
            </span>
            <span className="uppercase tracking-wider font-semibold text-slate-200">
              {streamStatus === 'live'
                ? 'AO VIVO 24/7'
                : streamStatus === 'connecting'
                ? 'CONECTANDO...'
                : streamStatus === 'paused'
                ? 'PAUSADO'
                : 'OFFLINE'}
            </span>
          </div>

          <div className="h-3 w-px bg-white/20" />

          {/* Listener Count */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">1.482 ouvintes</span>
          </div>

          <div className="h-3 w-px bg-white/20" />

          {/* Bitrate Badge */}
          <span className="text-[10px] font-mono text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-500/30">
            {currentBitrate} KBPS HQ
          </span>
        </div>

        {/* Right: Quick Control Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Visualizer Mode Switcher */}
          <button
            onClick={cycleVisualizer}
            title={`Visualizador: ${visualizerMode.toUpperCase()} (Clique para alternar)`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline capitalize">{visualizerMode}</span>
          </button>

          {/* Equalizer Modal Toggle */}
          <button
            onClick={() => setEqualizerModalOpen(true)}
            title="Ajustar Equalizador Gráfico"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-pink-400 transition-all active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* GitHub Config Modal */}
          <button
            onClick={() => setGithubModalOpen(true)}
            title="Sincronizar Catálogo no GitHub"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Github className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline">GitHub Sync</span>
          </button>

          {/* Cinema / Studio Fullscreen Mode */}
          <button
            onClick={toggleCinemaMode}
            title="Modo Tela Cheia / Cinema Studio"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Shortcuts Guide */}
          <button
            onClick={() => setShortcutsModalOpen(true)}
            title="Atalhos de Teclado"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-amber-400 transition-all active:scale-95 hidden sm:block"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Alternar Tema Escuro / Claro"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-yellow-400 transition-all active:scale-95"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
