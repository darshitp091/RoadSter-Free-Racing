/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import type { ScoreEntry } from '../types';
import { Trophy, Trash2, ArrowLeft, Award, Sparkles } from 'lucide-react';

interface LeaderboardModalProps {
  onBack: () => void;
}

const DEFAULT_SCORES: ScoreEntry[] = [
  { id: '1', name: 'NEO', score: 38450, distance: 2450, date: 'Oct 20, 2026' },
  { id: '2', name: 'SKY', score: 29800, distance: 1980, date: 'Oct 21, 2026' },
  { id: '3', name: 'AEX', score: 24120, distance: 1620, date: 'Oct 22, 2026' },
  { id: '4', name: 'JET', score: 18900, distance: 1350, date: 'Oct 22, 2026' },
  { id: '5', name: 'CYB', score: 14500, distance: 1040, date: 'Oct 23, 2026' },
  { id: '6', name: 'ACE', score: 11200, distance: 890, date: 'Oct 23, 2026' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onBack }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = () => {
    try {
      const raw = localStorage.getItem('sky_roadster_top10');
      if (raw) {
        setScores(JSON.parse(raw));
      } else {
        // Seed initial default top scores
        localStorage.setItem('sky_roadster_top10', JSON.stringify(DEFAULT_SCORES));
        setScores(DEFAULT_SCORES);
      }
    } catch {
      setScores(DEFAULT_SCORES);
    }
  };

  const handleClearScores = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    try {
      localStorage.removeItem('sky_roadster_top10');
      setScores([]);
      setConfirmClear(false);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 pointer-events-auto">
      <div className="w-full max-w-xl bg-[#1a1235] border border-[#f55d2c]/40 rounded-2xl p-6 md:p-8 text-[#fff5eb] shadow-[0_0_50px_rgba(245,93,44,0.3)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#FFB547]" />
            <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">
              TOP 10 PILOTS
            </h2>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK [ESC]</span>
          </button>
        </div>

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto space-y-2 font-mono pr-1">
          {scores.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm">
              No scores recorded yet. Take the roadster out and set the record!
            </div>
          ) : (
            scores.map((entry, idx) => {
              const isTop3 = idx < 3;
              const rankColor =
                idx === 0
                  ? 'text-[#FFB547] border-[#FFB547]/40 bg-[#FFB547]/10'
                  : idx === 1
                  ? 'text-[#F4F1EA] border-white/30 bg-white/5'
                  : idx === 2
                  ? 'text-[#FF7A6B] border-[#FF7A6B]/40 bg-[#FF7A6B]/10'
                  : 'text-white/70 border-white/5 bg-black/30';

              return (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${rankColor} transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center font-black text-sm md:text-base">
                      #{idx + 1}
                    </span>
                    <span className="font-black text-base md:text-lg tracking-wider text-white">
                      {entry.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-black text-base md:text-lg tabular-nums text-[#3EE1F5]">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/50">
                        {entry.distance}m • {entry.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleClearScores}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              confirmClear
                ? 'bg-[#FF5470] text-white font-bold'
                : 'text-white/40 hover:text-[#FF5470]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmClear ? 'CONFIRM CLEAR ALL?' : 'Clear Scores'}</span>
          </button>

          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-lg bg-[#3EE1F5] hover:bg-[#5BF2A8] text-[#1B1640] font-black tracking-wider transition-colors cursor-pointer"
          >
            DRIVE NOW
          </button>
        </div>
      </div>
    </div>
  );
};
