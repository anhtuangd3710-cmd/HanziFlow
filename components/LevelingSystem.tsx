'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import { AwardIcon } from './icons/AwardIcon';
import { FlameIcon } from './icons/FlameIcon';

interface UserLevel {
  level: number;
  title: string;
  minXP: number;
  icon: string;
  color: string;
}

const userLevels: UserLevel[] = [
  { level: 1, title: 'Novice', minXP: 0, icon: '🌱', color: 'from-gray-100 to-gray-200' },
  { level: 2, title: 'Apprentice', minXP: 100, icon: '📚', color: 'from-blue-100 to-blue-200' },
  { level: 3, title: 'Student', minXP: 250, icon: '🎓', color: 'from-cyan-100 to-cyan-200' },
  { level: 4, title: 'Scholar', minXP: 500, icon: '🏛️', color: 'from-green-100 to-green-200' },
  { level: 5, title: 'Master', minXP: 1000, icon: '⭐', color: 'from-yellow-100 to-yellow-200' },
  { level: 6, title: 'Grandmaster', minXP: 2000, icon: '👑', color: 'from-orange-100 to-orange-200' },
  { level: 7, title: 'Sage', minXP: 3500, icon: '🧙', color: 'from-purple-100 to-purple-200' },
  { level: 8, title: 'Immortal', minXP: 5000, icon: '✨', color: 'from-red-100 to-pink-200' },
];

const LevelingSystem: React.FC = () => {
  const context = useContext(AppContext);
  const [currentLevel, setCurrentLevel] = useState<UserLevel>(userLevels[0]);
  const [nextLevel, setNextLevel] = useState<UserLevel>(userLevels[1]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!context?.state.user?.xp) return;

    const userXP = context.state.user.xp;
    
    // Find current level
    let level = userLevels[0];
    for (let i = userLevels.length - 1; i >= 0; i--) {
      if (userXP >= userLevels[i].minXP) {
        level = userLevels[i];
        break;
      }
    }
    
    setCurrentLevel(level);

    // Find next level
    const nextLevelIndex = userLevels.findIndex(l => l.minXP > level.minXP);
    if (nextLevelIndex !== -1) {
      setNextLevel(userLevels[nextLevelIndex]);
      const xpForCurrentLevel = level.minXP;
      const xpForNextLevel = nextLevel.minXP;
      const xpInCurrentLevel = userXP - xpForCurrentLevel;
      const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
      setProgress(Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100));
    } else {
      setNextLevel(level);
      setProgress(100);
    }
  }, [context?.state.user?.xp]);

  if (!context?.state.user) return null;

  const xp = context.state.user.xp || 0;
  const xpForNextLevel = nextLevel.minXP - currentLevel.minXP;
  const xpInCurrentLevel = xp - currentLevel.minXP;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{currentLevel.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentLevel.title}</h2>
            <p className="text-gray-600">Level {currentLevel.level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-600">{xp}</div>
          <p className="text-gray-600 text-sm">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Towards {nextLevel.title}
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {Math.floor(xpInCurrentLevel)}/{Math.floor(xpForNextLevel)} XP
          </span>
        </div>
        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-lg font-bold text-orange-600">{context.state.user.currentStreak || 0}</div>
          <p className="text-xs text-gray-600">Current Streak</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-lg font-bold text-yellow-600">{context.state.user.longestStreak || 0}</div>
          <p className="text-xs text-gray-600">Best Streak</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-lg font-bold text-indigo-600">{currentLevel.level}</div>
          <p className="text-xs text-gray-600">Level</p>
        </div>
      </div>

      {/* Next Levels Preview */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-4">🎯 Your Journey Ahead</h3>
        <div className="space-y-3">
          {userLevels.filter(level => level.level >= currentLevel.level).slice(0, 3).map((level) => {
            const isCurrent = level.level === currentLevel.level;
            const isReached = xp >= level.minXP;
            const xpNeeded = level.minXP - xp;
            return (
              <div
                key={level.level}
                className={`p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-white border-2 border-indigo-500'
                    : isReached
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800">{level.title}</p>
                      <p className="text-xs text-gray-500">{level.minXP} XP</p>
                      {!isReached && !isCurrent && (
                        <p className="text-xs text-orange-600 font-semibold">
                          {xpNeeded} XP to go
                        </p>
                      )}
                    </div>
                  </div>
                  {isReached && <span className="text-green-600 font-bold">✓</span>}
                  {isCurrent && <span className="text-indigo-600 font-bold">Current</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelingSystem;
