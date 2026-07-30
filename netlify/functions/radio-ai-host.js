// Netlify Function: POST /api/radio/ai-host (ES Module)
// Locutor AI via Gemini (com fallback se não tiver chave)
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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const body = JSON.parse(event.body || '{}');
  const { currentTrack, nextTrack, stationName } = body;
  const name = stationName || CATALOG.radio.name;

  const geminiKey = process.env.GEMINI_API_KEY;

  // Sem chave Gemini → fallback padrão
  if (!geminiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hostMessage: `Você está ouvindo ${name}. Acabamos de ouvir "${currentTrack?.title || 'Música'}" por ${currentTrack?.artist || 'Artista'}. A seguir: "${nextTrack?.title || 'Próxima Faixa'}". Mantenha-se em sintonia 24/7!`,
        generatedByAI: false,
      }),
    };
  }

  // Com chave Gemini → gera mensagem com IA
  try {
    const prompt = `Você é um locutor de rádio cyberpunk/futurista e carismático em uma rádio digital premium em português chamada "${name}".
Escreva uma vinheta/fala curta (2 a 3 frases bem empolgantes, elegantes e poéticas) para ser dita ao vivo na rádio.
Música atual: "${currentTrack?.title || 'Música Atual'}" de ${currentTrack?.artist || 'Artista'}.
Próxima música: "${nextTrack?.title || 'Próxima Música'}" de ${nextTrack?.artist || 'Artista'}.
Use tom moderno, envolvente e focado na cultura da música digital.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const hostText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Transmissão contínua 24/7 na SINAPSES DOS VENTOS!';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ hostMessage: hostText, generatedByAI: true }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hostMessage: `Estação ${name} no ar 24 horas por dia. Conectado ao som do futuro!`,
        generatedByAI: false,
      }),
    };
  }
};
