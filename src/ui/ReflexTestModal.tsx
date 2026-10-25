/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Gauge, Zap, Brain, ArrowLeft, Play, Flame, Award } from 'lucide-react';
import type { ReflexRating } from '../types';

interface ReflexTestModalProps {
  stats: ReflexRating;
  onPlayEndless: () => void;
  onBack: () => void;
}

export const ReflexTestModal: React.FC<ReflexTestModalProps> = ({ stats, onPlayEndless, onBack }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-lg bg-[#12131c] border-2 border-[#5bf2a8]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(91,242,168,0.3)] flex flex-col items-center text-center">
        {/* Header Tag */}
        <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[#5bf2a8] uppercase bg-[#5bf2a8]/10 border border-[#5bf2a8]/30 px-3.5 py-1 rounded-full mb-3">
          <Brain className="w-4 h-4 text-[#5bf2a8]" />
          REFLEX & PRESENCE OF MIND ASSESSMENT
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider uppercase mb-1">
          DRIVER REFLEX REPORT
        </h2>
        <p className="text-xs text-white/60 max-w-sm mb-6">
          Real-time measurement of your hazard detection, lane switch reaction latency, and high-speed presence of mind.
        </p>

        {/* Grade Badge */}
        <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#5bf2a8]/20 via-black to-[#12131c] border-2 border-[#5bf2a8] flex flex-col items-center justify-center mb-6 shadow-[0_0_35px_rgba(91,242,168,0.5)]">
          <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">RANK</span>
          <span className="text-4xl md:text-5xl font-black text-[#5bf2a8] drop-shadow-[0_0_15px_rgba(91,242,168,0.8)]">
            {stats.reflexGrade}
          </span>
          <span className="text-[9px] text-[#ffd166] font-bold">
            {stats.reflexGrade === 'S+'
              ? 'APEX TRANSCENDENT'
              : stats.reflexGrade === 'S'
              ? 'APEX ROADSTER'
              : stats.reflexGrade === 'A'
              ? 'HYPERSONIC PRO'
              : 'STREET PILOT'}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-white/50 uppercase font-bold">REACTION LATENCY</span>
            <div className="flex items-baseline gap-1 mt-1 text-2xl font-black text-[#5bf2a8]">
              {stats.averageReactionMs} <span className="text-xs text-white/50">MS</span>
            </div>
            <span className="text-[9px] text-white/40">Hazard response time</span>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-white/50 uppercase font-bold">TOP HIGHWAY SPEED</span>
            <div className="flex items-baseline gap-1 mt-1 text-2xl font-black text-white">
              {stats.topSpeedKmh} <span className="text-xs text-[#f55d2c]">KM/H</span>
            </div>
            <span className="text-[9px] text-white/40">Peak velocity recorded</span>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-white/50 uppercase font-bold">NEAR MISS REFLEXES</span>
            <div className="flex items-baseline gap-1 mt-1 text-2xl font-black text-[#ffd166]">
              {stats.nearMissCount} <span className="text-xs text-white/50">TIMES</span>
            </div>
            <span className="text-[9px] text-white/40">Razor-thin evasions</span>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-white/50 uppercase font-bold">5,000M REFLEX SURGE</span>
            <div className="flex items-baseline gap-1 mt-1 text-lg font-black text-white">
              {stats.warpSurgeAchieved ? (
                <span className="text-[#5bf2a8] flex items-center gap-1">
                  <Flame className="w-4 h-4 text-[#f55d2c]" /> UNLOCKED
                </span>
              ) : (
                <span className="text-white/40">LOCKED</span>
              )}
            </div>
            <span className="text-[9px] text-white/40">Reach 5,000m to unlock</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Title
          </button>

          <button
            onClick={onPlayEndless}
            className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#5bf2a8] via-[#ffd166] to-[#f55d2c] text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(91,242,168,0.6)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            TEST REFLEXES IN DRIVE
          </button>
        </div>
      </div>
    </div>
  );
};
