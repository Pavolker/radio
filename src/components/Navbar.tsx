import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Radio,
  SlidersHorizontal,
  Maximize2,
  Moon,
  Sun,
  Keyboard,
  Users,
  Activity,
  BarChart3,
  Waves,
  Disc,
  Volume2,
  Headphones
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

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 bg-slate-950/85 text-white transition-colors duration-300 shadow-xl shadow-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4">
        
        {/* Left: Radio Station Logo & Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/" className="relative group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                currentPath === '/' || currentPath === ''
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Radio className="w-4 h-4 inline-block mr-2" />
              Rádio
            </Link>
            <Link
              to="/audicao"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                currentPath === '/audicao'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <Headphones className="w-4 h-4 inline-block mr-2 text-cyan-400" />
              Análise Sonora
            </Link>
          </div>
        </div>

        {/* Center: Live Status & Listener Count Badge */}
        <div className="hidden md:flex items-center gap-3.5 px-4 py-2 rounded-full bg-slate-900/90 border border-white/10 text-xs font-semibold shadow-inner">
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
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-mono">1.482 ouvintes</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <span className="text-[11px] font-mono text-pink-400 bg-pink-950/60 px-2.5 py-0.5 rounded-md border border-pink-500/30 font-bold">
            {currentBitrate} KBPS HQ
          </span>
        </div>

        {/* Right: Quick Control Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={cycleVisualizer}
            title={`Visualizador: ${visualizerMode.toUpperCase()} (Clique para alternar)`}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline capitalize">{visualizerMode}</span>
          </button>

          <button
            onClick={() => setEqualizerModalOpen(true)}
            title="Ajustar Equalizador Gráfico"
            className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-pink-400 transition-all active:scale-95 shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <button
            onClick={toggleCinemaMode}
            title="Modo Tela Cheia / Cinema Studio"
            className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-400 transition-all active:scale-95 shadow-sm"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShortcutsModalOpen(true)}
            title="Atalhos de Teclado"
            className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-amber-400 transition-all active:scale-95 hidden sm:block shadow-sm"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            title="Alternar Tema Escuro / Claro"
            className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-yellow-400 transition-all active:scale-95 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex items-center justify-center gap-1.5 pb-2.5 px-4">
        <Link
          to="/"
          className={`flex-1 text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentPath === '/' || currentPath === ''
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4 inline-block mr-1" />
          Rádio
        </Link>
        <Link
          to="/audicao"
          className={`flex-1 text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentPath === '/audicao'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:bg-slate-800/60'
          }`}
        >
          <Headphones className="w-4 h-4 inline-block mr-1 text-cyan-400" />
          Análise Sonora
        </Link>
      </div>
    </header>
  );
};