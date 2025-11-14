'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { VocabSet, VocabItem } from '@/lib/types';
import { getSetById } from '@/lib/api';
import Spinner from './Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

type PracticeMode = 'pinyin' | 'meaning';

const WritingPractice: React.FC = () => {
  const params = useParams<{ setId: string }>();
  const { setId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(AppContext);

  const [studySet, setStudySet] = useState<VocabSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('meaning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [sessionStart, setSessionStart] = useState(false);

  if (!context) return null;
  const { state } = context;

  // Load set
  useEffect(() => {
    const setFromContext = state.vocabSets.find(s => s._id === setId);
    if (setFromContext) {
      setStudySet(setFromContext);
      setIsLoading(false);
      return;
    }

    const fetchSet = async () => {
      try {
        const set = await getSetById(setId);
        setStudySet(set);
      } catch (error) {
        console.error('Failed to fetch set:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSet();
  }, [setId, state.vocabSets]);

  const checkAnswer = (input: string) => {
    if (!studySet) return;
    
    const current = studySet.items[currentIndex];
    let correct = false;

    if (practiceMode === 'pinyin') {
      correct = input.toLowerCase().trim() === current.pinyin.toLowerCase();
    } else {
      correct = input.toLowerCase().trim() === current.meaning.toLowerCase();
    }

    setIsCorrect(correct);
    setAnswered(true);
    if (correct) {
      setScore(score + 1);
    }
    setTotalAnswered(totalAnswered + 1);
  };

  const handleNext = () => {
    if (currentIndex < (studySet?.items.length ?? 0) - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setAnswered(false);
      setIsCorrect(false);
    } else {
      // Show summary
      alert(`Hoàn thành! Bạn trả lời đúng ${score}/${totalAnswered}`);
      router.back();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!answered) {
        checkAnswer(userInput);
      } else {
        handleNext();
      }
    }
  };

  if (isLoading) return <Spinner />;
  if (!studySet) return <div>Không tìm thấy bộ từ</div>;

  if (!sessionStart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              if (searchParams.get('studyMode') === 'mixed') {
                sessionStorage.setItem('mixedModeCompleted', 'true');
              }
              router.back();
            }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
          >
            ← Quay lại
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">✍️</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Viết Từ</h1>
            <p className="text-gray-600 mb-8">
              Chọn chế độ luyện tập để bắt đầu
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setPracticeMode('meaning');
                  setSessionStart(true);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="text-2xl mb-2">📝</div>
                <div>Viết Nghĩa Tiếng Việt</div>
                <div className="text-sm opacity-90 mt-2">Nhìn từ Hanzi → Viết nghĩa</div>
              </button>

              <button
                onClick={() => {
                  setPracticeMode('pinyin');
                  setSessionStart(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="text-2xl mb-2">🔤</div>
                <div>Viết Phiên Âm</div>
                <div className="text-sm opacity-90 mt-2">Nhìn từ Hanzi → Viết Pinyin</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = studySet.items[currentIndex];
  const prompt = practiceMode === 'pinyin' 
    ? `Viết phiên âm của: ${current.hanzi}`
    : `Viết nghĩa tiếng Việt của: ${current.hanzi}`;

  const placeholder = practiceMode === 'pinyin'
    ? 'Ví dụ: ni3hao3 hoặc nǐhǎo'
    : 'Ví dụ: xin chào';

  const correctAnswer = practiceMode === 'pinyin' ? current.pinyin : current.meaning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (searchParams.get('studyMode') === 'mixed') {
                sessionStorage.setItem('mixedModeCompleted', 'true');
              }
              router.back();
            }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
          >
            ← Quay lại
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {practiceMode === 'pinyin' ? '🔤 Viết Pinyin' : '📝 Viết Nghĩa'}
            </h1>
            <div className="bg-white px-6 py-2 rounded-lg shadow font-semibold">
              {currentIndex + 1}/{studySet.items.length}
            </div>
          </div>

          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / studySet.items.length) * 100}%`,
              }}
            />
          </div>

          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Điểm: {score}/{totalAnswered}</span>
            <span>Độ chính xác: {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-8">
          <h2 className="text-gray-600 mb-4">{prompt}</h2>
          <div className="text-7xl font-bold text-gray-800 mb-6">
            {current.hanzi}
          </div>
          <div className="text-xl text-gray-500">
            {current.pinyin}
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={answered}
            autoFocus
            className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:bg-gray-100"
          />

          {answered && (
            <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center gap-3 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircleIcon className="text-green-600" size={24} />
                    <span className="font-bold text-green-800">Chính xác!</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="text-red-600" size={24} />
                    <span className="font-bold text-red-800">Sai rồi</span>
                  </>
                )}
              </div>
              <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                Đáp án đúng: <span className="font-semibold">{correctAnswer}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!answered ? (
          <button
            onClick={() => checkAnswer(userInput)}
            disabled={!userInput.trim()}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kiểm Tra Đáp Án
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition"
          >
            {currentIndex < studySet.items.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành'}
          </button>
        )}
      </div>
    </div>
  );
};

export default WritingPractice;
