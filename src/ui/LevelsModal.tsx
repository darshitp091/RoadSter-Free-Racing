/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Flag, Star, Lock, Disc, ArrowLeft, Play, Target } from 'lucide-react';
import { CAREER_LEVELS } from '../game/levelsData';
import { walletService } from '../services/wallet';
import type { LevelConfig } from '../types';

interface LevelsModalProps {
  onStartLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export const LevelsModal: React.FC<LevelsModalProps> = ({ onStartLevel, onBack }) => {
  const progress = walletService.getLevelProgress();
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const levels = CAREER_LEVELS.map((lvl) => {
    const isUnlocked = lvl.id === 1 || progress[lvl.id] !== undefined;
    const stars = progress[lvl.id]?.stars || 0;
    return {
      ...lvl,
      unlocked: isUnlocked,
      stars,
    };
  });

  const selectedLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-2xl bg-[#12131c] border-2 border-[#ffd166]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(255,209,102,0.3)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffd166]/15 border border-[#ffd166]/40 flex items-center justify-center">
              <Flag className="w-5 h-5 text-[#ffd166]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase">
                CAREER MISSIONS & LEVELS
              </h2>
              <p className="text-xs text-white/50">Complete high-speed objectives to unlock stages and earn Gold rewards</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg border border-[#ffd700]/30 text-xs text-[#ffd700] font-bold">
            <Disc className="w-4 h-4 text-[#ffd700]" />
            <span>{walletService.getCoins().toLocaleString()}</span>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 mb-6">
          {levels.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => lvl.unlocked && setSelectedLevelId(lvl.id)}
                disabled={!lvl.unlocked}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[90px] transition-all cursor-pointer ${
                  !lvl.unlocked
                    ? 'bg-black/30 border-white/5 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#f55d2c]/20 border-[#f55d2c] shadow-[0_0_15px_rgba(245,93,44,0.4)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                  STAGE {lvl.id}
                </div>
                {lvl.unlocked ? (
                  <div className="flex gap-0.5 my-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= lvl.stars
                            ? 'text-[#ffd700] fill-[#ffd700]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-white/30 my-1" />
                )}
                <span className="text-[9px] font-bold text-[#ffd700]">+{lvl.rewardCoins} COINS</span>
              </button>
            );
          })}
        </div>

        {/* Selected Level Detail Card */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-5 mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-black text-white tracking-wider">
              {selectedLevel.name}
            </h3>
            <span className="text-xs font-bold text-[#5bf2a8] bg-[#5bf2a8]/10 px-2.5 py-0.5 rounded border border-[#5bf2a8]/30">
              REWARD: +{selectedLevel.rewardCoins} GOLD
            </span>
          </div>
          <p className="text-xs text-white/70">{selectedLevel.subtitle}</p>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-white/10">
            <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-bold">DISTANCE</span>
              <span className="text-sm font-bold text-white mt-0.5">{selectedLevel.targetDistance}M</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-bold">NEAR MISSES</span>
              <span className="text-sm font-bold text-[#ffd166] mt-0.5">{selectedLevel.targetNearMisses}x</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-bold">GOLD ORBS</span>
              <span className="text-sm font-bold text-[#ffd700] mt-0.5">{selectedLevel.targetCoins} Coins</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Title
          </button>

          <button
            onClick={() => onStartLevel(selectedLevel)}
            className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#f55d2c] to-[#e62e43] text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,209,102,0.6)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            START STAGE MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
