/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, Award, Zap, Sparkles } from 'lucide-react';

interface AdSenseModalProps {
  onRewardGranted: () => void;
  onCancel: () => void;
}

export const AdSenseModal: React.FC<AdSenseModalProps> = ({ onRewardGranted, onCancel }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-lg bg-[#14151f] border-2 border-[#ffd166]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(255,209,102,0.3)] flex flex-col items-center text-center">
        {/* Top Tag */}
        <div className="flex items-center gap-2 bg-[#ffd166]/15 border border-[#ffd166]/40 px-3 py-1 rounded-full text-xs font-bold text-[#ffd166] mb-4">
          <ShieldCheck className="w-4 h-4 text-[#ffd166]" />
          <span>SPONSORED SECOND CHANCE REVIVAL</span>
        </div>

        {/* Sponsor Display Window Placeholder */}
        <div className="w-full h-44 md:h-52 rounded-xl bg-gradient-to-br from-[#1c1836] via-[#2d1b33] to-[#120d24] border border-white/10 flex flex-col items-center justify-center p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f55d2c]/20 via-transparent to-transparent pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-[#f55d2c]/20 border border-[#f55d2c] flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(245,93,44,0.6)]">
            <Zap className="w-8 h-8 text-[#ffd166] animate-pulse" />
          </div>

          <div className="text-base md:text-lg font-black text-white tracking-wider uppercase mb-1">
            SKY ROADSTER SPONSOR SPOTLIGHT
          </div>
          <div className="text-xs text-white/60 max-w-xs">
            Powered by Google AdSense partner network. Watch to revive at crash point with shield invulnerability!
          </div>

          {/* Countdown indicator */}
          <div className="absolute bottom-3 right-4 bg-black/80 px-2.5 py-1 rounded text-[11px] font-bold text-[#ffd166] border border-white/10">
            {countdown > 0 ? `Ad ends in ${countdown}s` : 'Reward Ready!'}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 w-full flex flex-col gap-3">
          {isCompleted ? (
            <button
              onClick={onRewardGranted}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#f55d2c] to-[#e62e43] text-black font-black text-sm md:text-base tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,209,102,0.7)] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-black" />
              CLAIM REVIVE & CONTINUE RACE
            </button>
          ) : (
            <div className="w-full py-3.5 px-6 rounded-xl bg-white/10 text-white/50 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2">
              <Play className="w-4 h-4 animate-spin" />
              Sponsor Clip Playing ({countdown}s)
            </div>
          )}

          <button
            onClick={onCancel}
            className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider py-1 cursor-pointer"
          >
            Cancel & Return to Game Over
          </button>
        </div>
      </div>
    </div>
  );
};
