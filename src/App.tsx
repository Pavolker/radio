import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MainPlayerCard } from './components/MainPlayerCard';

import { PoetryDisplay } from './components/PoetryDisplay';
import { RecentHistory } from './components/RecentHistory';

import { DynamicBackground } from './components/DynamicBackground';
import { EqualizerModal } from './components/EqualizerModal';
import { CinemaMode } from './components/CinemaMode';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { TrackList } from './components/TrackList';
import { PlayerBar } from './components/PlayerBar';
import { AudicaoPage } from './components/AudicaoPage';
import { useRadioStore } from './lib/store';
import { Radio, Heart, Globe, ShieldCheck, Sparkles, Play, Pause, X, Headphones } from 'lucide-react';
import type { Track } from './types';

/**
 * Localiza uma faixa no catálogo a partir de qualquer identificador de busca da URL:
 * - ID canônico ("track-031")
 * - Número ("31" ou "031")
 * - Slug do áudio ("folego" ou "blues-de-la-maquina-honesta")
 * - Título normalizado ("folego" ou "garca-branca")
 */
function findTrackByQuery(query: string, tracks: Track[]): { track: Track; index: number } | null {
  if (!query || !tracks || tracks.length === 0) return null;
  const clean = query.trim().toLowerCase();

  // 1. Match direto pelo ID (ex: "track-031")
  let idx = tracks.findIndex(t => t.id.toLowerCase() === clean);
  if (idx !== -1) return { track: tracks[idx], index: idx };

  // 2. Match por número (ex: "31", "031")
  const numMatch = clean.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    const candidateId = `track-${String(num).padStart(3, '0')}`;
    idx = tracks.findIndex(t => t.id.toLowerCase() === candidateId);
    if (idx !== -1) return { track: tracks[idx], index: idx };
  }

  // 3. Match por slug na URL do áudio (ex: "folego")
  idx = tracks.findIndex(t => t.audioUrl.toLowerCase().includes(clean));
  if (idx !== -1) return { track: tracks[idx], index: idx };

  // 4. Match por slug de título
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const qSlug = slugify(clean);
  idx = tracks.findIndex(t => {
    const tSlug = slugify(t.title);
    return tSlug === qSlug || tSlug.includes(qSlug) || qSlug.includes(tSlug);
  });
  if (idx !== -1) return { track: tracks[idx], index: idx };

  return null;
}

function HomePage() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    togglePlay,
    theme,
    isSharedTrackMode,
    exitSharedMode,
    nextTrack
  } = useRadioStore();
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const [dismissedBanner, setDismissedBanner] = useState(false);

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner de música compartilhada */}
      {isSharedTrackMode && !dismissedBanner && currentTrack && (
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-cyan-600/25 via-indigo-600/25 to-pink-600/25 border border-cyan-400/40 text-white backdrop-blur-2xl shadow-2xl shadow-cyan-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono font-bold uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-4 h-4 animate-pulse text-cyan-400" />
                  Música compartilhada exclusivamente com você
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-sm text-slate-300 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pausar' : 'Ouvir Agora'}</span>
              </button>

              <button
                onClick={() => {
                  exitSharedMode();
                  nextTrack();
                }}
                title="Sair da faixa individual e ouvir a programação contínua da rádio 24/7"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Ouvir Rádio 24/7</span>
              </button>

              <button
                onClick={() => setDismissedBanner(true)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-400 hover:text-white transition-all"
                title="Ocultar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centerpiece Hero Player */}
      <section id="player-hero">
        <MainPlayerCard />
      </section>

      {/* Poem & Biography */}
      <section id="poetry-section">
        <PoetryDisplay />
      </section>

      {/* Track List */}
      <section id="track-list-section">
        <TrackList />
      </section>



      {/* Two-Column Grid: History & Chat */}
      <section id="community-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <RecentHistory />
        </div>
        <div className="lg:col-span-6">

        </div>
      </section>
    </main>
  );
}

function BlogPage() {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-4xl mx-auto py-16 px-6 text-center">
        <div className="p-6 rounded-3xl backdrop-blur-2xl bg-slate-900/80 border border-white/10">
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/20">
              <Headphones className="w-12 h-12 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Em Breve</h2>
            <p className="text-slate-400 max-w-md leading-relaxed">
              O acervo de 200 análises musicais, 19 capítulos do livro "Filosofia da Música"
              e textos autorais de Paulo Volker serão publicados aqui em breve.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const {
    togglePlay,
    toggleMute,
    toggleCinemaMode,
    toggleFavorite,
    nextTrack,
    previousTrack,
    playTrack,
    currentTrackIndex,
    tracks,
    theme,
    stationInfo,
    setEqualizerModalOpen,
    setShortcutsModalOpen,
    isEqualizerModalOpen,
    isShortcutsModalOpen,
    isCinemaMode,
    setSharedTrackMode
  } = useRadioStore();

  const currentTrack = tracks[currentTrackIndex];

  // Ativação da faixa compartilhada exclusivamente via link (?track=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackQuery = params.get('track');
    if (trackQuery && tracks.length > 0) {
      const match = findTrackByQuery(trackQuery, tracks);
      if (match) {
        setSharedTrackMode(match.track.id);
        playTrack(match.index);
      }
    }
  }, [tracks, setSharedTrackMode, playTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'f' || e.key === 'F') toggleCinemaMode();
      else if (e.key === 'l' || e.key === 'L') { if (currentTrack) toggleFavorite(currentTrack.id); }
      else if (e.key === 'ArrowRight') nextTrack();
      else if (e.key === 'ArrowLeft') previousTrack();
      else if (e.key === 'Escape') {
        if (isEqualizerModalOpen) setEqualizerModalOpen(false);
        if (isShortcutsModalOpen) setShortcutsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleCinemaMode, toggleFavorite, nextTrack, previousTrack, currentTrack, isEqualizerModalOpen, isShortcutsModalOpen, setEqualizerModalOpen, setShortcutsModalOpen]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen relative font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}>
        
        {/* Animated Ambient Background */}
        <DynamicBackground />

        {/* Top Navbar */}
        <Navbar />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/audicao" element={<AudicaoPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl text-slate-400 py-10 mt-12 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-slate-950 font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white tracking-wider">
                  {stationInfo.name} ({stationInfo.frequency})
                </div>
                <p className="text-xs text-slate-500">{stationInfo.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <button onClick={() => setShortcutsModalOpen(true)} className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-xs leading-relaxed text-slate-500 max-w-3xl mx-auto">
              Essa rádio é o resultado do trabalho de produção de poemas e letras de{' '}
              <span className="text-slate-300 font-medium">Angélica Sátiro</span> e{' '}
              <span className="text-slate-300 font-medium">Paulo Volker</span>. O harness de
              desenvolvimento e gestão de IA é feito por{' '}
              <span className="text-cyan-400 font-semibold">Hermes</span> e a engenharia de
              estilos por <span className="text-cyan-400 font-semibold">Chopin</span>, com
              edição musical baseada na plataforma{' '}
              <span className="text-slate-300 font-medium">Suno</span>.
            </p>
          </div>
        </footer>

        {/* Fixed Bottom Player Bar */}
        <PlayerBar />

        {/* Modals */}
        <EqualizerModal />
        <KeyboardShortcutsModal />
        <CinemaMode />

      </div>
    </BrowserRouter>
  );
}