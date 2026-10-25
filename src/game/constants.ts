/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Three lanes: 0 = Screen Left (+3.8), 1 = Center (0), 2 = Screen Right (-3.8)
export const LANES: [number, number, number] = [3.8, 0, -3.8];
export const LANE_CHANGE_DURATION = 0.12; // Ultra-snappy, silky lateral easing

export const ROAD_WIDTH = 14.0;
export const ROAD_SEGMENT_LENGTH = 50;
export const NUM_ROAD_SEGMENTS = 8; // Optimized segment count for high fps

export const INITIAL_SPEED = 42; // m/s (~151 km/h)
export const MAX_SPEED = 84; // m/s (~302 km/h) standard highway cap
export const BOOST_BONUS_SPEED = 32; // +115 km/h rocket turbo
export const SPEED_GROWTH_PER_METER = 0.006;

// Hypersonic Reflex Surge after 5,000 meters
export const WARP_SPEED_THRESHOLD = 5000; // meters
export const WARP_MAX_SPEED = 135; // m/s (~486 km/h) hypersonic reflex speed

// Multiplayer Derby & Coin Stakes
export const MULTIPLAYER_MATCH_DURATION = 60; // 60-second timed race sprint
export const MULTIPLAYER_WAGER_COINS = 100; // 100 Gold Coins stake to enter
export const MULTIPLAYER_REWARD_COINS = 200; // 200 Gold Coins reward for winning
export const STARTING_WALLET_COINS = 500; // Starting Gold Coins balance for every player

export const GRAVITY = 36;
export const JUMP_IMPULSE = 12.0;
export const SLAM_IMPULSE = -36;
export const FLIGHT_MAX_ALTITUDE = 5.8;
export const FLIGHT_HOVER_ACCEL = 32;
export const FLIGHT_FUEL_MAX = 3.2;
export const FLIGHT_REGEN_PER_SEC = 0.9;

export const BOOST_FUEL_MAX = 3.6;
export const BOOST_REGEN_PER_SEC = 0.7;

export const BARREL_ROLL_DURATION = 0.35;
export const AIR_FLOP_DURATION = 0.4;
export const ROLL_INVULN_WINDOW = 0.35;

export const NEAR_MISS_X_DISTANCE = 2.4;
export const NEAR_MISS_Z_DISTANCE = 4.0;

// Golden Hour Sunset Theme Palette
export const THEME_COLORS = {
  // Cinematic Sunset Horizon Sky & Fog
  skyZenith: 0x1a1235,   // Deep twilight purple at zenith
  skyHorizon: 0xf55d2c,  // Vibrant warm sunset orange/amber at horizon
  skySun: 0xffd166,      // Golden sun glow
  fogColor: 0x3d182b,    // Atmospheric sunset haze

  // Realistic highway asphalt
  roadAsphalt: 0x1f2026,
  roadLine: 0xffeed6,    // Retroreflective warm white lane dashes
  barrierMetal: 0x5a5e6c, // Galvanized highway steel

  // Tesla Roadster Signature Midnight Sunset Cherry Red
  roadsterCherry: 0x990d1e,
  roadsterCarbon: 0x121316,
  roadsterGlass: 0x0c0e14,
  roadsterCalipers: 0xee1526,
  roadsterRims: 0x30333c,

  // 24K Embossed Gold
  goldCoinCore: 0xffd700,
  goldCoinRim: 0xe6a800,
  goldCoinGlint: 0xfff0aa,

  // Realistic Traffic Paints
  trafficPaints: [
    0x0a0c10, // Midnight Obsidian
    0xa0a5b2, // Quicksilver Silver Metallic
    0x173a72, // Royal Sapphire Blue
    0x8f1422, // Deep Crimson
    0xf2f0eb, // Pure White
    0x383c44, // Gunmetal Graphite
    0xe08316, // Golden Sunset Amber (Commercial Tempo)
  ],
};
