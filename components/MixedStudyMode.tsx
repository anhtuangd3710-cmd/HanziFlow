'use client';

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import FlashcardView from './FlashcardView';
import MatchingGame from './MatchingGame';
import WritingPractice from './WritingPractice';
import LightningQuizView from './LightningQuizView';
import QuizView from './QuizView';

type StudyMode = 'flashcard' | 'matching' | 'writing' | 'lightning' | 'quiz';

const MODES_ORDER: StudyMode[] = ['flashcard', 'matching', 'writing', 'lightning', 'quiz'];

const MODE_INFO: Record<StudyMode, { name: string; icon: string }> = {
  flashcard: { name: 'Flashcard', icon: '📚' },
  matching: { name: 'Ghép Từ', icon: '🧩' },
  writing: { name: 'Viết Từ', icon: '✍️' },
  lightning: { name: 'Nhanh Nhất', icon: '⚡' },
  quiz: { name: 'Kiểm Tra', icon: '📝' },
};

const MixedStudyMode: React.FC = () => {
  const [currentModeIndex, setCurrentModeIndex] = useState(0);
  const [completedModes, setCompletedModes] = useState<StudyMode[]>([]);
  const [canProceed, setCanProceed] = useState(false);
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const modeCompletedRef = useRef(false);

  if (!context?.state.user) return null;

  const currentMode = MODES_ORDER[currentModeIndex];
  const progress = Math.round(((completedModes.length) / MODES_ORDER.length) * 100);
  const isFinished = currentModeIndex === MODES_ORDER.length;

  // Monitor for mode completion via sessionStorage
  useEffect(() => {
    const checkCompletion = () => {
      if (typeof window !== 'undefined' && sessionStorage.getItem('mixedModeCompleted') === 'true') {
        sessionStorage.removeItem('mixedModeCompleted');
        
        // Mark current mode as completed
        if (!completedModes.includes(currentMode)) {
          setCompletedModes(prev => [...prev, currentMode]);
          setCanProceed(true); // Cho phép chuyển sang giai đoạn tiếp theo
        }
        
        // Auto advance to next mode after 2 seconds
        setTimeout(() => {
          if (currentModeIndex < MODES_ORDER.length - 1) {
            setCurrentModeIndex(prev => prev + 1);
            setCanProceed(false); // Reset trạng thái cho giai đoạn mới
          } else {
            setCurrentModeIndex(MODES_ORDER.length);
          }
        }, 2000);
      }
    };

    const interval = setInterval(checkCompletion, 500);
    return () => clearInterval(interval);
  }, [currentModeIndex, completedModes, currentMode]);

  // Reset canProceed when mode changes
  useEffect(() => {
    setCanProceed(false);
  }, [currentModeIndex]);

  const handleNextMode = () => {
    if (!canProceed) return; // Không cho phép nếu chưa hoàn thành
    
    if (currentModeIndex < MODES_ORDER.length - 1) {
      setCurrentModeIndex(prev => prev + 1);
      setCanProceed(false); // Reset trạng thái cho giai đoạn mới
    } else {
      setCurrentModeIndex(MODES_ORDER.length);
    }
  };

  // Show completion screen
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Hoàn Thành Học Hỗn Hợp!</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Bạn đã hoàn thành tất cả 5 chế độ học. Tuyệt vời!
            </p>

            <div className="bg-indigo-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 font-semibold mb-4">Các chế độ hoàn thành:</p>
              <div className="space-y-2">
                {MODES_ORDER.map((mode) => (
                  <div key={mode} className="flex items-center gap-3 justify-center">
                    <span className="text-xl">✓</span>
                    <span className="text-gray-700">{MODE_INFO[mode].name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Quay Lại
              </button>
              <button
                onClick={() => {
                  setCurrentModeIndex(0);
                  setCompletedModes([]);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Học Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render current study mode with progress bar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {MODE_INFO[currentMode].icon} {MODE_INFO[currentMode].name}
              </h2>
              <p className="text-sm text-gray-600">
                Phần {currentModeIndex + 1} / {MODES_ORDER.length}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-700">{progress}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Study Mode */}
      <div className="relative">
        {/* Next button - only shown when mode is completed */}
        {canProceed && currentModeIndex < MODES_ORDER.length && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleNextMode}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <span className="text-xl">✓</span>
              <span>Tiếp Theo</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        )}

        {/* Completion notification */}
        {canProceed && (
          <div className="fixed top-24 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            <p className="font-semibold">🎉 Hoàn thành! Tự động chuyển sau 2 giây...</p>
          </div>
        )}

        {currentMode === 'flashcard' && <FlashcardView />}
        {currentMode === 'matching' && <MatchingGame />}
        {currentMode === 'writing' && <WritingPractice />}
        {currentMode === 'lightning' && <LightningQuizView />}
        {currentMode === 'quiz' && <QuizView />}
      </div>


    </div>
  );
};

export default MixedStudyMode;
