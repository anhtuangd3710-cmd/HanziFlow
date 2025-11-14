'use client';

import React from 'react';

interface SRSLevelDisplayProps {
  level?: number;
  nextReviewDate?: string;
}

const SRSLevelDisplay: React.FC<SRSLevelDisplayProps> = ({ level = 0, nextReviewDate }) => {
  const levels = [
    { name: 'New', color: 'bg-gray-100 text-gray-800', icon: '🆕', description: 'Chưa học' },
    { name: 'Learning', color: 'bg-red-100 text-red-800', icon: '🔴', description: 'Đang học' },
    { name: 'Review 1', color: 'bg-orange-100 text-orange-800', icon: '🟠', description: 'Ôn tập lần 1' },
    { name: 'Review 2', color: 'bg-yellow-100 text-yellow-800', icon: '🟡', description: 'Ôn tập lần 2' },
    { name: 'Review 3', color: 'bg-lime-100 text-lime-800', icon: '🟢', description: 'Ôn tập lần 3' },
    { name: 'Known', color: 'bg-green-100 text-green-800', icon: '✅', description: 'Đã biết' },
  ];

  const currentLevel = Math.min(level || 0, levels.length - 1);
  const currentLevelData = levels[currentLevel];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sớm';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff <= 0) return 'Ngay hôm nay';
    if (diff === 1) return 'Ngày mai';
    if (diff <= 7) return `${diff} ngày`;
    return `${Math.ceil(diff / 7)} tuần`;
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentLevelData.color} text-sm font-semibold`}>
      <span>{currentLevelData.icon}</span>
      <span title={currentLevelData.description}>{currentLevelData.name}</span>
      {nextReviewDate && (
        <span className="text-xs opacity-75">({formatDate(nextReviewDate)})</span>
      )}
    </div>
  );
};

export default SRSLevelDisplay;
