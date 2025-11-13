'use client';


import React from 'react';
import { HelpCircleIcon } from './icons/HelpCircleIcon';

interface SetForReview {
  setId: string;
  setTitle: string;
  dueCount: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setsForReview: SetForReview[];
  onStartSetReview: (setId: string) => void;
}

const ReviewSessionModal: React.FC<Props> = ({ isOpen, onClose, setsForReview, onStartSetReview }) => {
  if (!isOpen) return null;

  const handleReviewClick = (setId: string) => {
    onStartSetReview(setId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Start a Review Session</h2>
          <p className="text-sm text-gray-600 mt-1">You have words to review in the following sets. Pick one to begin!</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {setsForReview.length > 0 ? (
            <ul className="space-y-3">
              {setsForReview.map(set => (
                <li key={set.setId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-800">{set.setTitle}</p>
                    <p className="text-sm text-gray-500">{set.dueCount} word{set.dueCount !== 1 ? 's' : ''} to review</p>
                  </div>
                  <button 
                    onClick={() => handleReviewClick(set.setId)}
                    className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200"
                  >
                    <HelpCircleIcon size={16} className="mr-1.5"/> Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No items are due for review right now.</p>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Close
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

export default ReviewSessionModal;
