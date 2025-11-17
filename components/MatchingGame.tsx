'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { VocabSet } from '@/lib/types';
import { getSetById } from '@/lib/api';
import Spinner from './Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

type Card = {
  id: string;
  content: string;
  type: 'word' | 'meaning';
  originalId: string; // ID of the vocab item
  matched: boolean;
};

type MatchingGameProps = {
  onComplete?: () => void; // Callback for MixedStudyMode
};

const MatchingGame: React.FC<MatchingGameProps> = ({ onComplete }) => {
  const params = useParams<{ setId: string }>();
  const { setId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(AppContext);

  const [studySet, setStudySet] = useState<VocabSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leftCards, setLeftCards] = useState<Card[]>([]);
  const [rightCards, setRightCards] = useState<Card[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  if (!context) return null;
  const { state } = context;

  const gameComplete = matchedPairs.size === studySet?.items.length;

  // Load set from context or API
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

  // Initialize cards
  useEffect(() => {
    if (studySet) {
      // Create left cards (words) - keep in order
      const left: Card[] = studySet.items.map((item) => ({
        id: `word-${item._id || item.id}`,
        content: item.hanzi,
        type: 'word' as const,
        originalId: item._id || item.id,
        matched: false,
      }));

      // Create right cards (meanings) - shuffle
      const right: Card[] = studySet.items
        .map((item) => ({
          id: `meaning-${item._id || item.id}`,
          content: item.meaning,
          type: 'meaning' as const,
          originalId: item._id || item.id,
          matched: false,
        }))
        .sort(() => Math.random() - 0.5); // Shuffle meanings

      setLeftCards(left);
      setRightCards(right);
      setStartTime(Date.now());
    }
  }, [studySet]);

  // Timer
  useEffect(() => {
    if (!startTime || gameComplete) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameComplete]);

  // Check for match when both cards selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftCard = leftCards.find(c => c.id === selectedLeft);
      const rightCard = rightCards.find(c => c.id === selectedRight);

      if (leftCard && rightCard && leftCard.originalId === rightCard.originalId) {
        // Correct match!
        const newMatchedPairs = new Set([...matchedPairs, leftCard.originalId]);
        setMatchedPairs(newMatchedPairs);
        setSelectedLeft(null);
        setSelectedRight(null);
        
        // Check if game completed
        if (newMatchedPairs.size === studySet?.items.length && onComplete) {
          // If onComplete provided (MixedStudyMode), call it after short delay
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      } else {
        // Wrong match
        setWrongMatch(true);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongMatch(false);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, leftCards, rightCards, matchedPairs, studySet, onComplete]);

  const handleCardClick = (cardId: string, side: 'left' | 'right') => {
    if (wrongMatch) return; // Block clicks during wrong match feedback

    const card = side === 'left' 
      ? leftCards.find(c => c.id === cardId)
      : rightCards.find(c => c.id === cardId);
    
    if (!card || matchedPairs.has(card.originalId)) return;

    if (side === 'left') {
      setSelectedLeft(prev => prev === cardId ? null : cardId);
    } else {
      setSelectedRight(prev => prev === cardId ? null : cardId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!studySet) {
    return (
      <div className="text-center text-red-600 mt-8">
        Không tìm thấy bộ từ
      </div>
    );
  }

  // If onComplete provided (MixedStudyMode), don't show completion screen
  // Just render the game and let parent handle completion
  if (gameComplete && onComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-green-600 mb-4">Hoàn thành!</h2>
          <p className="text-xl text-gray-600">Đang chuyển sang phần tiếp theo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      {!gameComplete ? (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition-colors"
            >
              ← Quay lại
            </button>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🧩 Ghép Từ Vựng
              </h1>
              <p className="text-gray-600 text-lg mb-4">{studySet.title}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2.5 rounded-xl border-2 border-green-200">
                  <span className="text-gray-700 font-medium">✅ Đã ghép: </span>
                  <span className="text-green-600 font-bold text-lg">{matchedPairs.size}/{studySet.items.length}</span>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2.5 rounded-xl border-2 border-orange-200">
                  <span className="text-gray-700 font-medium">⏱️ Thời gian: </span>
                  <span className="text-orange-600 font-bold text-lg font-mono">{formatTime(elapsed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Words */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center py-3 rounded-xl shadow-md">
                <h2 className="text-xl font-bold">📝 Từ Vựng</h2>
              </div>
              {leftCards.map((card) => {
                const isMatched = matchedPairs.has(card.originalId);
                const isSelected = selectedLeft === card.id;
                const isWrong = wrongMatch && isSelected;
                
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id, 'left')}
                    disabled={isMatched}
                    style={{ minHeight: '80px' }}
                    className={`
                      w-full p-4 rounded-xl font-semibold text-lg text-left transition-all duration-300 transform
                      ${isMatched 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 cursor-default opacity-60' 
                        : isWrong
                          ? 'bg-red-100 border-3 border-red-500 text-red-700 animate-shake'
                          : isSelected
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-3 border-indigo-600 shadow-2xl scale-105'
                            : 'bg-white text-gray-800 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl hover:scale-102'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between min-h-[48px]">
                      <div>
                        <div className="text-2xl mb-1">{card.content}</div>
                        {/* Show pinyin if available from original item */}
                        {studySet.items.find(item => (item._id || item.id) === card.originalId)?.pinyin && (
                          <div className={`text-sm ${isMatched ? 'text-green-600' : isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                            {studySet.items.find(item => (item._id || item.id) === card.originalId)?.pinyin}
                          </div>
                        )}
                      </div>
                      {isMatched && <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column - Meanings */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 rounded-xl shadow-md">
                <h2 className="text-xl font-bold">🔤 Nghĩa</h2>
              </div>
              {rightCards.map((card) => {
                const isMatched = matchedPairs.has(card.originalId);
                const isSelected = selectedRight === card.id;
                const isWrong = wrongMatch && isSelected;
                
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id, 'right')}
                    disabled={isMatched}
                    style={{ minHeight: '80px' }}
                    className={`
                      w-full p-4 rounded-xl font-semibold text-lg text-left transition-all duration-300 transform
                      ${isMatched 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 cursor-default opacity-60' 
                        : isWrong
                          ? 'bg-red-100 border-3 border-red-500 text-red-700 animate-shake'
                          : isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-3 border-purple-600 shadow-2xl scale-105'
                            : 'bg-white text-gray-800 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:scale-102'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between min-h-[48px]">
                      <div className="text-xl">{card.content}</div>
                      {isMatched && <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Completion Screen
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border-4 border-green-200">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Tuyệt vời!
            </h2>
            <p className="text-xl text-gray-600 mb-8">Bạn đã hoàn thành trò chơi</p>
            
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-indigo-100">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-600 font-semibold mb-2">⏱️ Thời gian</div>
                  <div className="text-3xl font-bold text-indigo-600">{formatTime(elapsed)}</div>
                </div>
                <div>
                  <div className="text-gray-600 font-semibold mb-2">✅ Hoàn thành</div>
                  <div className="text-3xl font-bold text-green-600">{matchedPairs.size}/{studySet.items.length}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                router.push(`/set/${setId}`);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingGame;
