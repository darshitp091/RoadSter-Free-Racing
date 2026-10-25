/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LevelConfig } from '../types';

export const CAREER_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'STAGE 1: SUNSET RUNWAY',
    subtitle: 'Learn lane weaving and collect gold on the golden hour expressway.',
    targetDistance: 1500,
    targetNearMisses: 3,
    targetCoins: 5,
    rewardCoins: 150,
    unlocked: true,
    stars: 0,
  },
  {
    id: 2,
    name: 'STAGE 2: RUSH HOUR WEAVE',
    subtitle: 'Heavier traffic flow. Take flight to soar over the 3-lane roadblock!',
    targetDistance: 2500,
    targetNearMisses: 6,
    targetCoins: 10,
    rewardCoins: 250,
    unlocked: false,
    stars: 0,
  },
  {
    id: 3,
    name: 'STAGE 3: HYPERSONIC DUSK',
    subtitle: 'Maintain 260+ km/h while dodging commercial tempos and heavy rigs.',
    targetDistance: 3800,
    targetNearMisses: 8,
    targetCoins: 15,
    rewardCoins: 400,
    unlocked: false,
    stars: 0,
  },
  {
    id: 4,
    name: 'STAGE 4: CYBER MIDNIGHT BLITZ',
    subtitle: 'Survive in the dark teal cyber night and cross into the 5,000m Reflex Surge zone!',
    targetDistance: 5200,
    targetNearMisses: 12,
    targetCoins: 20,
    rewardCoins: 650,
    unlocked: false,
    stars: 0,
  },
  {
    id: 5,
    name: 'STAGE 5: APEX SPEED GOD',
    subtitle: 'Mach 2 warp velocity highway run. The ultimate test of human reflexes.',
    targetDistance: 7000,
    targetNearMisses: 16,
    targetCoins: 25,
    rewardCoins: 1000,
    unlocked: false,
    stars: 0,
  },
];
