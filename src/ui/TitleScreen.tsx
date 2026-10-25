/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Volume2, VolumeX, Trophy, Play, Zap, Flame, Sparkles, AlertTriangle, Disc, Users, Flag, Brain } from 'lucide-react';
import { walletService } from '../services/wallet';

interface TitleScreenProps {
  onStart: () => void;
  onOpenMultiplayer: () => void;
  onOpenLevels: () => void;
  onOpenReflexTest: () => void;
  onLeaderboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  personalBest: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenMultiplayer,
  onOpenLevels,
  onOpenReflexTest,
  onLeaderboard,
  isMuted,
  onToggleMute,
  personalBest,
}) => {
  const coins = walletService.getCoins();

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between items-center p-4 md:p-8 select-none bg-gradient-to-t from-[#141226]/95 via-black/40 to-[#f55d2c]/20 pointer-events-auto font-mono">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f55d2c] shadow-[0_0_12px_#f55d2c]" />
          <span className="text-xs font-bold tracking-widest text-[#ffd166] uppercase">
            SUNSET HIGHWAY // TESLA ROADSTER
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Gold Wallet */}
          <div className="flex items-center gap-1.5 text-xs text-[#ffd700] bg-black/60 px-3 py-1.5 rounded-lg border border-[#ffd700]/40 shadow-[0_0_12px_rgba(255,215,0,0.3)]">
            <Disc className="w-4 h-4 text-[#ffd700]" />
            <span className="font-bold tabular-nums">{coins.toLocaleString()}</span>
            <span className="text-[10px] text-white/50">COINS</span>
          </div>

          {personalBest > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#ffd166] bg-black/60 px-3 py-1.5 rounded-lg border border-[#ffd166]/40 shadow-[0_0_15px_rgba(255,209,102,0.2)]">
              <Trophy className="w-3.5 h-3.5" />
              BEST: <span className="font-bold tabular-nums">{personalBest.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-colors text-xs cursor-pointer"
            title="Toggle Mute (M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#ff5470]" /> : <Volume2 className="w-4 h-4 text-[#ffd166]" />}
            <span>[M]</span>
          </button>
        </div>
      </div>

      {/* Hero Title & Mode Launchers */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Emblem */}
        <div className="mb-2 relative">
          <svg width="84" height="46" viewBox="0 0 92 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_#f55d2c]">
            <path d="M6 38L26 12H66L86 38H6Z" stroke="#f55d2c" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
            <path d="M24 25H68" stroke="#ffd166" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="46" cy="25" r="6" fill="#ffd166" />
            <path d="M14 44H78" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.7" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-[#fff5eb] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)] uppercase">
          SKY ROADSTER
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffd166] via-[#f55d2c] to-[#ff2a55] text-2xl sm:text-4xl md:text-5xl not-italic tracking-normal mt-0.5">
            INFINITY
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#fff5eb]/80 max-w-lg font-sans mt-2 font-medium">
          Drive & fly down infinite sunset expressways. Dodge heavy trucks, survive 3-lane roadblocks, wager coins in online multiplayer, and surge past 5,000m at hypersonic warp speeds!
        </p>

        {/* Primary Action Button */}
        <button
          onClick={onStart}
          className="group relative mt-6 px-8 py-3.5 bg-gradient-to-r from-[#ffd166] to-[#f55d2c] hover:from-[#ffe082] hover:to-[#ff7043] text-[#1a1235] font-black text-base md:text-lg rounded-xl tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(245,93,44,0.6)] cursor-pointer flex items-center gap-2.5"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PRESS ENTER TO DRIVE</span>
        </button>

        {/* Secondary Mode Launchers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 w-full max-w-lg">
          <button
            onClick={onOpenMultiplayer}
            className="p-2.5 rounded-xl bg-gradient-to-b from-[#f55d2c]/20 to-black/60 border border-[#f55d2c]/50 hover:border-[#f55d2c] hover:brightness-125 transition-all flex flex-col items-center gap-1 cursor-pointer group shadow-[0_0_15px_rgba(245,93,44,0.2)]"
          >
            <Users className="w-4 h-4 text-[#f55d2c] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-white uppercase">MULTIPLAYER</span>
            <span className="text-[9px] text-[#ffd700] font-bold">100 COIN POT</span>
          </button>

          <button
            onClick={onOpenLevels}
            className="p-2.5 rounded-xl bg-gradient-to-b from-[#ffd166]/20 to-black/60 border border-[#ffd166]/50 hover:border-[#ffd166] hover:brightness-125 transition-all flex flex-col items-center gap-1 cursor-pointer group shadow-[0_0_15px_rgba(255,209,102,0.2)]"
          >
            <Flag className="w-4 h-4 text-[#ffd166] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-white uppercase">CAREER LEVELS</span>
            <span className="text-[9px] text-[#5bf2a8] font-bold">5 STAGES</span>
          </button>

          <button
            onClick={onOpenReflexTest}
            className="p-2.5 rounded-xl bg-gradient-to-b from-[#5bf2a8]/20 to-black/60 border border-[#5bf2a8]/50 hover:border-[#5bf2a8] hover:brightness-125 transition-all flex flex-col items-center gap-1 cursor-pointer group shadow-[0_0_15px_rgba(91,242,168,0.2)]"
          >
            <Brain className="w-4 h-4 text-[#5bf2a8] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-white uppercase">REFLEX TEST</span>
            <span className="text-[9px] text-white/50 font-bold">SPEED RATING</span>
          </button>

          <button
            onClick={onLeaderboard}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all flex flex-col items-center gap-1 cursor-pointer group"
          >
            <Trophy className="w-4 h-4 text-[#ffd166] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-white uppercase">LEADERBOARD</span>
            <span className="text-[9px] text-white/50 font-bold">TOP 10 [T]</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls & Flight Systems Guide */}
      <div className="w-full max-w-4xl bg-black/80 border border-[#f55d2c]/30 rounded-2xl p-3.5 md:p-4 text-white/90 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="text-[11px] font-bold tracking-widest text-[#ffd166] uppercase mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            CONTROLS: ← / A (LEFT) &nbsp;•&nbsp; → / D (RIGHT) &nbsp;•&nbsp; SPACE / W (FLY)
          </span>
          <span className="text-[#ff5470] hidden sm:flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> FLY OVER 3-LANE ROADBLOCKS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <div className="text-[#ffd166] font-bold">A / D or ← →</div>
            <div className="text-[10px] text-white/60">Correct 3-Lane Steering</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <div className="text-[#3ee1f5] font-bold">Space / W</div>
            <div className="text-[10px] text-white/60">Jump & Hold to Fly</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <div className="text-[#f55d2c] font-bold">/ or Shift</div>
            <div className="text-[10px] text-white/60">Rocket Turbo</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <div className="text-[#5bf2a8] font-bold">F Key</div>
            <div className="text-[10px] text-white/60">Air Flop Acrobatics</div>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
            <div className="text-[#ff7a6b] font-bold">Q / E</div>
            <div className="text-[10px] text-white/60">Barrel Roll Dodge</div>
          </div>
        </div>
      </div>
    </div>
  );
};
