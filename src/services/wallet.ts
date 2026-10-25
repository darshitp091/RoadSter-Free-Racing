/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { STARTING_WALLET_COINS } from '../game/constants';
import { supabaseService } from './supabase';

const WALLET_KEY = 'sky_roadster_wallet_coins';
const LEVELS_PROGRESS_KEY = 'sky_roadster_levels_progress';

export const walletService = {
  getCoins(): number {
    try {
      const stored = localStorage.getItem(WALLET_KEY);
      if (stored !== null) {
        return Math.max(0, parseInt(stored, 10) || 0);
      }
      // Initialize starting balance
      localStorage.setItem(WALLET_KEY, STARTING_WALLET_COINS.toString());
      return STARTING_WALLET_COINS;
    } catch {
      return STARTING_WALLET_COINS;
    }
  },

  addCoins(amount: number): number {
    const current = this.getCoins();
    const updated = current + Math.max(0, amount);
    try {
      localStorage.setItem(WALLET_KEY, updated.toString());
      supabaseService.saveWallet(updated).catch(() => {});
    } catch {
      // Ignore localStorage quotas
    }
    return updated;
  },

  deductCoins(amount: number): { success: boolean; balance: number } {
    const current = this.getCoins();
    if (current < amount) {
      return { success: false, balance: current };
    }
    const updated = current - amount;
    try {
      localStorage.setItem(WALLET_KEY, updated.toString());
      supabaseService.saveWallet(updated).catch(() => {});
    } catch {
      // Ignore
    }
    return { success: true, balance: updated };
  },

  getLevelProgress(): Record<number, { stars: number; completed: boolean }> {
    try {
      const raw = localStorage.getItem(LEVELS_PROGRESS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return {
      1: { stars: 0, completed: false },
    };
  },

  saveLevelStars(levelId: number, stars: number) {
    try {
      const progress = this.getLevelProgress();
      const prevStars = progress[levelId]?.stars || 0;
      progress[levelId] = {
        stars: Math.max(prevStars, stars),
        completed: true,
      };
      // Unlock next level
      if (progress[levelId + 1] === undefined) {
        progress[levelId + 1] = { stars: 0, completed: false };
      }
      localStorage.setItem(LEVELS_PROGRESS_KEY, JSON.stringify(progress));
    } catch {}
  },
};
