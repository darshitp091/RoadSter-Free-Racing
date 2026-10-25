/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  LANES,
  LANE_CHANGE_DURATION,
  ROAD_WIDTH,
  ROAD_SEGMENT_LENGTH,
  NUM_ROAD_SEGMENTS,
  INITIAL_SPEED,
  MAX_SPEED,
  BOOST_BONUS_SPEED,
  SPEED_GROWTH_PER_METER,
  WARP_SPEED_THRESHOLD,
  WARP_MAX_SPEED,
  MULTIPLAYER_MATCH_DURATION,
  MULTIPLAYER_WAGER_COINS,
  MULTIPLAYER_REWARD_COINS,
  GRAVITY,
  JUMP_IMPULSE,
  SLAM_IMPULSE,
  FLIGHT_MAX_ALTITUDE,
  FLIGHT_HOVER_ACCEL,
  FLIGHT_FUEL_MAX,
  FLIGHT_REGEN_PER_SEC,
  BOOST_FUEL_MAX,
  BOOST_REGEN_PER_SEC,
  BARREL_ROLL_DURATION,
  AIR_FLOP_DURATION,
  ROLL_INVULN_WINDOW,
  NEAR_MISS_X_DISTANCE,
  NEAR_MISS_Z_DISTANCE,
  THEME_COLORS,
} from './constants';
import type {
  GameStatus,
  GameMode,
  GameStats,
  TrafficCarData,
  CollectibleOrb,
  OverheadObstacle,
  LaneIndex,
  TrafficType,
  LevelConfig,
  MultiplayerStats,
  ReflexRating,
} from '../types';
import { PlayerRoadster } from './models/PlayerRoadster';
import { TrafficVehicleBuilder } from './models/TrafficVehicles';
import { RoadEnvironment } from './models/RoadEnvironment';
import { ParticleSystem } from './ParticleSystem';
import { soundEffects } from '../audio/SoundEffects';
import { SkySystem } from './SkySystem';
import { walletService } from '../services/wallet';
import { supabaseService } from '../services/supabase';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private isSoftwareGl: boolean = false;

  private player: PlayerRoadster;
  private roadEnv: RoadEnvironment;
  private particles: ParticleSystem;
  private skySystem: SkySystem;

  // Mode & Special Systems
  private gameMode: GameMode = 'ENDLESS';
  private warpSurgeActive: boolean = false;
  private topSpeedRecorded: number = 0;
  private reactionTimes: number[] = [];
  private hazardDetectedTime: number = 0;
  private invulnerableTimer: number = 0;
  private reviveCount: number = 0;

  // Career Levels
  private currentLevelConfig?: LevelConfig;
  private levelCompleted: boolean = false;

  // Multiplayer Rival
  private rivalRoadster: PlayerRoadster;
  private rivalPos = new THREE.Vector3(0, 0, 0);
  private rivalLane: LaneIndex = 2;
  private rivalSpeed: number = 55;
  private rivalScore: number = 0;
  private rivalDistance: number = 0;
  private rivalName: string = 'CyberViper_X';
  private multiplayerTimer: number = MULTIPLAYER_MATCH_DURATION;
  private multiplayerFinished: boolean = false;
  private multiplayerWinner: boolean | null = null;
  private rivalLaneTimer: number = 2.0;

  // Pools
  private trafficPool: TrafficCarData[] = [];
  private orbPool: CollectibleOrb[] = [];
  private gantryPool: OverheadObstacle[] = [];
  private activeGantries: OverheadObstacle[] = [];

  // Player state
  private playerPos = new THREE.Vector3(0, 0, 0);
  private currentLane: LaneIndex = 1;
  private targetLaneX: number = LANES[1];
  private laneTransitionTime: number = 0;
  private laneStartX: number = LANES[1];
  private verticalVelocity: number = 0;
  private isGrounded: boolean = true;
  private isFlying: boolean = false;
  private isBoosting: boolean = false;
  private isRolling: boolean = false;
  private rollTimer: number = 0;
  private rollDirection: number = 1;
  private isFlopping: boolean = false;
  private airFlopTimer: number = 0;

  // Roadblock hazard state (3-lane ground obstruction)
  private roadblockWarning: boolean = false;
  private nextRoadblockZ: number = 220;
  private activeRoadblockZ: number | null = null;
  private roadblockAlertPlayed: boolean = false;

  // Meters / Resources
  private forwardSpeed: number = INITIAL_SPEED;
  private distanceTraveled: number = 0;
  private flightFuel: number = FLIGHT_FUEL_MAX;
  private boostFuel: number = BOOST_FUEL_MAX;
  private score: number = 0;
  private combo: number = 1;
  private comboTimer: number = 0;
  private nearMissCount: number = 0;
  private orbsCollected: number = 0;
  private timeSurvived: number = 0;
  private personalBest: number = 0;
  private isNewBest: boolean = false;
  private nearMissFlashTimer: number = 0;
  private lastEventMessage: string = '';
  private eventMessageTimer: number = 0;
  private statsThrottleTimer: number = 0;

  // Camera & FX
  private cameraTarget = new THREE.Vector3();
  private screenShake: number = 0;

  // Loop & Control
  private gameStatus: GameStatus = 'TITLE';
  private frameId: number = 0;
  private lastTime: number = 0;
  private onStatsUpdate?: (stats: GameStats) => void;
  private onStatusChange?: (status: GameStatus) => void;

  // Spawner tracking
  private lastSpawnZ: number = 50;
  private lastGantryZ: number = 100;
  private lastOrbZ: number = 30;

  // Input states
  private keysHeld: { [key: string]: boolean } = {};

  constructor(
    container: HTMLElement,
    onStatsUpdate?: (stats: GameStats) => void,
    onStatusChange?: (status: GameStatus) => void
  ) {
    this.container = container;
    this.onStatsUpdate = onStatsUpdate;
    this.onStatusChange = onStatusChange;

    // Detect software GL
    this.detectSoftwareGl();

    // 1. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Sunset Golden-Hour Atmosphere Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(THEME_COLORS.skyZenith);
    this.scene.fog = new THREE.FogExp2(THEME_COLORS.fogColor, 0.0055);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // 4. Lighting & Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm Sunset Hemisphere Light
    this.hemiLight = new THREE.HemisphereLight(0xffcaa0, 0x2d1a28, 1.25);
    this.scene.add(this.hemiLight);

    // Golden Sunset Directional Sunlight from the horizon
    this.dirLight = new THREE.DirectionalLight(0xffaa50, 2.2);
    this.dirLight.position.set(15, 35, 120);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 180;
    this.dirLight.shadow.camera.left = -18;
    this.dirLight.shadow.camera.right = 18;
    this.dirLight.shadow.camera.top = 18;
    this.dirLight.shadow.camera.bottom = -18;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // 5. Initialize Components
    this.roadEnv = new RoadEnvironment();
    this.particles = new ParticleSystem();
    this.player = new PlayerRoadster();
    this.skySystem = new SkySystem();

    // Rival Roadster (Neon Cyber Blue for Multiplayer)
    this.rivalRoadster = new PlayerRoadster(0x00d2ff);
    this.rivalRoadster.group.visible = false;

    this.scene.add(this.skySystem.mesh);
    this.scene.add(this.player.group);
    this.scene.add(this.rivalRoadster.group);
    this.scene.add(this.particles.points);
    this.scene.add(this.particles.speedLines);

    // Add architectural tiered skyscrapers & glowing sunset horizon disc
    const skyline = this.roadEnv.createArchitecturalSkyline();
    this.scene.add(skyline);
    this.roadEnv.cityBuildingsGroup = skyline;

    // Load personal best
    this.loadPersonalBest();

    // 6. Build Initial World & Object Pools
    this.initRoadSegments();
    this.initPools();

    // 7. Event listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);

    // Set initial camera
    this.resetCar(false);
    this.updateCamera(0.016);

    // Start loop
    this.lastTime = performance.now();
    this.tick();
  }

  private detectSoftwareGl() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = false;
    }
  }

  private loadPersonalBest() {
    try {
      const raw = localStorage.getItem('sky_roadster_top10');
      if (raw) {
        const scores = JSON.parse(raw);
        if (scores && scores.length > 0) {
          this.personalBest = scores[0].score || 0;
        }
      }
    } catch {
      this.personalBest = 0;
    }
  }

  private initRoadSegments() {
    for (let i = 0; i < NUM_ROAD_SEGMENTS; i++) {
      const seg = this.roadEnv.createRoadSegment(i);
      seg.position.z = i * ROAD_SEGMENT_LENGTH - ROAD_SEGMENT_LENGTH;
      this.scene.add(seg);
      this.roadEnv.roadSegments.push(seg);
    }
  }

  private initPools() {
    // 1. Traffic Car Pool (24 vehicles)
    const types: TrafficType[] = ['tempo', 'truck', 'xuv', 'car', 'sports'];
    for (let i = 0; i < 24; i++) {
      const type = types[i % types.length];
      const colorHex = THEME_COLORS.trafficPaints[i % THEME_COLORS.trafficPaints.length];
      const vehicleRes = TrafficVehicleBuilder.createVehicle(type, colorHex);
      vehicleRes.group.visible = false;
      this.scene.add(vehicleRes.group);

      this.trafficPool.push({
        id: i,
        mesh: vehicleRes.group,
        lane: 1,
        speed: 25,
        active: false,
        type,
        color: colorHex,
        width: vehicleRes.width,
        height: vehicleRes.height,
        length: vehicleRes.length,
        wheels: vehicleRes.wheels,
        passed: false,
        nearMissAwarded: false,
      });
    }

    // 2. 24K Gold Coin Pool (30 medallions)
    for (let i = 0; i < 30; i++) {
      const orb = this.roadEnv.createCollectibleOrb();
      orb.active = false;
      orb.mesh.visible = false;
      this.scene.add(orb.mesh);
      this.orbPool.push(orb);
    }

    // 3. Overhead Highway Gantry Pool (4 gantries)
    for (let i = 0; i < 4; i++) {
      const gantry = this.roadEnv.createOverheadObstacle([0]);
      gantry.active = false;
      gantry.mesh.visible = false;
      this.scene.add(gantry.mesh);
      this.gantryPool.push(gantry);
    }
  }

  private resetCar(resetScore: boolean = true) {
    this.currentLane = 1;
    this.targetLaneX = LANES[1];
    this.laneStartX = LANES[1];
    this.playerPos.set(LANES[1], 0, 0);
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isFlying = false;
    this.isBoosting = false;
    this.isRolling = false;
    this.isFlopping = false;
    this.rollTimer = 0;
    this.airFlopTimer = 0;
    this.invulnerableTimer = 0;
    this.reviveCount = 0;
    this.forwardSpeed = INITIAL_SPEED;
    this.flightFuel = FLIGHT_FUEL_MAX;
    this.boostFuel = BOOST_FUEL_MAX;
    this.warpSurgeActive = false;

    if (resetScore) {
      this.score = 0;
      this.distanceTraveled = 0;
      this.combo = 1;
      this.comboTimer = 0;
      this.nearMissCount = 0;
      this.orbsCollected = 0;
      this.timeSurvived = 0;
      this.isNewBest = false;
      this.lastEventMessage = '';
      this.hazardDetectedTime = 0;
      this.loadPersonalBest();
    }

    // Reset road segments around car
    for (let i = 0; i < this.roadEnv.roadSegments.length; i++) {
      this.roadEnv.roadSegments[i].position.z =
        this.playerPos.z - ROAD_SEGMENT_LENGTH + i * ROAD_SEGMENT_LENGTH;
    }

    // Hide all traffic and orbs
    this.trafficPool.forEach((car) => {
      car.active = false;
      car.mesh.visible = false;
      car.mesh.position.set(0, -100, 0);
    });

    this.orbPool.forEach((orb) => {
      orb.active = false;
      orb.mesh.visible = false;
      orb.mesh.position.set(0, -100, 0);
    });

    this.gantryPool.forEach((g) => {
      g.active = false;
      g.mesh.visible = false;
      g.mesh.position.set(0, -100, 0);
    });
    this.activeGantries = [];

    this.lastSpawnZ = this.playerPos.z + 40;
    this.lastGantryZ = this.playerPos.z + 90;
    this.lastOrbZ = this.playerPos.z + 25;

    this.player.group.position.copy(this.playerPos);
    this.player.chassisGroup.rotation.set(0, 0, 0);

    // Reset multiplayer rival
    if (this.gameMode === 'MULTIPLAYER') {
      this.rivalLane = 2;
      this.rivalDistance = 5;
      this.rivalPos.set(LANES[2], 0, 5);
      this.rivalRoadster.group.position.copy(this.rivalPos);
      this.rivalRoadster.group.visible = true;
    } else {
      this.rivalRoadster.group.visible = false;
    }
  }

  public startGame() {
    this.resetCar(true);
    this.gameStatus = 'PLAYING';
    this.onStatusChange?.('PLAYING');
    soundEffects.userGesture();
  }

  public startEndless() {
    this.gameMode = 'ENDLESS';
    this.currentLevelConfig = undefined;
    this.levelCompleted = false;
    this.startGame();
  }

  public startMultiplayer(rivalName: string) {
    this.gameMode = 'MULTIPLAYER';
    this.rivalName = rivalName;
    this.multiplayerTimer = MULTIPLAYER_MATCH_DURATION;
    this.multiplayerFinished = false;
    this.multiplayerWinner = null;
    this.rivalScore = 0;
    this.rivalDistance = 0;
    this.startGame();
  }

  public startLevel(level: LevelConfig) {
    this.gameMode = 'LEVELS';
    this.currentLevelConfig = level;
    this.levelCompleted = false;
    this.startGame();
  }

  public revivePlayer() {
    this.gameStatus = 'PLAYING';
    this.reviveCount++;
    this.invulnerableTimer = 3.5;
    this.flightFuel = FLIGHT_FUEL_MAX;
    this.boostFuel = BOOST_FUEL_MAX;
    this.currentLane = 1;
    this.targetLaneX = LANES[1];
    this.laneStartX = LANES[1];
    this.playerPos.x = LANES[1];
    this.playerPos.y = 0;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isFlying = false;
    this.forwardSpeed = INITIAL_SPEED;
    this.player.group.position.copy(this.playerPos);
    this.player.chassisGroup.rotation.set(0, 0, 0);

    // Push away any cars directly ahead of player
    this.trafficPool.forEach((car) => {
      if (car.active && Math.abs(car.mesh.position.z - this.playerPos.z) < 55) {
        car.mesh.position.z += 90;
      }
    });

    this.triggerEventMessage('✨ SECOND CHANCE! INVULNERABILITY ACTIVE! ✨');
    this.lastTime = performance.now();
    this.onStatusChange?.('PLAYING');
  }

  public pauseGame() {
    if (this.gameStatus === 'PLAYING') {
      this.gameStatus = 'PAUSED';
      this.onStatusChange?.('PAUSED');
    }
  }

  public resumeGame() {
    if (this.gameStatus === 'PAUSED') {
      this.gameStatus = 'PLAYING';
      this.lastTime = performance.now();
      this.onStatusChange?.('PLAYING');
    }
  }

  public restartGame() {
    this.startGame();
  }

  public showLeaderboard() {
    this.gameStatus = 'LEADERBOARD';
    this.onStatusChange?.('LEADERBOARD');
  }

  public returnToTitle() {
    this.gameStatus = 'TITLE';
    this.resetCar(true);
    this.onStatusChange?.('TITLE');
  }

  // --- CONTROLS & INPUT (CORRECTED MAPPING) ---
  private onKeyDown = (e: KeyboardEvent) => {
    // Prevent arrow keys and Space from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    soundEffects.userGesture();

    if (this.keysHeld[e.code]) return;
    this.keysHeld[e.code] = true;

    // Global Pause
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (this.gameStatus === 'PLAYING') {
        this.pauseGame();
        return;
      } else if (this.gameStatus === 'PAUSED') {
        this.resumeGame();
        return;
      }
    }

    // Audio Mute Toggle
    if (e.code === 'KeyM') {
      soundEffects.toggleMute();
      return;
    }

    // Title Enter
    if (e.code === 'Enter') {
      if (this.gameStatus === 'TITLE') {
        this.startEndless();
        return;
      }
    }

    // Restart Key R
    if (e.code === 'KeyR') {
      if (this.gameStatus === 'GAMEOVER' || this.gameStatus === 'PAUSED') {
        this.restartGame();
        return;
      }
    }

    // Leaderboard toggle on Title
    if (e.code === 'KeyT') {
      if (this.gameStatus === 'TITLE') {
        this.showLeaderboard();
        return;
      } else if (this.gameStatus === 'LEADERBOARD') {
        this.returnToTitle();
        return;
      }
    }

    if (this.gameStatus !== 'PLAYING') return;

    // Corrected Lane Changes:
    // ArrowLeft / KeyA moves toward Lane 0 (Screen Left: +3.8)
    // ArrowRight / KeyD moves toward Lane 2 (Screen Right: -3.8)
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.changeLane(-1);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.changeLane(1);
    }

    // Jump (Up Arrow / KeyW / Space)
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
      if (this.isGrounded) {
        this.verticalVelocity = JUMP_IMPULSE;
        this.isGrounded = false;
        soundEffects.playJump();
      }
    }

    // Slam / Fast Fall (Down Arrow / KeyS)
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (!this.isGrounded) {
        this.verticalVelocity = SLAM_IMPULSE;
        this.isFlying = false;
      }
    }

    // Barrel Roll (Q / E)
    if ((e.code === 'KeyQ' || e.code === 'KeyE') && !this.isRolling) {
      this.triggerBarrelRoll(e.code === 'KeyQ' ? 1 : -1);
    }

    // Acrobatic Mid-Air Flop (F key)
    if (e.code === 'KeyF' && !this.isFlopping) {
      this.triggerAirFlop();
    }

    // Boost / Rocket Turbo Start Sound (Shift or Slash '/')
    if (
      e.code === 'ShiftLeft' ||
      e.code === 'ShiftRight' ||
      e.code === 'Slash' ||
      e.code === 'NumpadDivide' ||
      e.key === '/'
    ) {
      if (this.boostFuel > 0.4) {
        soundEffects.playBoostStart();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysHeld[e.code] = false;
    if (e.key === '/') {
      this.keysHeld['Slash'] = false;
    }
  };

  private onBlur = () => {
    this.keysHeld = {};
    if (this.gameStatus === 'PLAYING') {
      this.pauseGame();
    }
  };

  private changeLane(dir: -1 | 1) {
    const nextLane = (this.currentLane + dir) as LaneIndex;
    if (nextLane >= 0 && nextLane <= 2) {
      // Record reaction time latency if hazard detected
      if (this.hazardDetectedTime > 0) {
        const deltaMs = Math.round(performance.now() - this.hazardDetectedTime);
        if (deltaMs > 60 && deltaMs < 800) {
          this.reactionTimes.push(deltaMs);
        }
        this.hazardDetectedTime = 0;
      }

      this.currentLane = nextLane;
      this.laneStartX = this.playerPos.x;
      this.targetLaneX = LANES[nextLane];
      this.laneTransitionTime = 0;
    }
  }

  private triggerBarrelRoll(direction: number) {
    this.isRolling = true;
    this.rollTimer = 0;
    this.rollDirection = direction;
    this.score += 250 * this.combo;
    this.triggerEventMessage('BARREL ROLL! +250');
    soundEffects.playBarrelRoll();
  }

  private triggerAirFlop() {
    this.isFlopping = true;
    this.airFlopTimer = 0;
    this.score += 350 * this.combo;
    this.triggerEventMessage('AIR FLOP ACROBATICS! +350');
    soundEffects.playAirFlop();
  }

  private triggerEventMessage(msg: string) {
    this.lastEventMessage = msg;
    this.eventMessageTimer = 1.2;
  }

  // --- GAME LOOP ---
  private tick = () => {
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const delta = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

    if (this.gameStatus === 'PLAYING') {
      this.updatePhysics(delta);
      this.updateTrafficAndWorld(delta);
      this.checkCollisionsAndTriggers(delta);
      this.updateScoringAndStats(delta);
    } else if (this.gameStatus === 'TITLE') {
      // Gentle hover on title screen
      const t = now * 0.0015;
      this.playerPos.y = 0.8 + Math.sin(t * 2) * 0.15;
      this.player.chassisGroup.rotation.z = Math.sin(t) * 0.05;
      this.player.group.position.copy(this.playerPos);
      this.camera.position.set(Math.sin(t * 0.5) * 2, 2.8, -6.5);
      this.camera.lookAt(0, 0.8, 2);
    }

    this.updateCamera(delta);
    this.updateLightingAndSky(delta);

    // Render frame
    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.tick);
  };

  private updatePhysics(delta: number) {
    // 1. Boost / Rocket Turbo Handling (Shift key or Slash '/')
    const wantsBoost =
      this.keysHeld['ShiftLeft'] ||
      this.keysHeld['ShiftRight'] ||
      this.keysHeld['Slash'] ||
      this.keysHeld['NumpadDivide'];

    if (wantsBoost && this.boostFuel > 0.1) {
      this.isBoosting = true;
      this.boostFuel = Math.max(0, this.boostFuel - delta);
    } else {
      this.isBoosting = false;
      this.boostFuel = Math.min(BOOST_FUEL_MAX, this.boostFuel + BOOST_REGEN_PER_SEC * delta);
    }

    // 2. Forward Speed progression + Hypersonic Surge after 5,000m
    let targetBaseSpeed = INITIAL_SPEED + this.distanceTraveled * SPEED_GROWTH_PER_METER;
    if (this.distanceTraveled >= WARP_SPEED_THRESHOLD) {
      const warpDistance = this.distanceTraveled - WARP_SPEED_THRESHOLD;
      const warpSpeed = MAX_SPEED + warpDistance * 0.012;
      targetBaseSpeed = Math.min(WARP_MAX_SPEED, warpSpeed);
      if (!this.warpSurgeActive) {
        this.warpSurgeActive = true;
        this.triggerEventMessage('⚡ 5,000M! HYPERSONIC WARP SURGE ACTIVE! ⚡');
        soundEffects.playBoostStart();
        this.screenShake = 0.5;
      }
    } else {
      targetBaseSpeed = Math.min(MAX_SPEED, targetBaseSpeed);
    }

    const targetSpeed = targetBaseSpeed + (this.isBoosting ? BOOST_BONUS_SPEED : 0);
    this.forwardSpeed = THREE.MathUtils.damp(this.forwardSpeed, targetSpeed, 4, delta);
    this.topSpeedRecorded = Math.max(
      this.topSpeedRecorded,
      Math.floor(this.forwardSpeed * 3.6)
    );

    // Advance forward
    const forwardDistance = this.forwardSpeed * delta;
    this.playerPos.z += forwardDistance;
    this.distanceTraveled += forwardDistance;

    // 3. Lane Lateral Easing
    if (this.laneTransitionTime < LANE_CHANGE_DURATION) {
      this.laneTransitionTime += delta;
      const progress = Math.min(1, this.laneTransitionTime / LANE_CHANGE_DURATION);
      // Smooth sinusoidal / cubic easing
      const eased = Math.sin((progress * Math.PI) / 2);
      this.playerPos.x = THREE.MathUtils.lerp(this.laneStartX, this.targetLaneX, eased);
    } else {
      this.playerPos.x = this.targetLaneX;
    }

    // 4. Vertical Jump & Flight Mechanics
    const wantsFly =
      (this.keysHeld['Space'] || this.keysHeld['ArrowUp'] || this.keysHeld['KeyW']) &&
      !this.isGrounded;

    if (wantsFly && this.flightFuel > 0.08) {
      this.isFlying = true;
      this.flightFuel = Math.max(0, this.flightFuel - delta);

      // Accelerate upward towards flight max altitude
      if (this.playerPos.y < FLIGHT_MAX_ALTITUDE) {
        this.verticalVelocity = THREE.MathUtils.damp(
          this.verticalVelocity,
          FLIGHT_HOVER_ACCEL * 0.25,
          8,
          delta
        );
      } else {
        this.verticalVelocity = THREE.MathUtils.damp(this.verticalVelocity, 0, 10, delta);
        this.playerPos.y = FLIGHT_MAX_ALTITUDE;
      }
    } else {
      this.isFlying = false;
      // Normal gravity applies
      this.verticalVelocity -= GRAVITY * delta;
    }

    this.playerPos.y += this.verticalVelocity * delta;

    // Ground collision
    if (this.playerPos.y <= 0) {
      this.playerPos.y = 0;
      this.verticalVelocity = 0;
      if (!this.isGrounded) {
        soundEffects.playSlam();
        this.screenShake = 0.15;
      }
      this.isGrounded = true;
      // Regenerate flight fuel on ground
      this.flightFuel = Math.min(
        FLIGHT_FUEL_MAX,
        this.flightFuel + FLIGHT_REGEN_PER_SEC * delta
      );
    }

    // Invulnerability countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);
    }

    // 5. Acrobatics (Barrel Roll & Air Flop)
    let rollAngle = 0;
    if (this.isRolling) {
      this.rollTimer += delta;
      const rollProgress = this.rollTimer / BARREL_ROLL_DURATION;
      rollAngle = rollProgress * Math.PI * 2 * this.rollDirection;
      if (this.rollTimer >= BARREL_ROLL_DURATION) {
        this.isRolling = false;
        this.rollTimer = 0;
      }
    }

    let airFlopAngle = 0;
    if (this.isFlopping) {
      this.airFlopTimer += delta;
      const flopProgress = this.airFlopTimer / AIR_FLOP_DURATION;
      airFlopAngle = flopProgress * Math.PI * 2;
      if (this.airFlopTimer >= AIR_FLOP_DURATION) {
        this.isFlopping = false;
        this.airFlopTimer = 0;
      }
    }

    // 6. Visual tilting & Roadster model update (Corrected banking tilt)
    const laneDeltaX = this.targetLaneX - this.playerPos.x;
    const targetTilt = -laneDeltaX * 0.16;
    const targetPitch = this.verticalVelocity * 0.025;

    this.player.group.position.copy(this.playerPos);
    this.player.update(
      delta,
      this.forwardSpeed,
      targetTilt,
      targetPitch,
      rollAngle,
      airFlopAngle,
      this.isFlying,
      this.isBoosting
    );

    // Particle thrusters
    if (this.isFlying || this.isBoosting) {
      this.particles.emitThrusterSparks(
        this.playerPos.x,
        this.playerPos.y + 0.35,
        this.playerPos.z - 2.1,
        this.isBoosting
      );
    }

    this.particles.update(delta, this.forwardSpeed, this.isBoosting, this.playerPos);

    // Audio engine update
    soundEffects.updateEngine(
      this.forwardSpeed * 3.6,
      this.isBoosting,
      this.isFlying,
      true
    );

    // 7. MULTIPLAYER RIVAL TELEMETRY UPDATE
    if (this.gameMode === 'MULTIPLAYER') {
      this.updateMultiplayerRival(delta);
    }
  }

  private updateMultiplayerRival(delta: number) {
    this.multiplayerTimer -= delta;

    // Rival AI drives dynamically in parallel
    const rivalBaseSpeed = 52 + Math.sin(this.playerPos.z * 0.003) * 18;
    this.rivalSpeed = THREE.MathUtils.damp(this.rivalSpeed, rivalBaseSpeed, 3, delta);

    this.rivalDistance += this.rivalSpeed * delta;
    this.rivalScore += Math.floor(this.rivalSpeed * delta * 2.5);

    // Rival lane changes
    this.rivalLaneTimer -= delta;
    if (this.rivalLaneTimer <= 0) {
      this.rivalLane = Math.floor(Math.random() * 3) as LaneIndex;
      this.rivalLaneTimer = 2.5 + Math.random() * 2.0;
    }

    const rivalTargetX = LANES[this.rivalLane];
    this.rivalPos.x = THREE.MathUtils.damp(this.rivalPos.x, rivalTargetX, 8, delta);
    this.rivalPos.z = this.rivalDistance;
    this.rivalPos.y = 0;

    this.rivalRoadster.group.position.copy(this.rivalPos);
    this.rivalRoadster.update(delta, this.rivalSpeed, 0, 0, 0, 0, false, this.rivalSpeed > 65);

    // Match concluded when timer reaches 0
    if (this.multiplayerTimer <= 0 && !this.multiplayerFinished) {
      this.multiplayerFinished = true;
      const playerWon = this.score >= this.rivalScore;
      this.multiplayerWinner = playerWon;

      if (playerWon) {
        walletService.addCoins(MULTIPLAYER_REWARD_COINS);
        soundEffects.playGoldCoin();
      }

      supabaseService.recordMultiplayerMatch({
        wager: MULTIPLAYER_WAGER_COINS,
        winner: playerWon,
        playerScore: this.score,
        rivalScore: this.rivalScore,
        rivalName: this.rivalName,
      });

      this.gameStatus = 'GAMEOVER';
      this.onStatusChange?.('GAMEOVER');
    }
  }

  private updateTrafficAndWorld(delta: number) {
    const playerZ = this.playerPos.z;

    // 1. Recycle road segments ahead
    for (let i = 0; i < this.roadEnv.roadSegments.length; i++) {
      const seg = this.roadEnv.roadSegments[i];
      if (seg.position.z < playerZ - ROAD_SEGMENT_LENGTH * 1.5) {
        let maxZ = -Infinity;
        for (let j = 0; j < this.roadEnv.roadSegments.length; j++) {
          if (this.roadEnv.roadSegments[j].position.z > maxZ) {
            maxZ = this.roadEnv.roadSegments[j].position.z;
          }
        }
        seg.position.z = maxZ + ROAD_SEGMENT_LENGTH;
      }
    }

    // Keep architectural skyline centered along Z with subtle parallax
    if (this.roadEnv.cityBuildingsGroup) {
      this.roadEnv.cityBuildingsGroup.position.z = playerZ * 0.75;
    }

    // 2. Roadblock Wave check (All 3 lanes blocked, player must take flight!)
    if (playerZ + 240 > this.nextRoadblockZ) {
      this.spawnRoadblockWave(this.nextRoadblockZ);
      this.activeRoadblockZ = this.nextRoadblockZ;
      this.roadblockAlertPlayed = false;
      this.nextRoadblockZ += 240 + Math.random() * 80;
    }

    // Roadblock proximity warning
    if (this.activeRoadblockZ !== null) {
      const dist = this.activeRoadblockZ - playerZ;
      if (dist > 6 && dist < 95) {
        this.roadblockWarning = true;
        if (!this.roadblockAlertPlayed) {
          soundEffects.playRoadblockAlert();
          this.roadblockAlertPlayed = true;
        }
      } else if (dist <= 6 && dist >= -15) {
        this.roadblockWarning = false;
        if (this.playerPos.y > 2.6) {
          this.score += 600 * this.combo;
          this.triggerEventMessage('AIR EVASION! +600');
          soundEffects.playNearMiss();
        }
        this.activeRoadblockZ = null;
      } else if (dist < -15) {
        this.roadblockWarning = false;
        this.activeRoadblockZ = null;
      }
    }

    // 3. Regular Traffic Cars ahead (leaving at least 1 lane open when not in roadblock)
    const trafficSpawnInterval = Math.max(20, 48 - (this.distanceTraveled / 1000) * 8);
    if (playerZ + 200 > this.lastSpawnZ) {
      this.spawnTrafficWave(this.lastSpawnZ);
      this.lastSpawnZ += trafficSpawnInterval;
    }

    // 4. Spawn Overhead Obstacles periodically (every ~140m)
    if (playerZ + 220 > this.lastGantryZ) {
      this.spawnOverheadGantry(this.lastGantryZ);
      this.lastGantryZ += 140 + Math.random() * 40;
    }

    // 5. Spawn 24K Gold Coins
    if (playerZ + 180 > this.lastOrbZ) {
      this.spawnGoldCoinsCluster(this.lastOrbZ);
      this.lastOrbZ += 35 + Math.random() * 25;
    }

    // 6. Update Traffic Movement & Despawn behind
    for (let i = 0; i < this.trafficPool.length; i++) {
      const car = this.trafficPool[i];
      if (!car.active) continue;

      car.mesh.position.z += car.speed * delta;

      // Spin wheels
      car.wheels.forEach((w) => {
        w.rotation.x += car.speed * delta * 2.8;
      });

      // Hazard presence detection for reaction time rating
      if (
        car.lane === this.currentLane &&
        car.mesh.position.z - playerZ > 5 &&
        car.mesh.position.z - playerZ < 65 &&
        this.hazardDetectedTime === 0
      ) {
        this.hazardDetectedTime = performance.now();
      }

      // Check for near-miss
      if (!car.passed && car.mesh.position.z < playerZ - 0.5) {
        car.passed = true;
        const dx = Math.abs(car.mesh.position.x - this.playerPos.x);
        const dy = this.playerPos.y;
        if (dx < NEAR_MISS_X_DISTANCE && dy < 3.2 && !car.nearMissAwarded) {
          car.nearMissAwarded = true;
          this.awardNearMiss();
        }
      }

      // Despawn once well behind
      if (car.mesh.position.z < playerZ - 30) {
        car.active = false;
        car.mesh.visible = false;
      }
    }

    // 7. Rotate and Despawn Gold Coins
    for (let i = 0; i < this.orbPool.length; i++) {
      const orb = this.orbPool[i];
      if (!orb.active) continue;
      orb.mesh.rotation.y += orb.rotSpeed * delta;
      if (orb.mesh.position.z < playerZ - 20) {
        orb.active = false;
        orb.mesh.visible = false;
      }
    }

    // 8. Despawn gantries behind
    for (let i = 0; i < this.activeGantries.length; i++) {
      const g = this.activeGantries[i];
      if (g.active && g.z < playerZ - 30) {
        g.active = false;
        g.mesh.visible = false;
      }
    }
  }

  private spawnTrafficWave(z: number) {
    // Pick 1 to 2 lanes to block, leaving at least 1 lane open
    const lanes: LaneIndex[] = [0, 1, 2];
    const numCars = Math.random() < 0.4 ? 1 : 2;
    const shuffledLanes = lanes.sort(() => Math.random() - 0.5).slice(0, numCars);

    shuffledLanes.forEach((lane) => {
      const car = this.getInactiveTrafficCar();
      if (!car) return;

      car.lane = lane;
      car.active = true;
      car.passed = false;
      car.nearMissAwarded = false;

      // Realistic speed variance: trucks are slow, sports cars are fast
      let speed = 22 + Math.random() * 12;
      if (car.type === 'truck') speed = 14 + Math.random() * 6;
      if (car.type === 'sports') speed = 32 + Math.random() * 10;
      car.speed = speed;

      car.mesh.position.set(LANES[lane], 0, z + (Math.random() - 0.5) * 8);
      car.mesh.visible = true;
    });
  }

  private spawnRoadblockWave(z: number) {
    // Consumes 3 cars placed simultaneously across lanes 0, 1, and 2
    for (let lane = 0; lane < 3; lane++) {
      const car = this.getInactiveTrafficCar();
      if (!car) continue;

      car.lane = lane as LaneIndex;
      car.active = true;
      car.passed = false;
      car.nearMissAwarded = false;
      car.speed = 12; // Slow barrier speed
      car.mesh.position.set(LANES[lane as LaneIndex], 0, z);
      car.mesh.visible = true;
    }
  }

  private spawnOverheadGantry(z: number) {
    const g = this.gantryPool.find((item) => !item.active);
    if (!g) return;

    // Block 1 or 2 lanes at sign height
    const lanes: LaneIndex[] = [0, 1, 2];
    g.blockedLanes = lanes.sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 2));
    g.z = z;
    g.active = true;
    g.mesh.position.set(0, 0, z);
    g.mesh.visible = true;
    this.activeGantries.push(g);
  }

  private spawnGoldCoinsCluster(z: number) {
    const lane: LaneIndex = Math.floor(Math.random() * 3) as LaneIndex;
    const count = 3 + Math.floor(Math.random() * 3);
    const isAirborne = Math.random() < 0.35;
    const y = isAirborne ? 3.8 : 1.1;

    for (let i = 0; i < count; i++) {
      const orb = this.orbPool.find((o) => !o.active);
      if (!orb) break;

      orb.active = true;
      orb.lane = lane;
      orb.y = y;
      orb.mesh.position.set(LANES[lane], y, z + i * 5);
      orb.mesh.visible = true;
    }
  }

  private getInactiveTrafficCar(): TrafficCarData | undefined {
    return this.trafficPool.find((c) => !c.active);
  }

  private checkCollisionsAndTriggers(_delta: number) {
    const playerX = this.playerPos.x;
    const playerY = this.playerPos.y;
    const playerZ = this.playerPos.z;

    const isInvulnerable =
      this.isRolling || this.isBoosting || this.invulnerableTimer > 0;

    // 1. Traffic Car Collisions
    for (let i = 0; i < this.trafficPool.length; i++) {
      const car = this.trafficPool[i];
      if (!car.active) continue;

      const dx = Math.abs(playerX - car.mesh.position.x);
      const dz = Math.abs(playerZ - car.mesh.position.z);
      const carHeight = car.height;

      // Safe to pass over if flying cleanly above vehicle roof
      const isAboveCar = playerY > carHeight + 0.15;

      const halfW = (car.width + 1.8) * 0.44;
      const halfL = (car.length + 4.2) * 0.44;

      if (dx < halfW && dz < halfL) {
        if (!isAboveCar) {
          if (isInvulnerable) {
            // Glancing hit during roll/boost/shield deflects car
            car.mesh.position.x += dx < 0.5 ? 4.5 : -4.5;
            this.particles.emitThrusterSparks(playerX, playerY + 0.5, playerZ, true);
            this.score += 200;
          } else {
            this.triggerCrash(playerX, playerY, playerZ);
            return;
          }
        }
      }
    }

    // 2. Overhead Obstacle Collisions
    for (let i = 0; i < this.activeGantries.length; i++) {
      const g = this.activeGantries[i];
      if (!g.active) continue;

      const dz = Math.abs(playerZ - g.z);
      if (dz < 1.2) {
        // Support pillar hit
        if (Math.abs(playerX) > ROAD_WIDTH / 2 + 0.5) {
          if (!isInvulnerable) {
            this.triggerCrash(playerX, playerY, g.z);
            return;
          }
        }

        // Signboard hit
        g.blockedLanes.forEach((laneIdx) => {
          const laneX = LANES[laneIdx];
          if (Math.abs(playerX - laneX) < 1.4) {
            if (playerY >= 2.2 && playerY <= 4.9 && !isInvulnerable) {
              this.triggerCrash(laneX, playerY, g.z);
              return;
            }
          }
        });
      }
    }

    // 3. Road Boundary Guardrail Collision
    if (Math.abs(playerX) > ROAD_WIDTH / 2 - 0.5 && playerY < 1.0) {
      if (!isInvulnerable) {
        this.triggerCrash(playerX, playerY, playerZ);
        return;
      }
    }

    // 4. Collectible 24K Gold Medallion Pickups
    for (let i = 0; i < this.orbPool.length; i++) {
      const orb = this.orbPool[i];
      if (!orb.active) continue;

      const dx = Math.abs(playerX - orb.mesh.position.x);
      const dy = Math.abs(playerY - orb.mesh.position.y);
      const dz = Math.abs(playerZ - orb.mesh.position.z);

      if (dx < 1.35 && dy < 1.45 && dz < 1.65) {
        orb.active = false;
        orb.mesh.visible = false;
        this.orbsCollected++;
        walletService.addCoins(1); // Real permanent Gold Coin wallet credit!
        this.flightFuel = Math.min(FLIGHT_FUEL_MAX, this.flightFuel + 1.1);
        this.score += 250 * this.combo;
        this.triggerEventMessage('24K GOLD MEDALLION! +250');

        soundEffects.playGoldCoin();
        this.particles.emitOrbBurst(
          orb.mesh.position.x,
          orb.mesh.position.y,
          orb.mesh.position.z
        );
      }
    }
  }

  private awardNearMiss() {
    this.nearMissCount++;
    this.combo = Math.min(8, this.combo + 1);
    this.comboTimer = 3.5;
    this.nearMissFlashTimer = 0.22;
    this.score += 300 * this.combo;

    this.triggerEventMessage(`NEAR MISS! x${this.combo} MULTIPLIER`);
    soundEffects.playNearMiss();
  }

  private triggerCrash(x: number, y: number, z: number) {
    this.gameStatus = 'GAMEOVER';
    this.screenShake = 0.8;
    this.particles.emitCrashDebris(x, y, z);
    soundEffects.playCrash();
    soundEffects.updateEngine(0, false, false, false);

    // If multiplayer, conclude as defeat
    if (this.gameMode === 'MULTIPLAYER' && !this.multiplayerFinished) {
      this.multiplayerFinished = true;
      this.multiplayerWinner = false;
      supabaseService.recordMultiplayerMatch({
        wager: MULTIPLAYER_WAGER_COINS,
        winner: false,
        playerScore: this.score,
        rivalScore: this.rivalScore,
        rivalName: this.rivalName,
      });
    }

    this.onStatusChange?.('GAMEOVER');
  }

  private updateScoringAndStats(delta: number) {
    this.timeSurvived += delta;

    // Passive score from distance & speed
    this.score += Math.floor(this.forwardSpeed * delta * 2.5);

    // Flight time bonus
    if (this.isFlying) {
      this.score += Math.floor(15 * delta);
    }

    // Combo countdown
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Flash timer
    if (this.nearMissFlashTimer > 0) {
      this.nearMissFlashTimer -= delta;
    }

    if (this.eventMessageTimer > 0) {
      this.eventMessageTimer -= delta;
      if (this.eventMessageTimer <= 0) {
        this.lastEventMessage = '';
      }
    }

    // Check Career Level Mission Completion
    if (
      this.gameMode === 'LEVELS' &&
      this.currentLevelConfig &&
      !this.levelCompleted
    ) {
      if (
        this.distanceTraveled >= this.currentLevelConfig.targetDistance &&
        this.nearMissCount >= this.currentLevelConfig.targetNearMisses &&
        this.orbsCollected >= this.currentLevelConfig.targetCoins
      ) {
        this.levelCompleted = true;
        let stars = 1;
        if (this.score > this.currentLevelConfig.targetDistance * 4) stars = 3;
        else if (this.score > this.currentLevelConfig.targetDistance * 2.5) stars = 2;

        walletService.addCoins(this.currentLevelConfig.rewardCoins);
        walletService.saveLevelStars(this.currentLevelConfig.id, stars);
        soundEffects.playGoldCoin();
        this.gameStatus = 'GAMEOVER';
        this.onStatusChange?.('GAMEOVER');
      }
    }

    // Personal best real-time check
    if (this.personalBest > 0 && this.score > this.personalBest && !this.isNewBest) {
      this.isNewBest = true;
      this.triggerEventMessage('NEW PERSONAL BEST!');
    }

    // Throttle React state updates to ~12fps to eliminate virtual DOM lag and maintain 60fps
    this.statsThrottleTimer += delta;
    if (
      this.statsThrottleTimer >= 0.08 ||
      this.nearMissFlashTimer > 0 ||
      this.isNewBest ||
      this.roadblockWarning
    ) {
      this.statsThrottleTimer = 0;

      let mpStats: MultiplayerStats | undefined = undefined;
      if (this.gameMode === 'MULTIPLAYER') {
        mpStats = {
          timeLeft: Math.max(0, this.multiplayerTimer),
          wagerCoins: MULTIPLAYER_WAGER_COINS,
          rivalName: this.rivalName,
          rivalScore: this.rivalScore,
          rivalDistance: Math.floor(this.rivalDistance),
          rivalSpeedKmh: Math.floor(this.rivalSpeed * 3.6),
          rivalLane: this.rivalLane,
          matchFinished: this.multiplayerFinished,
          isWinner: this.multiplayerWinner,
          coinsAwarded: this.multiplayerWinner ? MULTIPLAYER_REWARD_COINS : 0,
        };
      }

      this.onStatsUpdate?.({
        score: this.score,
        distance: Math.floor(this.distanceTraveled),
        speedKmh: Math.floor(this.forwardSpeed * 3.6),
        flightFuel: this.flightFuel / FLIGHT_FUEL_MAX,
        boostFuel: this.boostFuel / BOOST_FUEL_MAX,
        combo: this.combo,
        comboTimer: this.comboTimer,
        nearMissCount: this.nearMissCount,
        orbsCollected: this.orbsCollected,
        timeSurvived: this.timeSurvived,
        isNewBest: this.isNewBest,
        isBoosting: this.isBoosting,
        isFlying: this.isFlying,
        isRolling: this.isRolling,
        isFlopping: this.isFlopping,
        nearMissFlash: this.nearMissFlashTimer > 0,
        roadblockWarning: this.roadblockWarning,
        lastEventMessage: this.lastEventMessage,
        skyPhase: this.skySystem.getPhaseName(this.distanceTraveled),
        gameMode: this.gameMode,
        currentLevel: this.currentLevelConfig,
        levelCompleted: this.levelCompleted,
        warpSurgeActive: this.warpSurgeActive,
        multiplayer: mpStats,
        walletCoins: walletService.getCoins(),
        canRevive: this.reviveCount === 0,
        reviveCount: this.reviveCount,
        averageReactionMs:
          this.reactionTimes.length > 0
            ? Math.round(
                this.reactionTimes.reduce((acc, v) => acc + v, 0) /
                  this.reactionTimes.length
              )
            : 195,
      });
    }
  }

  private updateCamera(delta: number) {
    const targetFov = this.isBoosting || this.warpSurgeActive ? 74 : 62;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 8, delta);
      this.camera.updateProjectionMatrix();
    }

    const boostPullback = this.isBoosting ? 2.0 : 0;
    const flyElevation = this.playerPos.y * 0.45;

    const targetCamX = this.playerPos.x * 0.75;
    const targetCamY = 3.2 + flyElevation + (this.isBoosting ? 0.35 : 0);
    const targetCamZ = this.playerPos.z - 7.6 - boostPullback;

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      targetCamX,
      12,
      delta
    );
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      targetCamY,
      10,
      delta
    );
    this.camera.position.z = THREE.MathUtils.damp(
      this.camera.position.z,
      targetCamZ,
      18,
      delta
    );

    this.cameraTarget.set(
      this.playerPos.x * 0.35,
      this.playerPos.y + 0.8,
      this.playerPos.z + 16
    );

    if (this.screenShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.screenShake;
      this.camera.position.y += (Math.random() - 0.5) * this.screenShake;
      this.screenShake = Math.max(0, this.screenShake - delta * 2.5);
    }

    this.camera.lookAt(this.cameraTarget);

    // Camera lean into turn (Corrected direction)
    const turnTilt = -(this.targetLaneX - this.playerPos.x) * 0.025;
    this.camera.rotation.z += turnTilt;
  }

  private updateLightingAndSky(_delta: number) {
    this.dirLight.position.set(
      this.playerPos.x + 15,
      35,
      this.playerPos.z + 120
    );
    this.dirLight.target.position.set(
      this.playerPos.x,
      0,
      this.playerPos.z + 10
    );
    this.dirLight.target.updateMatrixWorld();

    this.skySystem.update(
      this.distanceTraveled,
      this.camera.position,
      this.scene,
      this.dirLight,
      this.hemiLight,
      this.roadEnv
    );
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public getScore(): number {
    return this.score;
  }

  public getDistance(): number {
    return Math.floor(this.distanceTraveled);
  }

  public getTimeSurvived(): number {
    return this.timeSurvived;
  }

  public getNearMissCount(): number {
    return this.nearMissCount;
  }

  public getOrbsCollected(): number {
    return this.orbsCollected;
  }

  public getReflexRating(): ReflexRating {
    const avgReaction =
      this.reactionTimes.length > 0
        ? Math.round(
            this.reactionTimes.reduce((acc, v) => acc + v, 0) /
              this.reactionTimes.length
          )
        : 185;

    let grade: 'S+' | 'S' | 'A' | 'B' | 'C' = 'B';
    if (this.topSpeedRecorded >= 450 || avgReaction <= 140) {
      grade = 'S+';
    } else if (this.topSpeedRecorded >= 350 || avgReaction <= 190) {
      grade = 'S';
    } else if (this.topSpeedRecorded >= 250 || avgReaction <= 240) {
      grade = 'A';
    } else if (avgReaction <= 300) {
      grade = 'B';
    } else {
      grade = 'C';
    }

    return {
      averageReactionMs: avgReaction,
      topSpeedKmh: this.topSpeedRecorded || Math.floor(this.forwardSpeed * 3.6),
      reflexGrade: grade,
      warpSurgeAchieved: this.distanceTraveled >= WARP_SPEED_THRESHOLD || this.warpSurgeActive,
      nearMissCount: this.nearMissCount,
      distanceTraveled: Math.floor(this.distanceTraveled),
    };
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.skySystem.dispose();
    this.renderer.dispose();
  }
}
