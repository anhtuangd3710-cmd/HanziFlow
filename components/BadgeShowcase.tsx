'use client';

import React, { useContext, useMemo } from 'react';
import { AppContext } from '@/context/AppContext';

interface Badge {
  id: string;
  name: string;
  category: 'streak' | 'xp' | 'mastery' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  description: string;
  requirement: (user: any) => boolean;
  color: string;
}

const BadgeShowcase: React.FC = () => {
  const context = useContext(AppContext);

  if (!context?.state.user) return null;

  const user = context.state.user;
  const xp = user.xp || 0;
  const longestStreak = user.longestStreak || 0;
  const sets = user.sets || [];
  const communityScore = user.communityScore || 0;

  const badges: Badge[] = [
    // Streak Badges
    {
      id: 'streak-7',
      name: 'Kỷ Niệm 7 Ngày',
      category: 'streak',
      tier: 'bronze',
      icon: '🔥',
      description: 'Duy trì 7 ngày streak',
      color: 'from-orange-400 to-amber-600',
      requirement: () => longestStreak >= 7,
    },
    {
      id: 'streak-30',
      name: 'Một Tháng Không Gián Đoạn',
      category: 'streak',
      tier: 'silver',
      icon: '🌟',
      description: 'Duy trì 30 ngày streak',
      color: 'from-gray-300 to-gray-500',
      requirement: () => longestStreak >= 30,
    },
    {
      id: 'streak-100',
      name: 'Huyền Thoại Kiên Trì',
      category: 'streak',
      tier: 'gold',
      icon: '✨',
      description: 'Duy trì 100 ngày streak',
      color: 'from-yellow-300 to-yellow-600',
      requirement: () => longestStreak >= 100,
    },

    // XP Badges
    {
      id: 'xp-100',
      name: 'Bước Đầu Tiên',
      category: 'xp',
      tier: 'bronze',
      icon: '🚀',
      description: 'Tích lũy 100 XP',
      color: 'from-blue-400 to-cyan-600',
      requirement: () => xp >= 100,
    },
    {
      id: 'xp-1000',
      name: 'Học Viên Tích Cực',
      category: 'xp',
      tier: 'silver',
      icon: '📚',
      description: 'Tích lũy 1000 XP',
      color: 'from-green-400 to-emerald-600',
      requirement: () => xp >= 1000,
    },
    {
      id: 'xp-5000',
      name: 'Bậc Thầy Kiến Thức',
      category: 'xp',
      tier: 'gold',
      icon: '🧠',
      description: 'Tích lũy 5000 XP',
      color: 'from-yellow-400 to-orange-600',
      requirement: () => xp >= 5000,
    },
    {
      id: 'xp-10000',
      name: 'Khải Sáng Vô Cực',
      category: 'xp',
      tier: 'platinum',
      icon: '⭐',
      description: 'Tích lũy 10000 XP',
      color: 'from-purple-400 to-pink-600',
      requirement: () => xp >= 10000,
    },

    // Mastery Badges
    {
      id: 'mastery-5',
      name: 'Bộ Sưu Tập Nhỏ',
      category: 'mastery',
      tier: 'bronze',
      icon: '📖',
      description: 'Tạo 5 bộ từ vựng',
      color: 'from-indigo-400 to-blue-600',
      requirement: () => sets.length >= 5,
    },
    {
      id: 'mastery-20',
      name: 'Thư Viện Phong Phú',
      category: 'mastery',
      tier: 'silver',
      icon: '🏛️',
      description: 'Tạo 20 bộ từ vựng',
      color: 'from-cyan-400 to-blue-600',
      requirement: () => sets.length >= 20,
    },
    {
      id: 'mastery-50',
      name: 'Vô Duyên Nhân',
      category: 'mastery',
      tier: 'gold',
      icon: '🔮',
      description: 'Tạo 50 bộ từ vựng',
      color: 'from-pink-400 to-rose-600',
      requirement: () => sets.length >= 50,
    },

    // Community Badges
    {
      id: 'community-helper',
      name: 'Trợ Thủ Cộng Đồng',
      category: 'community',
      tier: 'silver',
      icon: '🤝',
      description: 'Chia sẻ 5 bộ với cộng đồng',
      color: 'from-teal-400 to-green-600',
      requirement: () => communityScore >= 5,
    },
    {
      id: 'community-ambassador',
      name: 'Đại Sứ Cộng Đồng',
      category: 'community',
      tier: 'gold',
      icon: '👑',
      description: 'Nhận 100 người theo dõi',
      color: 'from-yellow-400 to-yellow-600',
      requirement: () => communityScore >= 100,
    },
  ];

  const unlockedBadges = useMemo(
    () => badges.filter(b => b.requirement(user)),
    [user, badges]
  );

  const lockedBadges = badges.filter(
    b => !unlockedBadges.some(ub => ub.id === b.id)
  );

  const categoryLabels = {
    streak: '🔥 Streak',
    xp: '⭐ Trí Tuệ',
    mastery: '📚 Sáng Tạo',
    community: '🤝 Cộng Đồng',
  };

  return (
    <div className="space-y-8">
      {/* Badges Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const categoryBadges = badges.filter(b => b.category === key);
          const unlockedCount = unlockedBadges.filter(
            b => b.category === key
          ).length;
          return (
            <div
              key={key}
              className="bg-white rounded-lg p-4 text-center shadow-md"
            >
              <p className="text-2xl mb-2">{label.split(' ')[0]}</p>
              <p className="text-3xl font-bold text-indigo-600 mb-1">
                {unlockedCount}/{categoryBadges.length}
              </p>
              <p className="text-xs text-gray-600">{label.split(' ')[1]}</p>
            </div>
          );
        })}
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            🏆 Badges Của Bạn ({unlockedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-gradient-to-br ${badge.color} rounded-lg p-4 text-center text-white shadow-lg transform transition-all hover:scale-110 animate-bounce-slow`}
              >
                <div className="text-4xl mb-2 text-center">{badge.icon}</div>
                <p className="text-xs font-bold mb-1">{badge.name}</p>
                <p className="text-xs opacity-90">{badge.description}</p>
                <div className="mt-2">
                  {badge.tier === 'platinum' && <span className="text-lg">💎</span>}
                  {badge.tier === 'gold' && <span className="text-lg">🥇</span>}
                  {badge.tier === 'silver' && <span className="text-lg">🥈</span>}
                  {badge.tier === 'bronze' && <span className="text-lg">🥉</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="bg-gray-100 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            🔒 Badges Chưa Mở Khóa ({lockedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-300 rounded-lg p-4 text-center text-gray-600 opacity-50 shadow"
              >
                <div className="text-4xl mb-2 text-center opacity-50">
                  {badge.icon}
                </div>
                <p className="text-xs font-bold mb-1 line-clamp-2">
                  {badge.name}
                </p>
                <p className="text-xs opacity-75 line-clamp-2">
                  {badge.description}
                </p>
                <div className="mt-2 text-lg">🔐</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Tiers Explanation */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📊 Các Cấp Độ Badge
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-orange-100 rounded-lg text-center">
            <p className="text-3xl mb-2">🥉</p>
            <p className="font-bold text-orange-900">Bronze</p>
            <p className="text-sm text-orange-700">Mới bắt đầu</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-3xl mb-2">🥈</p>
            <p className="font-bold text-gray-900">Silver</p>
            <p className="text-sm text-gray-700">Đang tiến bộ</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg text-center">
            <p className="text-3xl mb-2">🥇</p>
            <p className="font-bold text-yellow-900">Gold</p>
            <p className="text-sm text-yellow-700">Rất xuất sắc</p>
          </div>
          <div className="p-4 bg-purple-100 rounded-lg text-center">
            <p className="text-3xl mb-2">💎</p>
            <p className="font-bold text-purple-900">Platinum</p>
            <p className="text-sm text-purple-700">Vô địch</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
        <p className="text-lg font-bold text-blue-900 mb-3">💡 Bí Kíp Mở Khóa Badges</p>
        <ul className="space-y-2 text-blue-800">
          <li>✅ Duy trì streak liên tục để nhận badge Streak</li>
          <li>✅ Hoàn thành bài tập để tăng XP và mở khóa badge Trí Tuệ</li>
          <li>✅ Tạo và chia sẻ bộ từ vựng để nhận badge Cộng Đồng</li>
          <li>✅ Mỗi badge mở khóa sẽ được hiển thị trên profile của bạn</li>
        </ul>
      </div>
    </div>
  );
};

export default BadgeShowcase;
