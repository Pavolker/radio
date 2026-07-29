import React, { useState } from 'react';
import { Github, RefreshCw, X, CheckCircle2, AlertCircle, Copy, Code2, ExternalLink } from 'lucide-react';
import { useRadioStore } from '../lib/store';
import { DEFAULT_GITHUB_CATALOG } from '../data/radioData';

export const GitHubConfigModal: React.FC = () => {
  const {
    isGithubModalOpen,
    setGithubModalOpen,
    customGithubUrl,
    loadGithubCatalog,
    isFetchingGithub,
    githubError,
    tracks,
    stationInfo
  } = useRadioStore();

  const [inputUrl, setInputUrl] = useState(customGithubUrl);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isGithubModalOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    const success = await loadGithubCatalog(inputUrl.trim());
    if (success) {
      setSuccessMessage('Catálogo musical sincronizado com sucesso do GitHub!');
    }
  };

  const copySampleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(DEFAULT_GITHUB_CATALOG, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-slate-950/85 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setGithubModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sincronização de Catálogo via GitHub</h3>
            <p className="text-xs text-slate-400">
              Carregue e atualize a programação da rádio a partir de um repositório versionado no GitHub.
            </p>
          </div>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSync} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
              URL do Arquivo JSON no GitHub (Raw Content ou Repo):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/usuario/repo/main/radio-catalog.json"
                className="flex-1 bg-slate-950 border border-white/10 focus:border-emerald-400 rounded-2xl px-4 py-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isFetchingGithub}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingGithub ? 'animate-spin' : ''}`} />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {githubError && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{githubError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>

        {/* Current Sync Status Info */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2 mb-6">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Estação Atual:</span>
            <span className="text-white font-bold">{stationInfo.name}</span>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Total de Faixas Carregadas:</span>
            <span className="text-emerald-400 font-bold">{tracks.length} Músicas</span>
          </div>
        </div>

        {/* Schema Template Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Exemplo da Estrutura JSON do GitHub:
            </span>
            <button
              onClick={copySampleJson}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado!' : 'Copiar Modelo JSON'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 font-mono text-[11px] text-cyan-300 overflow-x-auto border border-white/5 max-h-48 scrollbar-thin">
            {JSON.stringify(DEFAULT_GITHUB_CATALOG, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
};
