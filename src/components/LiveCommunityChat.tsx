import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Heart, Zap, Music, ThumbsUp, Flame, Radio } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const LiveCommunityChat: React.FC = () => {
  const { comments, addComment, tracks } = useRadioStore();
  const [inputText, setInputText] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('🔥');
  const [isSongRequest, setIsSongRequest] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addComment(inputText.trim(), selectedReaction, isSongRequest);
    triggerFloatingReaction(selectedReaction);
    setInputText('');
  };

  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 + 10;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  return (
    <div className="relative w-full rounded-3xl p-6 backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl text-white overflow-hidden">
      
      {/* Floating Emojis Animation Container */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingEmojis.map(({ id, emoji, x }) => (
          <div
            key={id}
            className="absolute bottom-10 text-3xl animate-[bounce_2s_infinite] transition-all duration-1000 opacity-0 animate-in fade-in slide-in-from-bottom-20"
            style={{ left: `${x}%` }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">
            Chat de Ouvintes & Pedidos Ao Vivo
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-emerald-400">1.482 Conectados</span>
        </div>
      </div>

      {/* Quick Reaction Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 mb-4">
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Enviar Reação Rápida:
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-around">
          {['🔥', '⚡', '💜', '🎧', '🌌'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setSelectedReaction(emoji);
                triggerFloatingReaction(emoji);
              }}
              className={`px-3 py-1.5 rounded-xl text-base transition-all active:scale-125 hover:bg-slate-800 ${
                selectedReaction === emoji ? 'bg-slate-800 ring-2 ring-cyan-400' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Comment List Feed */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {comments.map((comm) => (
          <div
            key={comm.id}
            className={`p-3 rounded-2xl border transition-all ${
              comm.isRequest
                ? 'bg-gradient-to-r from-purple-950/60 to-slate-950/80 border-purple-500/30'
                : 'bg-slate-950/50 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img
                  src={comm.userAvatar}
                  alt={comm.userName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                />
                <span className="text-xs font-bold text-slate-200">
                  {comm.userName}
                </span>
                {comm.isRequest && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-900/80 text-purple-300 border border-purple-500/40">
                    Pedido de Música
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                {comm.reaction && <span>{comm.reaction}</span>}
                <span>{comm.timestamp}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
              {comm.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isSongRequest
                ? "Digite o nome da música ou artista que deseja pedir..."
                : "Escreva uma mensagem para a comunidade da rádio..."
            }
            className="flex-1 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={isSongRequest}
              onChange={(e) => setIsSongRequest(e.target.checked)}
              className="rounded bg-slate-950 border-white/20 accent-cyan-400"
            />
            <Music className="w-3.5 h-3.5 text-pink-400" />
            <span>Marcar como pedido de música ao vivo</span>
          </label>
        </div>
      </form>

    </div>
  );
};
