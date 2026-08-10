import React, { useMemo, useRef, useEffect } from 'react';
import { BookOpen, User, Music, Sparkles, ChevronRight } from 'lucide-react';
import { useRadioStore } from '../lib/store';

interface Stanza {
  type: 'verse' | 'chorus' | 'bridge' | 'coda' | 'pre_chorus' | 'title' | 'outro' | 'intro' | 'unknown';
  label: string;
  lines: string[];
}

function parseStanzas(lyrics: string): Stanza[] {
  if (!lyrics) return [];
  const rawLines = lyrics.split('\n');
  const stanzas: Stanza[] = [];
  let current: Stanza | null = null;

  const classifyLabel = (line: string): Stanza['type'] => {
    const l = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (l.includes('refr') || l.includes('chorus') || l.includes('coro')) return 'chorus';
    if (l.includes('verso') || l.includes('ver') || l.includes('estrofe')) return 'verse';
    if (l.includes('ponte') || l.includes('bridge')) return 'bridge';
    if (l.includes('coda') || l.includes('sa') || l.includes('outro')) return 'coda';
    if (l.includes('pre') || l.includes('pr')) return 'pre_chorus';
    if (l.includes('intro') || l.includes('in')) return 'intro';
    if (l.includes('final') || l.includes('sussurr')) return 'outro';
    return 'unknown';
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current && current.lines.length > 0) {
        stanzas.push(current);
        current = null;
      }
      continue;
    }

    const bracketMatch = trimmed.match(/^\[(.+)\]$/i);
    if (bracketMatch) {
      if (current && current.lines.length > 0) {
        stanzas.push(current);
      }
      const label = bracketMatch[1].trim();
      current = { type: classifyLabel(label), label, lines: [] };
      continue;
    }

    if (!current) {
      current = { type: 'verse', label: '', lines: [] };
    }
    current.lines.push(trimmed);
  }

  if (current && current.lines.length > 0) {
    stanzas.push(current);
  }

  return stanzas;
}

const typeConfig: Record<Stanza['type'], { color: string; bg: string; label: string; icon?: boolean }> = {
  verse: { color: 'text-slate-200', bg: 'bg-slate-950/40', label: '' },
  chorus: { color: 'text-cyan-300', bg: 'bg-cyan-950/30', label: '' },
  bridge: { color: 'text-amber-300', bg: 'bg-amber-950/30', label: 'Ponte' },
  coda: { color: 'text-pink-300', bg: 'bg-pink-950/30', label: 'Coda' },
  pre_chorus: { color: 'text-emerald-300', bg: 'bg-emerald-950/30', label: 'Pré-refrão' },
  title: { color: 'text-slate-200', bg: 'bg-slate-950/40', label: '' },
  outro: { color: 'text-violet-300', bg: 'bg-violet-950/30', label: 'Final' },
  intro: { color: 'text-slate-300', bg: 'bg-slate-950/40', label: 'Intro' },
  unknown: { color: 'text-slate-200', bg: 'bg-slate-950/40', label: '' },
};

export const PoetryDisplay: React.FC = () => {
  const { tracks, currentTrackIndex, theme } = useRadioStore();
  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const [activeTab, setActiveTab] = React.useState<'poetry' | 'bio'>('poetry');
  const scrollRef = useRef<HTMLDivElement>(null);

  const stanzas = useMemo(() => parseStanzas(currentTrack?.lyrics || ''), [currentTrack?.lyrics]);
  const accentColor = currentTrack?.accentColor || '#6366f1';
  const secondaryColor = currentTrack?.secondaryColor || '#ec4899';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentTrackIndex]);

  const renderStanza = (stanza: Stanza, idx: number) => {
    const cfg = typeConfig[stanza.type];
    const isChorus = stanza.type === 'chorus';
    const isBridge = stanza.type === 'bridge';

    return (
      <div
        key={idx}
        className={`relative rounded-2xl p-4 sm:p-5 mb-4 border border-white/5 transition-all hover:border-white/10 ${cfg.bg}`}
        style={
          isChorus
            ? { borderLeft: `3px solid ${accentColor}` }
            : isBridge
            ? { borderLeft: `3px solid ${secondaryColor}` }
            : undefined
        }
      >
        {stanza.label && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-70" style={{ color: accentColor }}>
              {stanza.label}
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )}

        <div className="space-y-2">
          {stanza.lines.map((line, lIdx) => (
            <p
              key={lIdx}
              className={`font-serif text-sm sm:text-base leading-[1.8] ${cfg.color} ${
                line.startsWith('•') ? 'pl-4 border-l-2 border-white/10 italic opacity-70' : ''
              }`}
              style={
                isChorus && !line.startsWith('•')
                  ? { fontStyle: 'italic', textShadow: `0 0 20px ${accentColor}20` }
                  : undefined
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-500 ${
        theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80'
      }`}
    >
      {/* Header com Tabs */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10"
            style={{ boxShadow: `0 0 20px ${accentColor}15` }}
          >
            <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Poema & Biografia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentTrack?.title} — {currentTrack?.artist}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('poetry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'poetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Poema
          </button>
          <button
            onClick={() => setActiveTab('bio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'bio'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Biografia
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={scrollRef} className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'poetry' && (
          <>
            {stanzas.length > 0 ? (
              <div className="space-y-1">
                {stanzas.map(renderStanza)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">
                  Música instrumental — sem vocalização registrada.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'bio' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-lg font-bold text-white border border-white/10">
                {currentTrack?.artist?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentTrack?.artist}</h3>
                <p className="text-xs text-slate-400">{currentTrack?.album}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5">
              <p className="text-sm leading-[1.85] text-slate-300 font-serif">
                {currentTrack?.artistBio || 'Biografia do artista em breve.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <ChevronRight className="w-3.5 h-3.5" />
              <span>
                {currentTrack?.artist === 'Angélica Sátiro'
                  ? 'Filósofa, poeta e letrista — MPB, Blues, Poesia Sonora'
                  : currentTrack?.artist === 'Pvolker'
                  ? 'Escritor, filósofo e músico — Paradigma Conceitual'
                  : 'Artista autoral'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="h-8 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none mt-2" />
    </div>
  );
};
