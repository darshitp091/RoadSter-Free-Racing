/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import type { GameStatus, GameStats, LevelConfig } from './types';
import { GameEngine } from './game/GameEngine';
import { HUD } from './ui/HUD';
import { TitleScreen } from './ui/TitleScreen';
import { GameOverModal } from './ui/GameOverModal';
import { LeaderboardModal } from './ui/LeaderboardModal';
import { PauseModal } from './ui/PauseModal';
import { MultiplayerLobbyModal } from './ui/MultiplayerLobbyModal';
import { LevelsModal } from './ui/LevelsModal';
import { ReflexTestModal } from './ui/ReflexTestModal';
import { AdSenseModal } from './ui/AdSenseModal';
import { soundEffects } from './audio/SoundEffects';
import { walletService } from './services/wallet';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [showAdSenseModal, setShowAdSenseModal] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    speedKmh: 144,
    flightFuel: 1,
    boostFuel: 1,
    combo: 1,
    comboTimer: 0,
    nearMissCount: 0,
    orbsCollected: 0,
    timeSurvived: 0,
    isNewBest: false,
    isBoosting: false,
    isFlying: false,
    isRolling: false,
    isFlopping: false,
    nearMissFlash: false,
    roadblockWarning: false,
    gameMode: 'ENDLESS',
    walletCoins: walletService.getCoins(),
    canRevive: true,
    reviveCount: 0,
    averageReactionMs: 185,
  });

  const loadPersonalBest = useCallback(() => {
    try {
      const raw = localStorage.getItem('sky_roadster_top10');
      if (raw) {
        const scores = JSON.parse(raw);
        if (scores && scores.length > 0) {
          setPersonalBest(scores[0].score || 0);
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    loadPersonalBest();
  }, [loadPersonalBest]);

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Instantiate game engine
    const engine = new GameEngine(
      canvasMountRef.current,
      (newStats) => {
        setStats(newStats);
      },
      (newStatus) => {
        setGameStatus(newStatus);
        if (newStatus === 'GAMEOVER') {
          loadPersonalBest();
        }
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [loadPersonalBest]);

  const handleStartEndless = () => {
    engineRef.current?.startEndless();
  };

  const handleStartMultiplayerMatch = (rivalName: string) => {
    engineRef.current?.startMultiplayer(rivalName);
  };

  const handleStartLevel = (level: LevelConfig) => {
    engineRef.current?.startLevel(level);
  };

  const handlePause = () => {
    engineRef.current?.pauseGame();
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
  };

  const handleOpenLeaderboard = () => {
    engineRef.current?.showLeaderboard();
  };

  const handleReturnToTitle = () => {
    setShowAdSenseModal(false);
    engineRef.current?.returnToTitle();
  };

  const handleToggleMute = () => {
    const nextMuted = soundEffects.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleRewardGranted = () => {
    setShowAdSenseModal(false);
    engineRef.current?.revivePlayer();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#141226] relative select-none font-sans">
      <Analytics />
      {/* 3D WebGL Canvas isolated mount */}
      <div
        ref={canvasMountRef}
        className="w-full h-full absolute inset-0 z-0 cursor-crosshair"
      />

      {/* Playing In-Game HUD */}
      {gameStatus === 'PLAYING' && (
        <HUD
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
        />
      )}

      {/* Title Screen Overlay */}
      {gameStatus === 'TITLE' && (
        <TitleScreen
          onStart={handleStartEndless}
          onOpenMultiplayer={() => setGameStatus('MULTIPLAYER_LOBBY')}
          onOpenLevels={() => setGameStatus('LEVELS_SELECT')}
          onOpenReflexTest={() => setGameStatus('REFLEX_TEST')}
          onLeaderboard={handleOpenLeaderboard}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          personalBest={personalBest}
        />
      )}

      {/* Online Multiplayer Lobby Modal */}
      {gameStatus === 'MULTIPLAYER_LOBBY' && (
        <MultiplayerLobbyModal
          onStartMatch={handleStartMultiplayerMatch}
          onBack={handleReturnToTitle}
        />
      )}

      {/* Career Missions / Levels Modal */}
      {gameStatus === 'LEVELS_SELECT' && (
        <LevelsModal
          onStartLevel={handleStartLevel}
          onBack={handleReturnToTitle}
        />
      )}

      {/* Speed & Reflex Test Modal */}
      {gameStatus === 'REFLEX_TEST' && (
        <ReflexTestModal
          stats={
            engineRef.current?.getReflexRating() || {
              averageReactionMs: 185,
              topSpeedKmh: 302,
              reflexGrade: 'S',
              warpSurgeAchieved: false,
              nearMissCount: stats.nearMissCount,
              distanceTraveled: stats.distance,
            }
          }
          onPlayEndless={handleStartEndless}
          onBack={handleReturnToTitle}
        />
      )}

      {/* Paused Screen Overlay */}
      {gameStatus === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAMEOVER' && !showAdSenseModal && (
        <GameOverModal
          score={engineRef.current?.getScore() || stats.score}
          distance={engineRef.current?.getDistance() || stats.distance}
          timeSurvived={engineRef.current?.getTimeSurvived() || stats.timeSurvived}
          nearMisses={engineRef.current?.getNearMissCount() || stats.nearMissCount}
          orbs={engineRef.current?.getOrbsCollected() || stats.orbsCollected}
          canRevive={stats.canRevive}
          gameMode={stats.gameMode}
          multiplayer={stats.multiplayer}
          currentLevel={stats.currentLevel}
          levelCompleted={stats.levelCompleted}
          onRestart={handleRestart}
          onViewLeaderboard={handleOpenLeaderboard}
          onReviveRequested={() => setShowAdSenseModal(true)}
          onReturnToTitle={handleReturnToTitle}
        />
      )}

      {/* Rewarded AdSense Sponsor Clip Modal */}
      {showAdSenseModal && (
        <AdSenseModal
          onRewardGranted={handleRewardGranted}
          onCancel={() => setShowAdSenseModal(false)}
        />
      )}

      {/* Top 10 Leaderboard Modal */}
      {gameStatus === 'LEADERBOARD' && (
        <LeaderboardModal onBack={handleReturnToTitle} />
      )}
    </div>
  );
}
