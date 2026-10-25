/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type * as THREE from 'three';

export type GameStatus =
  | 'TITLE'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAMEOVER'
  | 'LEADERBOARD'
  | 'MULTIPLAYER_LOBBY'
  | 'LEVELS_SELECT'
  | 'REFLEX_TEST';

export type GameMode = 'ENDLESS' | 'MULTIPLAYER' | 'LEVELS';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  distance: number;
  date: string;
}

// 0: Screen Left (+3.8), 1: Center (0), 2: Screen Right (-3.8)
export type LaneIndex = 0 | 1 | 2;

export interface MultiplayerStats {
  timeLeft: number;
  wagerCoins: number;
  rivalName: string;
  rivalScore: number;
  rivalDistance: number;
  rivalSpeedKmh: number;
  rivalLane: LaneIndex;
  matchFinished: boolean;
  isWinner: boolean | null; // true: player won +200, false: player lost -100
  coinsAwarded: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  targetDistance: number;
  targetNearMisses: number;
  targetCoins: number;
  rewardCoins: number;
  unlocked: boolean;
  stars: number; // 0 to 3
}

export interface ReflexRating {
  averageReactionMs: number;
  topSpeedKmh: number;
  reflexGrade: 'S+' | 'S' | 'A' | 'B' | 'C';
  warpSurgeAchieved: boolean;
  nearMissCount: number;
  distanceTraveled: number;
}

export interface GameStats {
  score: number;
  distance: number;
  speedKmh: number;
  flightFuel: number; // 0 to 1
  boostFuel: number; // 0 to 1
  combo: number;
  comboTimer: number;
  nearMissCount: number;
  orbsCollected: number;
  timeSurvived: number;
  isNewBest: boolean;
  isBoosting: boolean;
  isFlying: boolean;
  isRolling: boolean;
  isFlopping: boolean;
  nearMissFlash: boolean;
  roadblockWarning: boolean;
  lastEventMessage?: string;
  skyPhase?: string;

  // Game Mode & Special States
  gameMode: GameMode;
  currentLevel?: LevelConfig;
  levelCompleted?: boolean;
  warpSurgeActive?: boolean;
  multiplayer?: MultiplayerStats;
  walletCoins: number;
  canRevive: boolean;
  reviveCount: number;
  averageReactionMs: number;
}

export type TrafficType = 'car' | 'sports' | 'tempo' | 'truck' | 'xuv';

export interface TrafficCarData {
  id: number;
  mesh: THREE.Group;
  lane: LaneIndex;
  speed: number;
  active: boolean;
  type: TrafficType;
  color: number;
  width: number;
  height: number;
  length: number;
  wheels: THREE.Group[];
  passed: boolean;
  nearMissAwarded: boolean;
}

export interface CollectibleOrb {
  mesh: THREE.Group;
  lane: LaneIndex;
  z: number;
  y: number;
  active: boolean;
  rotSpeed: number;
}

export interface OverheadObstacle {
  mesh: THREE.Group;
  z: number;
  blockedLanes: LaneIndex[]; // lanes blocked by signboards or low clearance
  active: boolean;
  clearanceY: number;
  topY: number;
}
