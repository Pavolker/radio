// Netlify Function: GET /api/radio/catalog
// Proxy do catálogo do GitHub + fallback para dados locais

const { CATALOG } = require('../shared/radio-data');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const targetUrl = event.queryStringParameters?.url;

  // Se não tiver URL, retorna catálogo local
  if (!targetUrl) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(CATALOG),
    };
  }

  // Tenta buscar do GitHub
  try {
    let rawUrl = targetUrl;
    if (rawUrl.includes('github.com') && !rawUrl.includes('raw.githubusercontent.com')) {
      rawUrl = rawUrl
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');
    }

    const fetchRes = await fetch(rawUrl, {
      headers: { 'User-Agent': 'Sinapses-Dos-Ventos-Radio-App/1.0' },
    });

    if (!fetchRes.ok) {
      return {
        statusCode: fetchRes.status,
        headers,
        body: JSON.stringify({
          error: `Não foi possível carregar o arquivo do GitHub (Status ${fetchRes.status})`,
        }),
      };
    }

    const catalogData = await fetchRes.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(catalogData),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Erro no proxy do GitHub: ${err.message}`,
        fallback: CATALOG,
      }),
    };
  }
};
