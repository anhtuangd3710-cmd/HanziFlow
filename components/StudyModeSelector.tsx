'use client';

import React, { useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { FlameIcon } from './icons/FlameIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface StudyMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const StudyModeSelector: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ setId: string }>();
  const { setId } = params;
  const context = useContext(AppContext);

  if (!context) return null;
  const { state } = context;
  const studySet = state.vocabSets.find(s => s._id === setId);

  if (!studySet) return <div className="text-center py-10">Không tìm thấy bộ từ</div>;

  const studyModes: StudyMode[] = [
    {
      id: 'mixed',
      name: 'Học Hỗn Hợp',
      description: 'Kết hợp tất cả kiểu học - cách tốt nhất để nắm vững từ vựng',
      icon: '🎯',
      color: 'bg-gradient-to-br from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200',
      path: `/set/${setId}/study?studyMode=mixed`,
    },
    {
      id: 'flashcard',
      name: 'Flashcard',
      description: 'Lật thẻ từ để ôn tập. Đánh dấu từ cần ôn lại',
      icon: <BookOpenIcon />,
      color: 'bg-blue-100 hover:bg-blue-200',
      path: `/set/${setId}/flashcard`,
    },
    {
      id: 'matching',
      name: 'Ghép từ',
      description: 'Ghép từ vựng với nghĩa của chúng',
      icon: <BrainCircuitIcon />,
      color: 'bg-purple-100 hover:bg-purple-200',
      path: `/set/${setId}/matching`,
    },
    {
      id: 'lightning',
      name: 'Nhanh nhất',
      description: 'Trả lời nhanh nhất có thể - kiểm tra kiến thức',
      icon: <FlameIcon />,
      color: 'bg-orange-100 hover:bg-orange-200',
      path: `/set/${setId}/lightning-quiz`,
    },
    {
      id: 'writing',
      name: 'Viết từ',
      description: 'Viết từ Pinyin hoặc nghĩa từ hình ảnh Hanzi',
      icon: <ChartBarIcon />,
      color: 'bg-green-100 hover:bg-green-200',
      path: `/set/${setId}/writing-practice`,
    },
    {
      id: 'quiz',
      name: 'Kiểm tra',
      description: 'Quiz tiêu chuẩn với các loại câu hỏi khác nhau',
      icon: <CheckCircleIcon />,
      color: 'bg-red-100 hover:bg-red-200',
      path: `/set/${setId}/quiz`,
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Chọn Cách Học</h1>
          <p className="text-gray-600">
            <span className="font-semibold">{studySet.title}</span> • {studySet.items.length} từ
          </p>
        </div>

        {/* Study Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {studyModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => router.push(mode.path)}
              className={`${mode.color} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-102 text-left ${mode.id === 'mixed' ? 'sm:col-span-2 lg:col-span-3' : ''}`}
            >
              <div className={`${mode.id === 'mixed' ? 'text-4xl' : 'text-3xl'} mb-2`}>
                {mode.icon}
              </div>
              <h3 className={`${mode.id === 'mixed' ? 'text-lg' : 'text-base'} font-bold text-gray-800 mb-1`}>
                {mode.name}
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm">
                {mode.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyModeSelector;
