'use client';

import React, { useContext, useMemo } from 'react';
import { AppContext } from '@/context/AppContext';
import { FlameIcon } from './icons/FlameIcon';
import { AwardIcon } from './icons/AwardIcon';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: (user: any) => boolean;
}

const StreakAndAchievements: React.FC = () => {
  const context = useContext(AppContext);

  if (!context?.state.user) return null;

  const user = context.state.user;
  const currentStreak = user.currentStreak || 0;
  const longestStreak = user.longestStreak || 0;
  const xp = user.xp || 0;

  const achievements: Achievement[] = [
    {
      id: 'first-step',
      name: 'First Step',
      description: 'Hoàn thành lần đầu tiên',
      icon: '🚀',
      color: 'from-blue-400 to-blue-600',
      requirement: () => xp >= 10,
    },
    {
      id: 'steady-learner',
      name: 'Steady Learner',
      description: 'Duy trì 7 ngày streak',
      icon: '📚',
      color: 'from-green-400 to-green-600',
      requirement: () => longestStreak >= 7,
    },
    {
      id: 'momentum',
      name: 'Momentum',
      description: 'Duy trì 14 ngày streak',
      icon: '🔥',
      color: 'from-orange-400 to-orange-600',
      requirement: () => longestStreak >= 14,
    },
    {
      id: 'sagacity',
      name: 'Sagacity',
      description: 'Duy trì 30 ngày streak',
      icon: '👑',
      color: 'from-yellow-400 to-yellow-600',
      requirement: () => longestStreak >= 30,
    },
    {
      id: 'xp-collector',
      name: 'XP Collector',
      description: 'Tích lũy 1000 XP',
      icon: '⭐',
      color: 'from-purple-400 to-purple-600',
      requirement: () => xp >= 1000,
    },
    {
      id: 'ultimate-sage',
      name: 'Ultimate Sage',
      description: 'Đạt cấp độ Sage (3500 XP)',
      icon: '🧙',
      color: 'from-indigo-400 to-indigo-600',
      requirement: () => xp >= 3500,
    },
  ];

  const unlockedAchievements = useMemo(
    () => achievements.filter(a => a.requirement(user)),
    [user]
  );

  const streakPercentage = Math.min((currentStreak / 30) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Streak Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">🔥</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Streak của bạn</h2>
            <p className="text-gray-600">Học tập liên tục = XP bonus</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {currentStreak}
            </div>
            <p className="text-sm font-semibold text-gray-700">Current Streak</p>
            <p className="text-xs text-gray-500">Ngày liên tiếp</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {longestStreak}
            </div>
            <p className="text-sm font-semibold text-gray-700">Best Streak</p>
            <p className="text-xs text-gray-500">Kỷ lục cá nhân</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Hướng tới Sagacity (30 ngày)
            </span>
            <span className="text-sm font-bold text-orange-600">
              {streakPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-orange-100 rounded-lg text-sm text-orange-800">
          <p className="font-semibold mb-2">💡 Mẹo:</p>
          <p>
            Mỗi ngày bạn học, bạn nhận +2 XP bonus. Duy trì 30 ngày liên tục để mở
            khóa <strong>Sagacity Badge</strong> 👑
          </p>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">🏆</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Thành Tựu</h2>
            <p className="text-gray-600">
              {unlockedAchievements.length} / {achievements.length} mở khóa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.some(
              a => a.id === achievement.id
            );
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg transition-all ${
                  isUnlocked
                    ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg transform scale-100`
                    : 'bg-gray-200 text-gray-400 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="font-bold text-sm mb-1">{achievement.name}</p>
                <p className={`text-xs ${isUnlocked ? 'opacity-90' : 'opacity-60'}`}>
                  {achievement.description}
                </p>
                {!isUnlocked && (
                  <div className="mt-2 text-xs opacity-70">
                    <p>🔒 Khóa</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress to Next Achievement */}
        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm font-bold text-gray-800 mb-4">
            📈 Tiến độ hướng tới thành tựu tiếp theo
          </p>
          <div className="space-y-3">
            {achievements
              .filter(a => !unlockedAchievements.some(ua => ua.id === a.id))
              .slice(0, 2)
              .map((achievement) => (
                <div key={achievement.id}>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {achievement.icon} {achievement.name}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakAndAchievements;
