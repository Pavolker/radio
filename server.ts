import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DEFAULT_GITHUB_CATALOG } from "./src/data/radioData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Live Radio Status & Synchronized Broadcast State
  app.get("/api/radio/status", (req, res) => {
    const now = Date.now();
    // Simulate 24/7 continuous stream cycle based on total tracks duration (~1000s)
    const tracks = DEFAULT_GITHUB_CATALOG.tracks;
    const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0) || 1000;
    const currentCycleTime = Math.floor((now / 1000) % totalDuration);

    let accumulated = 0;
    let trackIndex = 0;
    let trackProgress = 0;

    for (let i = 0; i < tracks.length; i++) {
      if (currentCycleTime < accumulated + tracks[i].duration) {
        trackIndex = i;
        trackProgress = currentCycleTime - accumulated;
        break;
      }
      accumulated += tracks[i].duration;
    }

    // Dynamic simulated listener count (varies smoothly between 1200 and 1850)
    const listenerCount = 1420 + Math.floor(Math.sin(now / 60000) * 350 + Math.random() * 20);

    res.json({
      status: "live",
      serverTime: new Date().toISOString(),
      currentProgram: DEFAULT_GITHUB_CATALOG.radio.currentProgram || "Nocturna Cyber Sessions",
      djHost: DEFAULT_GITHUB_CATALOG.radio.djHost || "DJ Sinapses AI",
      listenerCount,
      synchronizedTrackIndex: trackIndex,
      synchronizedTrackProgressSeconds: trackProgress,
      bitrateKbps: 320,
      streamHealth: "100% Operational • 24/7 Live",
      ambientTemperature: "22°C Cyber-Studio Tokyo",
    });
  });

  // API 2: GitHub Catalog Proxy with raw fetch or fallback
  app.get("/api/radio/catalog", async (req, res) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
      return res.json(DEFAULT_GITHUB_CATALOG);
    }

    try {
      // Normalize raw github URLs if standard github repo link provided
      let rawUrl = targetUrl;
      if (rawUrl.includes("github.com") && !rawUrl.includes("raw.githubusercontent.com")) {
        rawUrl = rawUrl
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");
      }

      const fetchRes = await fetch(rawUrl, {
        headers: { "User-Agent": "Sinapses-Dos-Ventos-Radio-App/1.0" },
      });

      if (!fetchRes.ok) {
        return res.status(fetchRes.status).json({
          error: `Não foi possível carregar o arquivo do GitHub (Status ${fetchRes.status})`,
        });
      }

      const catalogData = await fetchRes.json();
      return res.json(catalogData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return res.status(500).json({ error: `Erro no proxy do GitHub: ${msg}` });
    }
  });

  // API 3: AI Radio DJ Host Speech Generation (OpenRouter)
  app.post("/api/radio/ai-host", async (req, res) => {
    const { currentTrack, nextTrack, stationName } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

    if (!apiKey) {
      return res.json({
        hostMessage: `Você está ouvindo ${stationName || "SINAPSES DOS VENTOS"}. Acabamos de ouvir "${currentTrack?.title || "Música"}" por ${currentTrack?.artist || "Artista"}. A seguir: "${nextTrack?.title || "Próxima Faixa"}". Mantenha-se sintonia 24/7!`,
        generatedByAI: false,
        provider: "fallback",
      });
    }

    try {
      const systemPrompt = `Você é o "DJ Sinapses AI", locutor de rádio cyberpunk/futurista e carismático de uma rádio digital premium em português chamada "SINAPSES DOS VENTOS".
Escreva vinhetas curtas (2 a 3 frases), empolgantes, elegantes e poéticas, para serem ditas ao vivo entre as músicas.
Use tom moderno, envolvente e focado na cultura da música autoral digital brasileira.
Responda APENAS com a fala do locutor, sem aspas, sem explicações, sem markdown.`;

      const userPrompt = `Música atual: "${currentTrack?.title || "Música Atual"}" de ${currentTrack?.artist || "Artista"}.
Próxima música: "${nextTrack?.title || "Próxima Música"}" de ${nextTrack?.artist || "Artista"}.
Escreva a vinheta do locutor para essa transição.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://radio-sv.netlify.app",
          "X-Title": "SINAPSES DOS VENTOS Radio",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 200,
          temperature: 0.9,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("OpenRouter error:", JSON.stringify(data));
        return res.json({
          hostMessage: `Estação ${stationName || "SINAPSES DOS VENTOS"} no ar 24 horas por dia. Conectado ao som do futuro!`,
          generatedByAI: false,
          provider: "fallback",
          error: data?.error?.message || "OpenRouter request failed",
        });
      }

      const hostText = data?.choices?.[0]?.message?.content?.trim() || "Transmissão contínua 24/7 na SINAPSES DOS VENTOS!";

      res.json({
        hostMessage: hostText,
        generatedByAI: true,
        provider: "openrouter",
      });
    } catch (err) {
      console.error("OpenRouter AI Radio Host error:", err);
      res.json({
        hostMessage: `Estação ${stationName || "SINAPSES DOS VENTOS"} no ar 24 horas por dia. Conectado ao som do futuro!`,
        generatedByAI: false,
      });
    }
  });

  // Vite development vs production static setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SINAPSES DOS VENTOS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
