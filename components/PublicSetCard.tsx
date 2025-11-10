import React from 'react';
import { VocabSet } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface Props {
  set: VocabSet;
  onPreview: () => void;
}

const PublicSetCard: React.FC<Props> = ({ set, onPreview }) => {
  const difficultyColors = {
    Easy: 'border-green-500',
    Medium: 'border-blue-500',
    Hard: 'border-red-500',
  };

  return (
    <div 
      onClick={onPreview}
      className={`bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-t-4 ${difficultyColors[set.difficulty]}`}
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900 truncate">{set.title}</h3>
        <p className="text-gray-600 mt-2 mb-4 text-sm h-10 overflow-hidden">{set.description}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center" title="Creator">
            <UsersIcon size={16} className="mr-2"/>
            <span className="font-medium">{set.creatorName || 'Unknown'}</span>
        </div>
        <div className="flex items-center" title={`${set.cloneCount} clones`}>
            <DownloadIcon size={16} className="mr-2"/>
            <span className="font-medium">{set.cloneCount || 0}</span>
        </div>
        <span className="font-medium bg-gray-100 px-2 py-1 rounded">{set.items.length} words</span>
      </div>
    </div>
  );
};

export default PublicSetCard;