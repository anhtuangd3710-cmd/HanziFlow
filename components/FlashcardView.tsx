'use client';


import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { VocabItem, VocabSet } from '@/lib/types';
import { speakText } from '@/lib/geminiService';
import { getSetById } from '@/lib/api';
import { Volume2Icon } from './icons/Volume2Icon';
import { StarIcon } from './icons/StarIcon';
import Spinner from './Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface LocationState {
    studyMode: 'all' | 'review';
}

const FlashcardView: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(AppContext);
  
  const { studyMode } = { studyMode: (searchParams.get('studyMode') as 'all' | 'review') || 'all' };

  const [studySet, setStudySet] = useState<VocabSet | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionItems, setSessionItems] = useState<VocabItem[]>([]);
  
  if (!context) return <div>Loading...</div>;
  const { state, saveSet } = context;

  const setFromContext = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);

  useEffect(() => {
    if (setFromContext) {
      setStudySet(setFromContext);
      setIsLoading(false);
      return;
    }

    const fetchStudySet = async () => {
      if (!setId) { setStudySet(null); setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const fetchedSet = await getSetById(setId);
        setStudySet(fetchedSet);
      } catch (error) {
        console.error("Failed to fetch study set:", error);
        setStudySet(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudySet();
  }, [setId, setFromContext]);


  useEffect(() => {
    if (studySet) {
        let items = studyMode === 'review' 
            ? studySet.items.filter(item => item.needsReview)
            : studySet.items;
      
        setSessionItems([...items].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setIsFlipped(false);
    }
  }, [studySet, studyMode]);

  const updateReviewStatus = useCallback(async (item: VocabItem, needsReview: boolean) => {
    if (!studySet || item.needsReview === needsReview) return;
    
    setIsSaving(true);
    const updatedItems = studySet.items.map(i =>
      i.id === item.id ? { ...i, needsReview } : i
    );
    const updatedSet = { ...studySet, items: updatedItems };
    
    // Optimistic update for UI
    setStudySet(updatedSet);
    
    await saveSet(updatedSet);
    setIsSaving(false);
  }, [studySet, saveSet]);


  const handleAssessment = (correct: boolean) => {
    if (!currentItem) return;
    updateReviewStatus(currentItem, !correct);
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 150);
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (sessionItems.length === 0 || currentIndex >= sessionItems.length) return;

        if (e.code === 'Space') {
            e.preventDefault();
            setIsFlipped(f => !f);
        }
        if (isFlipped) {
            if (e.code === 'ArrowLeft') handleAssessment(false); // Wrong
            if (e.code === 'ArrowRight') handleAssessment(true); // Right
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionItems, currentIndex]);

  const currentItem = sessionItems[currentIndex];

  if (isLoading) return <div className="flex justify-center mt-8"><Spinner /></div>;
  if (!studySet) return <div>Set not found. <button onClick={() => router.push('/')}>Go back.</button></div>;
  if (sessionItems.length === 0) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-700">No Words to Study</h3>
            <p className="text-gray-500 mt-2">
                {studyMode === 'review' 
                    ? "You have no words marked for review in this set."
                    : "This set is currently empty."
                }
            </p>
            <button onClick={() => router.push('/')} className="mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to Dashboard
            </button>
        </div>
      );
  }

  if (currentIndex >= sessionItems.length) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-green-600">Session Complete!</h3>
            <p className="text-gray-600 mt-2">You've reviewed all the words for this session.</p>
            <div className="flex justify-center gap-4 mt-6">
                <button onClick={() => router.push('/')} className="py-2 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
                    Finish
                </button>
                <button onClick={() => { setCurrentIndex(0); setSessionItems([...sessionItems].sort(() => Math.random() - 0.5)) }} className="py-2 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    Study Again
                </button>
            </div>
        </div>
      )
  }

  const progressPercentage = (currentIndex / sessionItems.length) * 100;
  
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full mb-4">
        <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-2xl font-bold text-gray-700">{studySet.title}</h2>
            <p className="text-lg text-gray-500">{currentIndex + 1} / {sessionItems.length}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{width: `${progressPercentage}%`}}></div>
        </div>
      </div>
      
      <div className="w-full h-80 perspective-1000">
        <div 
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer">
            <button
                onClick={(e) => handleSpeak(e, currentItem.hanzi)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Play pronunciation"
            >
                <Volume2Icon size={28} />
            </button>
             {isSaving && <div className="absolute top-4 left-4"><Spinner /></div>}
            <button
                onClick={(e) => { e.stopPropagation(); updateReviewStatus(currentItem, !currentItem.needsReview); }}
                className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${currentItem?.needsReview ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="Mark for review"
                title={currentItem?.needsReview ? "Unmark from review" : "Mark for review"}
            >
                <StarIcon size={28} filled={!!currentItem?.needsReview} />
            </button>
            <p className="text-6xl font-semibold">{currentItem.hanzi}</p>
            <p className="text-2xl text-gray-500 mt-4">{currentItem.pinyin}</p>
          </div>
          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden bg-blue-500 text-white rounded-lg shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer rotate-y-180">
            <div className="text-center">
                <p className="text-4xl font-bold">{currentItem.meaning}</p>
                {currentItem.exampleSentence && (
                    <p className="text-lg mt-4 opacity-90 italic whitespace-pre-wrap">{currentItem.exampleSentence}</p>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {isFlipped ? (
         <div className="mt-8 flex w-full justify-center gap-4">
             <button onClick={() => handleAssessment(false)} className="w-48 flex items-center justify-center gap-2 py-3 px-6 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition-colors">
                 <XCircleIcon size={20} />
                 Need to Review
             </button>
             <button onClick={() => handleAssessment(true)} className="w-48 flex items-center justify-center gap-2 py-3 px-6 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors">
                 <CheckCircleIcon size={20} />
                 Got It Right
             </button>
         </div>
      ) : (
        <div className="mt-8 flex w-full justify-center">
            <button onClick={() => setIsFlipped(true)} className="w-full max-w-xs py-3 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
                Show Answer
            </button>
        </div>
      )}
      
       <button onClick={() => router.push('/')} className="mt-8 text-gray-600 hover:text-gray-800 font-semibold">
           ← Back to Dashboard
       </button>
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
    </div>
  );
};

export default FlashcardView;
