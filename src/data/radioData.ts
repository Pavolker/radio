import type {
  RadioStationInfo,
  Track,
  ProgramSchedule,
  ListenerComment,
  RadioCatalogJSON
} from '../types';

// Importa o catálogo do JSON (fonte única de verdade)
import catalog from './radio-catalog.json';

// Validação básica da estrutura do JSON
function validateCatalog(data: any): data is {
  cdn: string;
  radio: any;
  tracks: any[];
  schedule: any[];
  comments: any[];
} {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.cdn !== 'string') return false;
  if (!data.radio || typeof data.radio !== 'object') return false;
  if (!Array.isArray(data.tracks) || data.tracks.length === 0) return false;
  if (!Array.isArray(data.schedule)) return false;
  return true;
}

// Garante que o JSON é válido em tempo de execução
if (!validateCatalog(catalog)) {
  throw new Error(
    'Falha na validação do public/radio-catalog.json. ' +
    'Verifique se o arquivo contém os campos obrigatórios: cdn, radio, tracks.'
  );
}

const { cdn, radio, tracks: rawTracks, schedule: rawSchedule, comments: rawComments } = catalog;

// Constrói a estação de rádio tipada
export const INITIAL_STATION_INFO: RadioStationInfo = {
  name: radio.name || 'SINAPSES DOS VENTOS',
  tagline: radio.tagline || 'Frequência Autoral 24/7',
  frequency: radio.frequency || '108.8 FM',
  description: radio.description || '',
  streamUrl: radio.streamUrl || `${cdn}/a-vida.mp3`,
  backupStreamUrls: radio.backupStreamUrls || [],
  location: radio.location || 'Estúdio Central',
  currentProgram: radio.currentProgram || 'Nocturna Cyber Sessions',
  djHost: radio.djHost || 'DJ Sinapses AI',
  githubRepoUrl: radio.githubRepoUrl || '',
  githubJsonPath: radio.githubJsonPath || '',
  bitrateKbps: radio.bitrateKbps || 320,
  format: radio.format || 'HQ MP3 Stream'
};

// Converte tracks cruas para o tipo Track
export const INITIAL_TRACKS: Track[] = rawTracks.map((t: any, index: number) => ({
  id: t.id || `track-${String(index + 1).padStart(3, '0')}`,
  title: t.title || 'Faixa sem título',
  artist: t.artist || 'Artista desconhecido',
  album: t.album || 'Álbum desconhecido',
  coverUrl: t.coverUrl || '',
  audioUrl: t.audioUrl || `${cdn}/a-vida.mp3`,
  genre: t.genre || 'MPB',
  duration: typeof t.duration === 'number' && t.duration > 0 ? t.duration : 180,
  year: t.year,
  lyrics: t.lyrics,
  artistBio: t.artistBio,
  accentColor: t.accentColor || '#6366f1',
  secondaryColor: t.secondaryColor || '#ec4899'
}));

// Programação
export const INITIAL_SCHEDULE: ProgramSchedule[] = rawSchedule.map((s: any) => ({
  id: s.id || `prog-${Date.now()}`,
  title: s.title || 'Programação',
  host: s.host || 'DJ Sinapses AI',
  timeSlot: s.timeSlot || '00:00 - 23:59',
  genre: s.genre || 'MPB',
  coverImage: s.coverImage || '',
  description: s.description || '',
  isCurrent: s.isCurrent === true
}));

// Comentários iniciais
export const INITIAL_COMMENTS: ListenerComment[] = (rawComments || []).map((c: any) => ({
  id: c.id || `comm-${Date.now()}`,
  userName: c.userName || 'Ouvinte',
  userAvatar: c.userAvatar || '',
  text: c.text || '',
  timestamp: c.timestamp || 'Agora mesmo',
  reaction: c.reaction,
  isRequest: c.isRequest === true
}));

// Catálogo completo no formato RadioCatalogJSON (usado no servidor e no GitHub import)
export const DEFAULT_GITHUB_CATALOG: RadioCatalogJSON = {
  radio: {
    name: radio.name,
    tagline: radio.tagline,
    description: radio.description,
    streamUrl: radio.streamUrl,
    frequency: radio.frequency,
    djHost: radio.djHost,
    currentProgram: radio.currentProgram
  },
  tracks: INITIAL_TRACKS,
  schedule: INITIAL_SCHEDULE
};

// CDN URL exportada para uso em outros lugares
export const CDN_URL: string = cdn;