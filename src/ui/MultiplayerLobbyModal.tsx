/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Users, Disc, Trophy, Swords, ShieldAlert, ArrowLeft, Play, Globe } from 'lucide-react';
import { MULTIPLAYER_MATCH_DURATION, MULTIPLAYER_WAGER_COINS, MULTIPLAYER_REWARD_COINS } from '../game/constants';
import { walletService } from '../services/wallet';

interface MultiplayerLobbyModalProps {
  onStartMatch: (rivalName: string) => void;
  onBack: () => void;
}

const RIVAL_NAMES = [
  'PhantomRoadster_99',
  'CyberViper_X',
  'NeonSpeedster',
  'ApexDrifter_88',
  'ThunderBolt_GT',
  'HyperDrive_Zero',
  'SolarFlare_404',
];

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  onStartMatch,
  onBack,
}) => {
  const [walletCoins, setWalletCoins] = useState<number>(() => walletService.getCoins());
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStatus, setSearchStatus] = useState<string>('Ready to Match');
  const [rivalName, setRivalName] = useState<string>('');

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletCoins);
    return () => unsubscribe();
  }, []);

  const handleEnterMatch = () => {
    if (walletCoins < MULTIPLAYER_WAGER_COINS) return;

    // Deduct 100 coins wager
    const { success, balance } = walletService.deductCoins(MULTIPLAYER_WAGER_COINS);
    if (!success) return;
    setWalletCoins(balance);

    setIsSearching(true);
    setSearchStatus('Searching for Online Rivals on Sunset Expressway...');

    setTimeout(() => {
      const selectedRival = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
      setRivalName(selectedRival);
      setSearchStatus(`Rival Matched: ${selectedRival}! Initializing Grid...`);

      setTimeout(() => {
        onStartMatch(selectedRival);
      }, 1500);
    }, 1800);
  };

  const hasEnoughCoins = walletCoins >= MULTIPLAYER_WAGER_COINS;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-xl bg-[#12131c] border-2 border-[#f55d2c]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(245,93,44,0.4)] flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-black tracking-widest text-[#f55d2c] uppercase bg-[#f55d2c]/10 border border-[#f55d2c]/30 px-3.5 py-1 rounded-full mb-3">
          <Globe className="w-4 h-4 text-[#f55d2c] animate-pulse" />
          ONLINE HIGHWAY MULTIPLAYER DERBY
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider uppercase mb-1">
          60-SECOND TIMED SPRINT
        </h2>
        <p className="text-xs md:text-sm text-white/60 text-center max-w-md mb-6">
          Race head-to-head on the same infinite highway. Higher score wins the{' '}
          <span className="text-[#ffd700] font-bold">{MULTIPLAYER_REWARD_COINS} Gold Coin</span> pot. The lower scorer loses their{' '}
          <span className="text-[#e62e43] font-bold">{MULTIPLAYER_WAGER_COINS} Coin</span> wager!
        </p>

        {/* Stake & Balance Card */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/60 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">YOUR WALLET</span>
            <div className="flex items-center gap-1.5 mt-1 text-xl md:text-2xl font-black text-[#ffd700]">
              <Disc className="w-5 h-5 text-[#ffd700]" />
              {walletCoins.toLocaleString()}
            </div>
            <span className="text-[9px] text-white/40">Gold Coins Available</span>
          </div>

          <div className="bg-black/60 border border-[#f55d2c]/40 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-[#f55d2c] uppercase tracking-widest font-bold">MATCH WAGER</span>
            <div className="flex items-center gap-1.5 mt-1 text-xl md:text-2xl font-black text-white">
              <Swords className="w-5 h-5 text-[#f55d2c]" />
              {MULTIPLAYER_WAGER_COINS}
            </div>
            <span className="text-[9px] text-[#5bf2a8] font-bold">Win Pot: +{MULTIPLAYER_REWARD_COINS}</span>
          </div>
        </div>

        {/* Matchmaking Status Box */}
        {isSearching ? (
          <div className="w-full bg-[#1b172e] border border-[#ffd166]/50 rounded-xl p-6 flex flex-col items-center text-center animate-pulse mb-6">
            <div className="w-12 h-12 rounded-full border-2 border-t-[#f55d2c] border-white/20 animate-spin mb-3" />
            <div className="text-sm font-black text-[#ffd166] tracking-wider uppercase mb-1">
              {searchStatus}
            </div>
            <div className="text-xs text-white/50">Synchronizing highway traffic seed & rival ghost telemetry...</div>
          </div>
        ) : (
          <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-6 flex flex-col gap-2 text-xs text-white/70">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-white/40">Duration:</span>
              <span className="font-bold text-white">{MULTIPLAYER_MATCH_DURATION} Seconds</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-white/40">Traffic & Hazard Sync:</span>
              <span className="font-bold text-white">Dynamic Global Seeds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40">Victory Rule:</span>
              <span className="font-bold text-[#5bf2a8]">Highest Score at 0:00 wins the pot</span>
            </div>
          </div>
        )}

        {/* Not enough coins warning */}
        {!hasEnoughCoins && !isSearching && (
          <div className="flex items-center gap-2 bg-[#e62e43]/20 border border-[#e62e43]/50 text-[#ffd166] text-xs px-4 py-2 rounded-xl mb-4 w-full">
            <ShieldAlert className="w-4 h-4 text-[#e62e43] shrink-0" />
            <span>You need at least 100 Gold Coins to enter. Play Endless Highway to collect coins on the road!</span>
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            disabled={isSearching}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Title
          </button>

          <button
            onClick={handleEnterMatch}
            disabled={!hasEnoughCoins || isSearching}
            className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#f55d2c] via-[#e62e43] to-[#ffd166] text-black font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(245,93,44,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-black" />
            WAGER 100 COINS & RACE
          </button>
        </div>
      </div>
    </div>
  );
};
