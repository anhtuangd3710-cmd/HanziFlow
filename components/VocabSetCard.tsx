import React from 'react';
import { VocabSet } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface VocabSetCardProps {
  set: VocabSet;
  onStudy: (setId: string) => void;
  onQuiz: (setId: string) => void;
  onEdit: (set: VocabSet) => void;
  onDelete: (setId: string) => void;
}

const VocabSetCard: React.FC<VocabSetCardProps> = ({ set, onStudy, onQuiz, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{set.title}</h3>
        <p className="text-gray-600 mt-2 mb-4 h-12 overflow-hidden">{set.description}</p>
        <p className="text-sm font-medium text-blue-600">{set.items.length} words</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-end">
        <button onClick={() => onStudy(set._id)} className="flex items-center text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200">
            <BookOpenIcon size={16} className="mr-1.5"/> Study
        </button>
        <button 
            disabled={set.items.length < 4} 
            onClick={() => onQuiz(set._id)} 
            className="flex items-center text-sm bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={set.items.length < 4 ? 'A quiz requires at least 4 words in the set.' : 'Start Quiz'}
        >
            <HelpCircleIcon size={16} className="mr-1.5"/> Quiz
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