import React, { useState, useRef, useEffect } from 'react';
import { VocabSet, QuestionType } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface VocabSetCardProps {
  set: VocabSet;
  onStudy: (setId: string) => void;
  onQuiz: (setId: string, questionTypes?: QuestionType[]) => void;
  onReviewQuiz: (setId: string) => void;
  onProgress: (setId: string) => void;
  onEdit: (set: VocabSet) => void;
  onDelete: (setId: string) => void;
}

const VocabSetCard: React.FC<VocabSetCardProps> = ({ set, onStudy, onQuiz, onReviewQuiz, onProgress, onEdit, onDelete }) => {
  const reviewItemsCount = set.items.filter(item => item.needsReview).length;
  const [isQuizMenuOpen, setIsQuizMenuOpen] = useState(false);
  const quizMenuRef = useRef<HTMLDivElement>(null);

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-blue-100 text-blue-800',
    Hard: 'bg-red-100 text-red-800',
  };
  const minWordsForQuiz = set.difficulty === 'Hard' ? 5 : (set.difficulty === 'Easy' ? 3 : 4);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (quizMenuRef.current && !quizMenuRef.current.contains(event.target as Node)) {
            setIsQuizMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuizSelection = (types?: QuestionType[]) => {
    onQuiz(set._id, types);
    setIsQuizMenuOpen(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900 pr-2 flex items-center gap-2">
                {set.title}
                {set.isPublic && <GlobeIcon size={18} className="text-gray-400" title="This set is public" />}
            </h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${difficultyColors[set.difficulty]}`}>
                {set.difficulty}
            </span>
        </div>
        <p className="text-gray-600 mt-2 mb-4 h-12 overflow-hidden">{set.description}</p>
        <p className="text-sm font-medium text-blue-600">{set.items.length} words</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-end items-center">
        <button onClick={() => onStudy(set._id)} className="flex items-center text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200">
            <BookOpenIcon size={16} className="mr-1.5"/> Study
        </button>

        <div className="relative" ref={quizMenuRef}>
            <button 
                disabled={set.items.length < minWordsForQuiz} 
                onClick={() => setIsQuizMenuOpen(prev => !prev)} 
                className="flex items-center text-sm bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={set.items.length < minWordsForQuiz ? `A '${set.difficulty}' quiz requires at least ${minWordsForQuiz} words.` : 'Start Quiz'}
            >
                <HelpCircleIcon size={16} className="mr-1.5"/> 
                Quiz
                <ChevronDownIcon size={16} className="ml-1" />
            </button>
            {isQuizMenuOpen && (
                 <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-10 border animate-fade-in-fast">
                    <ul className="text-sm text-gray-700 py-1">
                        <li onClick={() => handleQuizSelection(undefined)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">All Types</li>
                        <li onClick={() => handleQuizSelection(['meaning'])} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Hanzi → Meaning</li>
                        <li onClick={() => handleQuizSelection(['hanzi'])} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Meaning → Hanzi</li>
                        <li onClick={() => handleQuizSelection(['pinyin'])} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Hanzi → Pinyin</li>
                    </ul>
                </div>
            )}
        </div>

        <button 
            disabled={reviewItemsCount < minWordsForQuiz} 
            onClick={() => onReviewQuiz(set._id)} 
            className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={reviewItemsCount < minWordsForQuiz ? `Need at least ${minWordsForQuiz} words for review (you have ${reviewItemsCount}).` : `Quiz ${reviewItemsCount} review words`}
        >
            <StarIcon size={16} className="mr-1.5"/> Review
        </button>
        <button onClick={() => onProgress(set._id)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full" title="View Progress">
            <ChartBarIcon size={20}/>
        </button>
         <button onClick={() => onEdit(set)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full">
            <EditIcon size={20}/>
        </button>
         <button onClick={() => onDelete(set._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full">
            <TrashIcon size={20}/>
        </button>
      </div>
       <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(VocabSetCard);