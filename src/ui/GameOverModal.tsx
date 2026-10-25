/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import type { ScoreEntry, GameMode, MultiplayerStats, LevelConfig } from '../types';
import { RotateCcw, Trophy, Award, Zap, Sparkles, ShieldCheck, Home, Swords, CheckCircle2, Disc } from 'lucide-react';
import { supabaseService } from '../services/supabase';
import { walletService } from '../services/wallet';

interface GameOverModalProps {
  score: number;
  distance: number;
  timeSurvived: number;
  nearMisses: number;
  orbs: number;
  canRevive?: boolean;
  gameMode?: GameMode;
  multiplayer?: MultiplayerStats;
  currentLevel?: LevelConfig;
  levelCompleted?: boolean;
  onRestart: () => void;
  onViewLeaderboard: () => void;
  onReviveRequested?: () => void;
  onReturnToTitle?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  timeSurvived,
  nearMisses,
  orbs,
  canRevive = false,
  gameMode = 'ENDLESS',
  multiplayer,
  currentLevel,
  levelCompleted = false,
  onRestart,
  onViewLeaderboard,
  onReviveRequested,
  onReturnToTitle,
}) => {
  const [qualifiesForTop10, setQualifiesForTop10] = useState(false);
  const [initials, setInitials] = useState('ACE');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (gameMode !== 'ENDLESS') return;
    try {
      const raw = localStorage.getItem('sky_roadster_top10');
      const list: ScoreEntry[] = raw ? JSON.parse(raw) : [];
      if (list.length < 10 || score > (list[list.length - 1]?.score || 0)) {
        setQualifiesForTop10(true);
      }
    } catch {
      setQualifiesForTop10(true);
    }
  }, [score, gameMode]);

  const handleSaveScore = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saved) return;

    try {
      const raw = localStorage.getItem('sky_roadster_top10');
      const list: ScoreEntry[] = raw ? JSON.parse(raw) : [];

      const cleanName = (initials.trim().toUpperCase() || 'ACE').slice(0, 3);
      const newEntry: ScoreEntry = {
        id: Date.now().toString(),
        name: cleanName,
        score,
        distance,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      list.push(newEntry);
      list.sort((a, b) => b.score - a.score);
      const trimmed = list.slice(0, 10);

      localStorage.setItem('sky_roadster_top10', JSON.stringify(trimmed));
      supabaseService.submitScore(newEntry).catch(() => {});
      setSaved(true);
    } catch {
      setSaved(true);
    }
  };

  const isMultiplayer = gameMode === 'MULTIPLAYER' && multiplayer;
  const isLevelMission = gameMode === 'LEVELS' && currentLevel;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-mono">
      <div className="w-full max-w-lg bg-[#141424] border-2 border-[#f55d2c] rounded-2xl p-6 md:p-8 text-[#fff5eb] shadow-[0_0_60px_rgba(245,93,44,0.4)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Tag */}
        {isMultiplayer ? (
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-1 px-3 py-1 rounded-full bg-white/10 text-white">
            <Swords className="w-4 h-4 text-[#ffd166]" />
            MULTIPLAYER SPRINT RESULT
          </div>
        ) : isLevelMission ? (
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-1 px-3 py-1 rounded-full bg-white/10 text-white">
            <CheckCircle2 className="w-4 h-4 text-[#5bf2a8]" />
            {currentLevel.name}
          </div>
        ) : (
          <div className="text-xs font-bold tracking-widest text-[#f55d2c] uppercase mb-1">
            ROADSTER CRITICAL IMPACT // RUN CONCLUDED
          </div>
        )}

        {/* Title */}
        {isMultiplayer ? (
          multiplayer.isWinner ? (
            <div className="my-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-[#5bf2a8] uppercase drop-shadow-[0_0_20px_rgba(91,242,168,0.8)]">
                DERBY VICTORY!
              </h2>
              <p className="text-sm font-bold text-[#ffd700] mt-1">
                YOU WON THE POT: +200 GOLD COINS!
              </p>
            </div>
          ) : (
            <div className="my-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-[#e62e43] uppercase drop-shadow-[0_0_20px_rgba(230,46,67,0.8)]">
                DERBY DEFEAT!
              </h2>
              <p className="text-sm font-bold text-white/60 mt-1">
                LOST MATCH WAGER: -100 GOLD COINS
              </p>
            </div>
          )
        ) : isLevelMission ? (
          levelCompleted ? (
            <div className="my-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-[#ffd700] uppercase">
                STAGE CLEARED!
              </h2>
              <p className="text-sm font-bold text-[#5bf2a8] mt-1">
                MISSION COMPLETE! +{currentLevel.rewardCoins} GOLD COINS AWARDED!
              </p>
            </div>
          ) : (
            <div className="my-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-[#e62e43] uppercase">
                MISSION FAILED!
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Target objectives were not fulfilled. Watch sponsor or restart!
              </p>
            </div>
          )
        ) : (
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mb-5 uppercase">
            GAME OVER
          </h2>
        )}

        {/* Multiplayer Versus Box */}
        {isMultiplayer && (
          <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 mb-5 flex items-center justify-around text-xs">
            <div className="flex flex-col items-center">
              <span className="text-white/50 text-[10px] uppercase font-bold">YOU</span>
              <span className="text-lg font-black text-white mt-0.5">{score.toLocaleString()}</span>
              <span className="text-[10px] text-[#ffd166]">{distance}m</span>
            </div>
            <div className="text-xs font-black text-white/30 italic">VS</div>
            <div className="flex flex-col items-center">
              <span className="text-white/50 text-[10px] uppercase font-bold truncate max-w-[120px]">{multiplayer.rivalName}</span>
              <span className="text-lg font-black text-[#f55d2c] mt-0.5">{multiplayer.rivalScore.toLocaleString()}</span>
              <span className="text-[10px] text-[#ffd166]">{multiplayer.rivalDistance}m</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-5 font-mono">
          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex flex-col">
            <span className="text-[11px] text-[#ffd166] font-bold">FINAL SCORE</span>
            <span className="text-2xl font-black tabular-nums text-white mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 p-3 rounded-lg flex flex-col">
            <span className="text-[11px] text-[#f55d2c] font-bold">DISTANCE</span>
            <span className="text-2xl font-black tabular-nums text-white mt-0.5">
              {distance}m
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 p-2.5 rounded-lg flex flex-col">
            <span className="text-[10px] text-white/50 font-bold">NEAR MISSES</span>
            <span className="text-lg font-bold tabular-nums text-white mt-0.5">
              {nearMisses}
            </span>
          </div>

          <div className="bg-black/50 border border-[#ffd700]/30 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-bold uppercase flex items-center gap-1">
                <Disc className="w-3 h-3 text-[#ffd700]" />
                RUN COINS
              </span>
              <span className="text-sm font-black tabular-nums text-[#FFD700]">
                +{orbs}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
              <span className="text-[9px] text-white/40 font-bold uppercase">TOTAL BANK</span>
              <span className="text-xs font-black tabular-nums text-white">
                {walletService.getCoins().toLocaleString()} 🪙
              </span>
            </div>
          </div>
        </div>

        {/* REWARDED SPONSOR REVIVE / SECOND CHANCE BUTTON */}
        {canRevive && onReviveRequested && (
          <div className="w-full mb-5">
            <button
              onClick={onReviveRequested}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#f55d2c] to-[#e62e43] text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,209,102,0.6)] flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <ShieldCheck className="w-5 h-5 text-black" />
              <span>WATCH SPONSOR AD TO REVIVE (SECOND CHANCE)</span>
            </button>
            <span className="text-[10px] text-white/50 mt-1 inline-block">
              Respawn at crash location with 3.5s invulnerability shield
            </span>
          </div>
        )}

        {/* High Score Initials Submission */}
        {qualifiesForTop10 && !saved && (
          <form
            onSubmit={handleSaveScore}
            className="w-full mb-5 p-4 rounded-xl bg-black/50 border border-[#5BF2A8]/40 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-[#5BF2A8] font-mono font-bold">
              <Award className="w-4 h-4" /> TOP 10 QUALIFIED! ENTER INITIALS:
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
                className="w-24 bg-black border-2 border-[#5BF2A8] text-center font-mono font-black text-2xl tracking-widest text-[#5BF2A8] rounded py-1 uppercase focus:outline-none focus:ring-2 focus:ring-[#5BF2A8]"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#5BF2A8] text-[#1B1640] font-mono font-black text-sm rounded hover:bg-white transition-colors cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </form>
        )}

        {saved && (
          <div className="mb-5 text-xs font-mono text-[#5BF2A8] flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded border border-[#5BF2A8]/30">
            <Sparkles className="w-3.5 h-3.5" /> High score synced to Top 10 leaderboard!
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRestart}
            className="w-full flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#f55d2c] hover:bg-[#ffd166] text-black font-black rounded-xl text-xs md:text-sm tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(245,93,44,0.4)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (R)</span>
          </button>

          {gameMode === 'ENDLESS' && (
            <button
              onClick={onViewLeaderboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-mono font-bold rounded-xl text-xs tracking-wider transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#FFB547]" />
              <span>TOP 10</span>
            </button>
          )}

          {onReturnToTitle && (
            <button
              onClick={onReturnToTitle}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 font-mono font-bold rounded-xl text-xs tracking-wider transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>TITLE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
