// Netlify Function: POST /api/radio/ai-host (ES Module)
// Locutor AI via OpenRouter (meta-llama/llama-3.3-70b-instruct) com fallback padrão
import { TRACKS, CATALOG } from './shared/radio-data.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

const SYSTEM_PROMPT = `Você é o "DJ Sinapses AI", locutor de rádio cyberpunk/futurista e carismático de uma rádio digital premium em português chamada "SINAPSES DOS VENTOS".
Escreva vinhetas curtas (2 a 3 frases), empolgantes, elegantes e poéticas, para serem ditas ao vivo entre as músicas.
Use tom moderno, envolvente e focado na cultura da música autoral digital brasileira.
Responda APENAS com a fala do locutor, sem aspas, sem explicações, sem markdown.`;

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

  const apiKey = process.env.OPENROUTER_API_KEY;

  // Sem chave OpenRouter → fallback padrão
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hostMessage: `Você está ouvindo ${name}. Acabamos de ouvir "${currentTrack?.title || 'Música'}" por ${currentTrack?.artist || 'Artista'}. A seguir: "${nextTrack?.title || 'Próxima Faixa'}". Mantenha-se em sintonia 24/7!`,
        generatedByAI: false,
      }),
    };
  }

  // Com chave OpenRouter → gera mensagem com IA
  try {
    const userPrompt = `Música atual: "${currentTrack?.title || 'Música Atual'}" de ${currentTrack?.artist || 'Artista'}.
Próxima música: "${nextTrack?.title || 'Próxima Música'}" de ${nextTrack?.artist || 'Artista'}.
Escreva a vinheta do locutor para essa transição.`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://radio-sv.netlify.app',
        'X-Title': 'SINAPSES DOS VENTOS Radio',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter error:', JSON.stringify(data));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          hostMessage: `Estação ${name} no ar 24 horas por dia. Conectado ao som do futuro!`,
          generatedByAI: false,
          provider: 'fallback',
          error: data?.error?.message || 'OpenRouter request failed',
        }),
      };
    }

    const hostText = data?.choices?.[0]?.message?.content?.trim() || 'Transmissão contínua 24/7 na SINAPSES DOS VENTOS!';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ hostMessage: hostText, generatedByAI: true, provider: 'openrouter' }),
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
