// Dados compartilhados entre as Netlify Functions (ES Module)
// Fonte única de verdade: public/radio-catalog.json
// Este arquivo tenta ler do JSON e, se falhar (ex: produção Netlify),
// usa dados inline mantidos em sincronia com o JSON.

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Tenta carregar do JSON (funciona em dev, pode falhar no bundle Netlify)
let CATALOG, TRACKS;

function loadFromJson() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const jsonPath = join(__dirname, '..', '..', 'public', 'radio-catalog.json');
    if (!existsSync(jsonPath)) return false;
    const raw = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data?.tracks?.length) return false;
    TRACKS = data.tracks;
    CATALOG = {
      radio: data.radio || {},
      tracks: data.tracks,
      schedule: data.schedule || [],
      comments: data.comments || [],
    };
    return true;
  } catch {
    return false;
  }
}

// Fallback inline (usado quando o JSON não está disponível, ex: Netlify produção)
function loadInlineFallback() {
  const CDN = 'https://cdn.jsdelivr.net/gh/Pavolker/radio@main/public/musicas';
  TRACKS = [
    { id: 'track-001', title: 'A Doença Chegou', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'MPB / Blues', duration: 195, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/a-doenca-chegou.mp3`, accentColor: '#ec4899', secondaryColor: '#06b6d4' },
    { id: 'track-002', title: 'A Que Ficou de Pé', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'MPB', duration: 145, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/a-que-ficou-de-pe.mp3`, accentColor: '#8b5cf6', secondaryColor: '#3b82f6' },
    { id: 'track-003', title: 'Blues do Cansaço', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'Blues', duration: 260, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/blues-do-cansaco.mp3`, accentColor: '#f43f5e', secondaryColor: '#eab308' },
    { id: 'track-004', title: 'Leão que Pensa', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'MPB / Pop', duration: 183, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/leao-que-pensa.mp3`, accentColor: '#f97316', secondaryColor: '#a855f7' },
    { id: 'track-005', title: 'Ninguém Canta pra Mim', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'MPB', duration: 197, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/ninguem-canta-pra-mim.mp3`, accentColor: '#10b981', secondaryColor: '#0ea5e9' },
    { id: 'track-006', title: 'Sereia de Todas as Águas', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'Folk / MPB', duration: 101, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/sereia-de-todas-as-aguas.mp3`, accentColor: '#06b6d4', secondaryColor: '#6366f1' },
    { id: 'track-007', title: 'A Vida', artist: 'Pvolker', album: 'Pvolker', genre: 'MPB / Pop', duration: 180, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/a-vida.mp3`, accentColor: '#6366f1', secondaryColor: '#ec4899' },
    { id: 'track-008', title: 'Aqui Agora', artist: 'Pvolker', album: 'Pvolker', genre: 'Pop / MPB', duration: 133, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/aqui-agora.mp3`, accentColor: '#a855f7', secondaryColor: '#f97316' },
    { id: 'track-009', title: 'E Se Fosse', artist: 'Pvolker', album: 'Pvolker', genre: 'Pop / MPB', duration: 119, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/e-se-fosse.mp3`, accentColor: '#eab308', secondaryColor: '#10b981' },
    { id: 'track-010', title: 'Eu Vou Partir', artist: 'Pvolker', album: 'Pvolker', genre: 'MPB / Blues', duration: 254, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/eu-vou-partir.mp3`, accentColor: '#ef4444', secondaryColor: '#3b82f6' },
    { id: 'track-011', title: 'Passo Lento', artist: 'Pvolker', album: 'Pvolker', genre: 'Blues / MPB', duration: 251, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/passo-lento.mp3`, accentColor: '#f59e0b', secondaryColor: '#6366f1' },
    { id: 'track-012', title: 'Vôo Alto', artist: 'Pvolker', album: 'Pvolker', genre: 'MPB / Pop', duration: 298, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/voo-alto.mp3`, accentColor: '#0ea5e9', secondaryColor: '#a855f7' },
    { id: 'track-013', title: 'Curva do Espaço', artist: 'Pvolker', album: 'Pvolker', genre: 'MPB / Experimental', duration: 243, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/curva-do-espaco.mp3`, accentColor: '#8b5cf6', secondaryColor: '#06b6d4' },
    { id: 'track-014', title: 'Meia-noite e Meia', artist: 'Angélica Sátiro', album: 'Angélica Sátiro', genre: 'MPB / Blues', duration: 179, year: 2025, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80', audioUrl: `${CDN}/meia-noite-e-meia.mp3`, accentColor: '#6366f1', secondaryColor: '#f59e0b' },
  ];
  CATALOG = {
    radio: { name: 'SINAPSES DOS VENTOS', tagline: 'Frequência Autoral • Ondas Sonoras Brasileiras 24/7', description: 'A rádio que pulsa com a música autoral brasileira.', streamUrl: `${CDN}/a-vida.mp3`, frequency: '108.8 FM', djHost: 'DJ Sinapses AI', currentProgram: 'Nocturna Cyber Sessions' },
    tracks: TRACKS,
    schedule: [
      { id: 'prog-01', title: 'Amanhecer com MPB', host: 'DJ Sinapses AI', timeSlot: '06:00 - 10:00', genre: 'MPB', isCurrent: false },
      { id: 'prog-02', title: 'Blues do Meio-Dia', host: 'DJ Sinapses AI', timeSlot: '12:00 - 14:00', genre: 'Blues / MPB', isCurrent: false },
      { id: 'prog-03', title: 'Tarde Autoral', host: 'DJ Sinapses AI', timeSlot: '14:00 - 18:00', genre: 'Pop / MPB', isCurrent: true },
      { id: 'prog-04', title: 'Nocturna Cyber Sessions', host: 'DJ Sinapses AI', timeSlot: '22:00 - 06:00', genre: 'MPB / Experimental', isCurrent: false },
    ],
  };
}

// Executa: tenta JSON primeiro, fallback inline depois
if (!loadFromJson()) {
  loadInlineFallback();
}

export { TRACKS, CATALOG };