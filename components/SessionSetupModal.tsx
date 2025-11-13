'use client';


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VocabSet, QuestionType } from '@/lib/types';
import { XIcon } from './icons/XIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { ZapIcon } from './icons/ZapIcon';

interface Props {
  set: VocabSet;
  onClose: () => void;
}

const SessionSetupModal: React.FC<Props> = ({ set, onClose }) => {
  const router = useRouter();
  const [mode, setMode] = useState<'study' | 'quiz'>('study');
  
  // Study state
  const [studyMode, setStudyMode] = useState<'all' | 'review'>('all');

  // Quiz state
  const [quizMode, setQuizMode] = useState<'standard' | 'lightning'>('standard');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  const reviewItemsCount = set.items.filter(item => item.needsReview).length;

  const handleStart = () => {
    if (mode === 'study') {
      router.push(`/set/${set._id}/study?studyMode=${studyMode}`);
    } else {
      if (quizMode === 'lightning') {
        const params = new URLSearchParams();
        params.append('questionCount', String(questionCount));
        if (questionTypes.length > 0) {
          params.append('types', questionTypes.join(','));
        }
        router.push(`/set/${set._id}/lightning-quiz?${params.toString()}`);
      } else {
        const params = new URLSearchParams();
        params.append('quizType', 'standard');
        params.append('questionCount', String(questionCount));
        if (questionTypes.length > 0) {
          params.append('types', questionTypes.join(','));
        }
        router.push(`/set/${set._id}/quiz?${params.toString()}`);
      }
    }
    onClose();
  };
  
  const toggleQuestionType = (type: QuestionType) => {
    setQuestionTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const renderStudyOptions = () => (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg text-gray-700">Study Options</h3>
        <div className="flex flex-col space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="studyMode" value="all" checked={studyMode === 'all'} onChange={() => setStudyMode('all')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="ml-3 text-gray-800">Study All Words ({set.items.length})</span>
            </label>
            <label className={`flex items-center p-3 border rounded-lg ${reviewItemsCount === 0 ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}`}>
                <input type="radio" name="studyMode" value="review" checked={studyMode === 'review'} onChange={() => setStudyMode('review')} disabled={reviewItemsCount === 0} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                <span className={`ml-3 ${reviewItemsCount === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                    Study Review Words Only ({reviewItemsCount})
                </span>
            </label>
        </div>
    </div>
  );

  const renderQuizOptions = () => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Quiz Mode</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setQuizMode('standard')} className={`flex flex-col items-center p-4 border-2 rounded-lg ${quizMode === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <HelpCircleIcon size={24} className="mb-1" /> Standard
                </button>
                <button onClick={() => setQuizMode('lightning')} className={`flex flex-col items-center p-4 border-2 rounded-lg ${quizMode === 'lightning' ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}>
                    <ZapIcon size={24} className="mb-1" /> Lightning
                </button>
            </div>
        </div>

        <div>
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Number of Questions</h3>
            <div className="flex space-x-2">
                {[10, 20].map(count => (
                     <button key={count} onClick={() => setQuestionCount(count)} className={`py-2 px-4 rounded-md border ${questionCount === count ? 'bg-blue-500 text-white' : 'bg-white'}`}>{count}</button>
                ))}
                <button onClick={() => setQuestionCount(set.items.length)} className={`py-2 px-4 rounded-md border ${questionCount === set.items.length ? 'bg-blue-500 text-white' : 'bg-white'}`}>All ({set.items.length})</button>
            </div>
        </div>
        
        <div>
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Question Types (optional)</h3>
            <p className="text-sm text-gray-500 mb-2">Select specific types, or leave blank for a mix.</p>
            <div className="flex space-x-2">
                {(['meaning', 'hanzi', 'pinyin'] as QuestionType[]).map(type => (
                    <button key={type} onClick={() => toggleQuestionType(type)} className={`py-2 px-4 rounded-full bordercapitalize ${questionTypes.includes(type) ? 'bg-blue-500 text-white' : 'bg-white'}`}>{type}</button>
                ))}
            </div>
        </div>
    </div>
  );

  const minWordsForQuiz = 4;
  const canQuiz = set.items.length >= minWordsForQuiz;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="p-6 border-b flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Practice Session</h2>
                <p className="text-sm text-gray-600 mt-1 truncate">{set.title}</p>
            </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon size={24} /></button>
        </div>
        
        <div className="p-6 border-b">
            <div className="flex rounded-lg p-1 bg-gray-200">
                <button onClick={() => setMode('study')} className={`w-1/2 py-2 text-center rounded-md font-semibold transition-colors ${mode === 'study' ? 'bg-white shadow' : 'text-gray-600'}`}>
                    Study
                </button>
                <button onClick={() => setMode('quiz')} disabled={!canQuiz} className={`w-1/2 py-2 text-center rounded-md font-semibold transition-colors ${mode === 'quiz' ? 'bg-white shadow' : 'text-gray-600'} disabled:text-gray-400 disabled:cursor-not-allowed`} title={!canQuiz ? `You need at least ${minWordsForQuiz} words to start a quiz.` : ''}>
                    Quiz
                </button>
            </div>
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
            {mode === 'study' ? renderStudyOptions() : (canQuiz ? renderQuizOptions() : 
                <div className="text-center text-gray-500">
                    You need at least {minWordsForQuiz} words in this set to start a quiz.
                </div>
            )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button
                onClick={handleStart}
                disabled={mode === 'quiz' && !canQuiz}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
                Start
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SessionSetupModal;
