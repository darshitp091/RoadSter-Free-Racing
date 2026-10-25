/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto">
      <div className="w-full max-w-xs bg-[#1a1235] border border-[#f55d2c]/40 rounded-2xl p-6 text-[#fff5eb] shadow-[0_0_40px_rgba(245,93,44,0.3)] flex flex-col items-center text-center">
        <div className="text-[10px] font-mono font-bold tracking-widest text-[#ffd166] uppercase mb-1">
          FLIGHT SYSTEMS
        </div>
        <h2 className="text-2xl font-black italic tracking-wider text-white mb-6 uppercase">
          PAUSED
        </h2>

        <div className="w-full flex flex-col gap-2.5 font-mono text-sm">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#ffd166] to-[#f55d2c] hover:from-[#ffe082] hover:to-[#ff7043] text-[#1a1235] font-black rounded-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME (ESC / P)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART (R)</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-black/40 hover:bg-black/60 text-white/80 font-bold rounded-lg border border-white/10 transition-colors cursor-pointer text-xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#FF5470]" /> : <Volume2 className="w-4 h-4 text-[#3EE1F5]" />}
            <span>AUDIO: {isMuted ? 'OFF' : 'ON'} [M]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
