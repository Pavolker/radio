// Netlify Function: GET /api/radio/status (ES Module)
import { TRACKS, CATALOG } from './shared/radio-data.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const now = Date.now();
  const totalDuration = TRACKS.reduce((acc, t) => acc + t.duration, 0);
  const currentCycleTime = Math.floor((now / 1000) % totalDuration);

  let accumulated = 0;
  let trackIndex = 0;
  let trackProgress = 0;

  for (let i = 0; i < TRACKS.length; i++) {
    if (currentCycleTime < accumulated + TRACKS[i].duration) {
      trackIndex = i;
      trackProgress = currentCycleTime - accumulated;
      break;
    }
    accumulated += TRACKS[i].duration;
  }

  const listenerCount = 1420 + Math.floor(Math.sin(now / 60000) * 350 + Math.random() * 20);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'live',
      serverTime: new Date().toISOString(),
      currentProgram: CATALOG.radio.currentProgram,
      djHost: CATALOG.radio.djHost,
      listenerCount,
      synchronizedTrackIndex: trackIndex,
      synchronizedTrackProgressSeconds: trackProgress,
      bitrateKbps: 320,
      streamHealth: '100% Operational • 24/7 Live',
      ambientTemperature: '22°C Cyber-Studio Tokyo',
    }),
  };
};
