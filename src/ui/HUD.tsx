/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { GameStats } from '../types';
import {
  Volume2,
  VolumeX,
  Pause,
  Sparkles,
  Zap,
  Flame,
  AlertTriangle,
  Disc,
  Sunset,
  Swords,
  Timer,
  Flag,
} from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ stats, isMuted, onToggleMute, onPause }) => {
  const isMultiplayer = stats.gameMode === 'MULTIPLAYER' && stats.multiplayer;
  const isLevel = stats.gameMode === 'LEVELS' && stats.currentLevel;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-4 md:p-6 font-mono text-[#fff5eb]">
      {/* Near Miss Flash Overlay */}
      {stats.nearMissFlash && (
        <div className="absolute inset-0 bg-[#ffd166]/20 transition-opacity duration-150 animate-pulse pointer-events-none" />
      )}

      {/* ROADBLOCK IMMINENT WARNING BANNER */}
      {stats.roadblockWarning && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center animate-bounce">
          <div className="bg-[#e62e43] text-white px-6 py-2.5 rounded-2xl border-2 border-[#ffd166] shadow-[0_0_40px_rgba(230,46,67,0.95)] flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-pulse text-yellow-300" />
            <div className="flex flex-col text-center">
              <span className="font-black text-sm md:text-base tracking-widest uppercase">
                ROADBLOCK AHEAD! ALL LANES BLOCKED!
              </span>
              <span className="text-[11px] font-bold tracking-wider text-yellow-200">
                HOLD SPACE OR W TO ENGAGE FLIGHT & FLY OVER
              </span>
            </div>
            <AlertTriangle className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
        </div>
      )}

      {/* 5,000M HYPERSONIC WARP SURGE ALERT */}
      {stats.warpSurgeActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
          <div className="bg-gradient-to-r from-[#f55d2c] via-[#ff2a55] to-[#ffd166] text-black font-black text-xs md:text-sm px-4 py-1.5 rounded-full shadow-[0_0_25px_rgba(245,93,44,0.8)] border border-white flex items-center gap-2 animate-pulse">
            <Flame className="w-4 h-4 text-black fill-black" />
            <span>5,000M+ HYPERSONIC WARP VELOCITY SURGE ACTIVE</span>
            <Flame className="w-4 h-4 text-black fill-black" />
          </div>
        </div>
      )}

      {/* Top Header Cluster */}
      <div className="flex items-start justify-between w-full gap-4">
        {/* Score & Combo */}
        <div className="flex flex-col gap-1">
          <div className="text-[10px] md:text-xs tracking-widest text-[#ffd166] uppercase font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f55d2c] inline-block shadow-[0_0_10px_#f55d2c]" />
            SCORE
          </div>
          <div className="text-3xl md:text-5xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            {stats.score.toLocaleString()}
          </div>

          {/* Combo Multiplier Badge */}
          {stats.combo > 1 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-gradient-to-r from-[#ffd166] to-[#f55d2c] text-[#1a1235] font-black text-xs md:text-sm px-2.5 py-0.5 rounded shadow-[0_0_12px_rgba(255,209,102,0.6)]">
                {stats.combo}x MULTIPLIER
              </span>
              <div className="w-16 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-[#ffd166] transition-all duration-75"
                  style={{ width: `${Math.max(0, (stats.comboTimer / 3.5) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Personal Best Alert */}
          {stats.isNewBest && (
            <div className="flex items-center gap-1.5 text-xs text-[#5bf2a8] font-bold mt-1 tracking-wider bg-black/70 px-2 py-0.5 rounded border border-[#5bf2a8]/40 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              NEW PERSONAL BEST!
            </div>
          )}
        </div>

        {/* Center: Multiplayer Split / Level Objectives / Live Event Toast */}
        <div className="flex flex-col items-center gap-2">
          {/* MULTIPLAYER DERBY LIVE SPLIT */}
          {isMultiplayer && (
            <div className="bg-black/85 border border-[#f55d2c]/60 rounded-2xl px-5 py-2.5 shadow-[0_0_30px_rgba(245,93,44,0.5)] flex items-center gap-5">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-[#5bf2a8] font-bold uppercase">YOU</span>
                <span className="text-base font-black text-white">{stats.score.toLocaleString()}</span>
              </div>

              <div className="flex flex-col items-center px-2 border-x border-white/10">
                <div className="flex items-center gap-1 text-[#ffd166] text-xs font-black">
                  <Timer className="w-3.5 h-3.5 text-[#ffd166] animate-spin" />
                  <span>{Math.max(0, Math.ceil(stats.multiplayer!.timeLeft))}S</span>
                </div>
                <span className="text-[9px] text-white/50 font-bold uppercase mt-0.5">100 COIN WAGER</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] text-[#f55d2c] font-bold uppercase truncate max-w-[90px]">
                  {stats.multiplayer!.rivalName}
                </span>
                <span className="text-base font-black text-white">
                  {stats.multiplayer!.rivalScore.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* CAREER LEVEL MISSION PROGRESS */}
          {isLevel && (
            <div className="bg-black/80 border border-[#ffd166]/50 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(255,209,102,0.3)] flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-[#ffd166] font-bold">
                <Flag className="w-3.5 h-3.5" />
                <span>STAGE {stats.currentLevel!.id}</span>
              </div>
              <div className="text-white/60">
                Dist: <b className="text-white">{stats.distance}/{stats.currentLevel!.targetDistance}m</b>
              </div>
              <div className="text-white/60">
                Misses: <b className="text-[#ffd166]">{stats.nearMissCount}/{stats.currentLevel!.targetNearMisses}</b>
              </div>
              <div className="text-white/60">
                Coins: <b className="text-[#ffd700]">{stats.orbsCollected}/{stats.currentLevel!.targetCoins}</b>
              </div>
            </div>
          )}

          {/* Action Event Toast */}
          {stats.lastEventMessage && (
            <div className="animate-bounce bg-black/85 border border-[#ffd166]/80 text-[#ffd166] text-xs md:text-sm font-black tracking-widest px-5 py-1.5 rounded-full shadow-[0_0_24px_rgba(245,93,44,0.7)]">
              {stats.lastEventMessage}
            </div>
          )}
        </div>

        {/* Top Right: Distance, Sunset Phase, Gold Coins & Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/80 cursor-pointer transition-colors"
              title="Toggle Audio (M)"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#ff5470]" /> : <Volume2 className="w-4 h-4 text-[#ffd166]" />}
            </button>
            <button
              onClick={onPause}
              className="p-2 rounded-lg bg-black/60 border border-white/10 text-white/80 hover:text-white hover:bg-black/80 cursor-pointer transition-colors"
              title="Pause (Esc / P)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-[10px] md:text-xs tracking-widest text-white/60 uppercase">DISTANCE</div>
            <div className="text-xl md:text-2xl font-bold tabular-nums text-white">
              {stats.distance} <span className="text-xs text-[#ffd166]">M</span>
            </div>
            {stats.skyPhase && (
              <div className="flex items-center gap-1 text-[9px] md:text-[10px] tracking-wider text-[#ffd166] bg-black/70 px-2 py-0.5 rounded border border-[#ffd166]/30 mt-0.5 shadow-[0_0_10px_rgba(255,209,102,0.2)]">
                <Sunset className="w-3 h-3 text-[#f55d2c]" />
                <span className="font-bold">{stats.skyPhase}</span>
              </div>
            )}
          </div>

          {/* Gold Medallions Count */}
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg border border-[#ffd700]/40 text-xs text-[#ffd700] font-bold shadow-[0_0_12px_rgba(255,215,0,0.3)]">
            <Disc className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="tabular-nums">{stats.orbsCollected}</span>
            <span className="text-[10px] text-white/60">SESSION</span>
          </div>
        </div>
      </div>

      {/* Bottom Gauges: Speedometer, Flight Fuel, Rocket Turbo */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Speedometer */}
        <div className="flex items-baseline gap-1.5 bg-black/75 border border-[#f55d2c]/30 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <div className="text-2xl md:text-4xl font-black tabular-nums text-white">
            {stats.speedKmh}
          </div>
          <div className="text-[11px] font-bold text-white/60 tracking-wider">KM/H</div>
          {stats.isBoosting && (
            <span className="ml-1 text-[10px] text-[#f55d2c] font-black uppercase tracking-wider animate-pulse">
              ROCKET TURBO
            </span>
          )}
          {stats.warpSurgeActive && (
            <span className="ml-1 text-[10px] text-[#ffd166] font-black uppercase tracking-wider animate-pulse">
              ⚡ MACH WARP
            </span>
          )}
        </div>

        {/* Energy Meters (Flight Fuel & Rocket Turbo) */}
        <div className="flex items-center gap-4 bg-black/75 border border-[#f55d2c]/30 px-4 py-2.5 rounded-xl w-full max-w-md shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          {/* Flight Fuel */}
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider mb-1">
              <span className="flex items-center gap-1 text-[#3ee1f5]">
                <Zap className="w-3 h-3" /> FLIGHT [SPACE / W]
              </span>
              <span className="tabular-nums">{Math.round(stats.flightFuel * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/80 rounded-full p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  stats.flightFuel < 0.2 ? 'bg-[#ff5470]' : 'bg-[#3ee1f5] shadow-[0_0_8px_#3ee1f5]'
                }`}
                style={{ width: `${Math.max(0, stats.flightFuel * 100)}%` }}
              />
            </div>
          </div>

          {/* Rocket Turbo Fuel */}
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider mb-1">
              <span className="flex items-center gap-1 text-[#f55d2c]">
                <Flame className="w-3 h-3" /> TURBO [/ or SHIFT]
              </span>
              <span className="tabular-nums">{Math.round(stats.boostFuel * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/80 rounded-full p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#ffd166] to-[#f55d2c] rounded-full shadow-[0_0_8px_#f55d2c] transition-all duration-75"
                style={{ width: `${Math.max(0, stats.boostFuel * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Controls Cheatline */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/60 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
          <span><b className="text-white">← / A</b> Left</span>
          <span>•</span>
          <span><b className="text-white">→ / D</b> Right</span>
          <span>•</span>
          <span><b className="text-white">Space / W</b> Fly</span>
          <span>•</span>
          <span><b className="text-white">/ or Shift</b> Turbo</span>
          <span>•</span>
          <span><b className="text-white">F</b> Flop</span>
        </div>
      </div>
    </div>
  );
};
