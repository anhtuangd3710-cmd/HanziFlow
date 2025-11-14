'use client';

import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { VocabSet, VocabItem } from '@/lib/types';
import { getSetById } from '@/lib/api';
import Spinner from './Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

type MatchPair = {
  id: string;
  word: VocabItem;
  meaning: string;
  matched: boolean;
};

const MatchingGame: React.FC = () => {
  const params = useParams<{ setId: string }>();
  const { setId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(AppContext);

  const [studySet, setStudySet] = useState<VocabSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  if (!context) return null;
  const { state } = context;

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

  // Initialize pairs
  useEffect(() => {
    if (studySet) {
      const newPairs: MatchPair[] = studySet.items.map((item) => ({
        id: item._id || item.id,
        word: item,
        meaning: item.meaning,
        matched: false,
      }));
      
      // Shuffle meanings
      const shuffledMeanings = newPairs.map(p => p.meaning).sort(() => Math.random() - 0.5);
      const pairedItems = newPairs.map((p, idx) => ({
        ...p,
        meaning: shuffledMeanings[idx],
      }));

      setPairs(pairedItems);
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

  // Check for match
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftPair = pairs.find(p => p.id === selectedLeft);
      const rightMeaning = pairs.find(p => p.id === selectedRight)?.word.meaning;

      if (leftPair && leftPair.meaning === rightMeaning) {
        // Match found!
        setPairs(pairs.map(p => 
          (p.id === selectedLeft || p.id === selectedRight) 
            ? { ...p, matched: true }
            : p
        ));
        setMatchedCount(prev => prev + 1);
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if game complete
        if (matchedCount + 1 === studySet?.items.length) {
          setGameComplete(true);
        }
      } else {
        // Wrong match - reset after delay
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 500);
      }
    }
  }, [selectedLeft, selectedRight, pairs, matchedCount, studySet]);

  if (isLoading) return <Spinner />;
  if (!studySet) return <div>Không tìm thấy bộ từ</div>;

  const leftItems = pairs;
  // Create right items in same order - meanings are already shuffled in pairs during init
  const rightItems = pairs;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
          >
            ← Quay lại
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧩 Ghép Từ Vựng</h1>
          <p className="text-gray-600 mb-4">{studySet.title}</p>

          {/* Progress and Timer */}
          <div className="flex items-center gap-8 text-lg font-semibold">
            <div className="bg-white px-6 py-3 rounded-lg shadow">
              <span className="text-gray-600">Đã ghép: </span>
              <span className="text-indigo-600">{matchedCount}/{studySet.items.length}</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow">
              <span className="text-gray-600">Thời gian: </span>
              <span className="text-orange-600 font-mono">{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {!gameComplete ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Left Column - Words */}
          <div className="space-y-3" style={{ minWidth: 0 }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Từ Vựng</h2>
            {leftItems.map((pair) => (
              <button
                key={pair.id}
                onClick={() => {
                  if (!pair.matched && selectedLeft !== pair.id) {
                    setSelectedLeft(pair.id);
                  }
                }}
                disabled={pair.matched}
                className={`w-full p-4 rounded-lg font-semibold text-left transition-all duration-200 transform ${
                  pair.matched
                    ? 'bg-green-200 text-green-800 opacity-50 cursor-default'
                    : selectedLeft === pair.id
                    ? 'bg-purple-500 text-white scale-105 shadow-lg'
                    : 'bg-white text-gray-800 hover:shadow-lg border-2 border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{pair.word.hanzi}</span>
                  {pair.matched && <CheckCircleIcon className="text-green-600" />}
                </div>
                <div className="text-sm opacity-75">{pair.word.pinyin}</div>
              </button>
            ))}
          </div>

          {/* Right Column - Meanings */}
          <div className="space-y-3" style={{ minWidth: 0 }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nghĩa</h2>
            {rightItems.map((pair) => (
              <button
                key={`meaning-${pair.id}`}
                onClick={() => {
                  if (!pair.matched && selectedRight !== pair.id) {
                    setSelectedRight(pair.id);
                  }
                }}
                disabled={pair.matched}
                className={`w-full p-4 rounded-lg font-semibold text-left transition-all duration-200 transform ${
                  pair.matched
                    ? 'bg-green-200 text-green-800 opacity-50 cursor-default'
                    : selectedRight === pair.id
                    ? 'bg-pink-500 text-white scale-105 shadow-lg'
                    : 'bg-white text-gray-800 hover:shadow-lg border-2 border-pink-200 hover:border-pink-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{pair.meaning}</span>
                  {pair.matched && <CheckCircleIcon className="text-green-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Completion Screen
        <div style={{ maxWidth: '28rem', margin: '0 auto' }} className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Tuyệt vời!</h2>
            <p className="text-xl text-gray-600 mb-6">Bạn đã hoàn thành trò chơi</p>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
              <div className="text-lg text-gray-700 mb-4">
                <div className="font-semibold text-gray-800">Thời gian</div>
                <div className="text-3xl font-bold text-purple-600">{formatTime(elapsed)}</div>
              </div>
              <div className="text-lg text-gray-700">
                <div className="font-semibold text-gray-800">Từ đã ghép</div>
                <div className="text-3xl font-bold text-pink-600">{studySet.items.length}/{studySet.items.length}</div>
              </div>
            </div>

            <button
              onClick={() => {
                // Mark mode as completed in sessionStorage for MixedStudyMode
                if (searchParams.get('studyMode') === 'mixed') {
                  sessionStorage.setItem('mixedModeCompleted', 'true');
                }
                router.back();
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Quay lại
            </button>
        </div>
      )}
    </div>
  );
};

export default MatchingGame;
