import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MainPlayerCard } from './components/MainPlayerCard';
import { UpcomingSchedule } from './components/UpcomingSchedule';
import { HistoryAndLyrics } from './components/HistoryAndLyrics';
import { LiveCommunityChat } from './components/LiveCommunityChat';
import { DynamicBackground } from './components/DynamicBackground';
import { EqualizerModal } from './components/EqualizerModal';
import { CinemaMode } from './components/CinemaMode';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useRadioStore } from './lib/store';
import { Radio, Heart, Globe, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';

export default function App() {
  const {
    togglePlay,
    toggleMute,
    toggleCinemaMode,
    toggleFavorite,
    nextTrack,
    previousTrack,
    currentTrackIndex,
    tracks,
    theme,
    stationInfo,
    setEqualizerModalOpen,
    setShortcutsModalOpen,
    isEqualizerModalOpen,
    isShortcutsModalOpen,
    isCinemaMode
  } = useRadioStore();

  const currentTrack = tracks[currentTrackIndex];

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleCinemaMode();
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentTrack) toggleFavorite(currentTrack.id);
      } else if (e.key === 'ArrowRight') {
        nextTrack();
      } else if (e.key === 'ArrowLeft') {
        previousTrack();
      } else if (e.key === 'Escape') {
        if (isEqualizerModalOpen) setEqualizerModalOpen(false);
        if (isShortcutsModalOpen) setShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    toggleMute,
    toggleCinemaMode,
    toggleFavorite,
    nextTrack,
    previousTrack,
    currentTrack,
    isEqualizerModalOpen,
    isShortcutsModalOpen,
    setEqualizerModalOpen,
    setShortcutsModalOpen
  ]);

  return (
    <div className={`min-h-screen relative font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Animated Ambient Background */}
      <DynamicBackground />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Centerpiece Hero Player */}
        <section id="player-hero">
          <MainPlayerCard />
        </section>

        {/* Live Program Schedule & Upcoming Tracks */}
        <section id="schedule-section">
          <UpcomingSchedule />
        </section>

        {/* Two-Column Grid: Recently Played History & Community Live Chat */}
        <section id="community-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <HistoryAndLyrics />
          </div>
          <div className="lg:col-span-6">
            <LiveCommunityChat />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl text-slate-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-slate-950 font-bold">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-wider">
                {stationInfo.name} ({stationInfo.frequency})
              </div>
              <p className="text-xs text-slate-500">
                {stationInfo.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Atalhos de Teclado</span>
            </button>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Acessível & Otimizado</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono text-center md:text-right">
            © 2026 {stationInfo.name} • Transmissão Ininterrupta 24/7
            <div className="mt-1 text-[10px] text-slate-600">
              Copywriter MDH — Desenvolvido por Pvolker — Versão 1.0 — 2026
            </div>
          </div>

        </div>

        {/* Credit Line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/5">
          <p className="text-center text-xs leading-relaxed text-slate-500 max-w-3xl mx-auto">
            Essa rádio é o resultado do trabalho de produção de poemas e letras de{' '}
            <span className="text-slate-300 font-medium">Angélica Sátiro</span> e{' '}
            <span className="text-slate-300 font-medium">Paulo Volker</span>, mais o trabalho de{' '}
            <span className="text-cyan-400 font-semibold">Micélio</span>, uma IA especializada em
            produção, composição e edição musical, baseada na plataforma{' '}
            <span className="text-slate-300 font-medium">Suno</span>.
          </p>
        </div>
      </footer>

      {/* Modals & Fullscreen Overlays */}
      <EqualizerModal />
      <KeyboardShortcutsModal />
      <CinemaMode />

    </div>
  );
}
