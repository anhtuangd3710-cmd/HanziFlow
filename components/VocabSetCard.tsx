
import React, { useState, useRef, useEffect } from 'react';
import { VocabSet, QuestionType } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface VocabSetCardProps {
  set: VocabSet;
  onStartSession: (set: VocabSet) => void;
  onReviewQuiz: (setId: string) => void;
  onProgress: (setId: string) => void;
  onEdit: (set: VocabSet) => void;
  onDelete: (setId: string) => void;
}

const VocabSetCard: React.FC<VocabSetCardProps> = ({ set, onStartSession, onReviewQuiz, onProgress, onEdit, onDelete }) => {
  const reviewItemsCount = set.items.filter(item => item.needsReview).length;

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-blue-100 text-blue-800',
    Hard: 'bg-red-100 text-red-800',
  };
  const minWordsForQuiz = set.difficulty === 'Hard' ? 5 : (set.difficulty === 'Easy' ? 3 : 4);

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
        <button 
            onClick={() => onStartSession(set)} 
            className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200">
            <BookOpenIcon size={16} className="mr-1.5"/> Practice
        </button>

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
    </div>
  );
};

export default React.memo(VocabSetCard);
