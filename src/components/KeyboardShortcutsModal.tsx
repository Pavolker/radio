import React from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useRadioStore();

  if (!isShortcutsModalOpen) return null;

  const shortcuts = [
    { key: 'ESPAÇO', desc: 'Reproduzir / Pausar a rádio ao vivo' },
    { key: 'M', desc: 'Mutar / Desmutar o volume de áudio' },
    { key: 'F', desc: 'Ativar / Sair do Modo Cinema (Fullscreen)' },
    { key: 'L', desc: 'Adicionar / Remover faixa dos Favoritos' },
    { key: 'MÚSICA SEGUINTE (→)', desc: 'Avançar para a próxima faixa' },
    { key: 'MÚSICA ANTERIOR (←)', desc: 'Voltar para a faixa anterior' },
    { key: 'ESC', desc: 'Fechar modais ou sair do Modo Cinema' }
  ];

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-2xl bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        
        <button
          onClick={() => setShortcutsModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/30 text-amber-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Atalhos de Teclado</h3>
            <p className="text-xs text-slate-400">
              Controle a rádio SINAPSES DOS VENTOS sem tirar as mãos do teclado.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-cyan-300 font-mono font-bold text-[11px] shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShortcutsModalOpen(false)}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Entendido
        </button>

      </div>
    </div>
  );
};
