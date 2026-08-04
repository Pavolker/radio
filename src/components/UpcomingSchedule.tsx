import React from 'react';
import { Calendar, Clock, Disc, Music, Play, Radio, User, Sparkles } from 'lucide-react';
import { useRadioStore } from '../lib/store';

export const UpcomingSchedule: React.FC = () => {
  const { schedule, tracks, currentTrackIndex, playTrack, isPlaying } = useRadioStore();

  const currentShow = schedule.find((s) => s.isCurrent) || schedule[3];

  // Upcoming tracks in rotation
  const upcomingTracks = Array.from({ length: 4 }, (_, i) => {
    const idx = (currentTrackIndex + i + 1) % tracks.length;
    return { track: tracks[idx], index: idx };
  });

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Current Show Highlight Card */}
      <div className="lg:col-span-5 rounded-3xl p-6 backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl flex flex-col justify-between text-white relative overflow-hidden group">
        
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/20 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              PROGRAMA NO AR
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentShow?.timeSlot}</span>
            </div>
          </div>

          <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
            {currentShow?.title}
          </h3>

          <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Apresentado por <strong className="text-white">{currentShow?.host}</strong></span>
          </div>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            {currentShow?.description}
          </p>
        </div>

        </div>

      {/* Upcoming Tracks Lineup */}
      <div className="lg:col-span-7 rounded-3xl p-6 backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-xl text-white">
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-pink-400 animate-spin-slow" />
            <h3 className="font-bold text-base tracking-wide text-white">
              A Seguir na Programação
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Sequência Automática</span>
        </div>

        <div className="space-y-3">
          {upcomingTracks.map(({ track, index }, i) => (
            <div
              key={track.id + i}
              onClick={() => playTrack(index)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-5 text-center font-bold">
                  #{i + 1}
                </span>

                <img
                  src={track.coverUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                />

                <div>
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {track.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {track.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
                <button className="p-2 rounded-full bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
