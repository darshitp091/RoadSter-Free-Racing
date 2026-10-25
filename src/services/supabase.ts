/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ScoreEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class SupabaseService {
  private client: SupabaseClient | null = null;
  public readonly isAvailable: boolean = false;

  constructor() {
    if (
      supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      supabaseAnonKey !== 'your-anon-key'
    ) {
      try {
        this.client = createClient(supabaseUrl, supabaseAnonKey);
        this.isAvailable = true;
      } catch (err) {
        console.warn('Supabase initialization failed:', err);
      }
    }
  }

  public async getLeaderboard(): Promise<ScoreEntry[]> {
    if (!this.client) {
      // Local fallback
      try {
        const raw = localStorage.getItem('sky_roadster_top10');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await this.client
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error || !data) throw error;
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        score: d.score,
        distance: d.distance,
        date: d.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      // Return local fallback on network error
      const raw = localStorage.getItem('sky_roadster_top10');
      return raw ? JSON.parse(raw) : [];
    }
  }

  public async submitScore(entry: ScoreEntry): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.from('leaderboard').insert([
        {
          id: entry.id,
          name: entry.name,
          score: entry.score,
          distance: entry.distance,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Failed to post score to Supabase:', err);
    }
  }

  public async saveWallet(coins: number): Promise<void> {
    if (!this.client) return;
    try {
      const userId = localStorage.getItem('sky_roadster_user_id') || 'guest_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('sky_roadster_user_id', userId);

      await this.client.from('user_wallets').upsert(
        {
          user_id: userId,
          coins,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch {}
  }

  public async recordMultiplayerMatch(result: {
    wager: number;
    winner: boolean;
    playerScore: number;
    rivalScore: number;
    rivalName: string;
  }): Promise<void> {
    if (!this.client) return;
    try {
      const userId = localStorage.getItem('sky_roadster_user_id') || 'guest';
      await this.client.from('multiplayer_matches').insert([
        {
          user_id: userId,
          wager: result.wager,
          won: result.winner,
          player_score: result.playerScore,
          rival_score: result.rivalScore,
          rival_name: result.rivalName,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {}
  }
}

export const supabaseService = new SupabaseService();
