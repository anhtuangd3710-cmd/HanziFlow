import React, { useState, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { VocabSet } from '../types';
import VocabSetModal from './VocabSetModal';
import { PlusIcon } from './icons/PlusIcon';
import Spinner from './Spinner';
import VocabSetCard from './VocabSetCard';


const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<VocabSet | null>(null);
  
  if (!context) return <Spinner />;
  const { state, deleteSet, setView } = context;


  const handleAddNewSet = () => {
    setEditingSet(null);
    setIsModalOpen(true);
  };

  const handleEditSet = useCallback((set: VocabSet) => {
    setEditingSet(set);
    setIsModalOpen(true);
  }, []);

  const handleDeleteSet = useCallback(async (setId: string) => {
    if (window.confirm('Are you sure you want to delete this set? This cannot be undone.')) {
      await deleteSet(setId);
    }
  }, [deleteSet]);

  const handleStudy = useCallback((setId: string) => {
    setView({ view: 'FLASHCARDS', setId });
  }, [setView]);
  
  const handleQuiz = useCallback((setId: string) => {
    setView({ view: 'QUIZ', setId });
  }, [setView]);

  const userSets = state.vocabSets; 

  if (state.isLoading && userSets.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
            <Spinner />
            <p className="ml-4 text-gray-600">Loading your sets...</p>
        </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Vocabulary Sets</h2>
        <button
          onClick={handleAddNewSet}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <PlusIcon size={20} className="mr-2" />
          New Set
        </button>
      </div>

      {userSets.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">No sets found!</h3>
            <p className="text-gray-500 mt-2">Click "New Set" to create your first vocabulary list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSets.map(set => (
            <VocabSetCard 
              key={set._id}
              set={set}
              onStudy={handleStudy}
              onQuiz={handleQuiz}
              onEdit={handleEditSet}
              onDelete={handleDeleteSet}
            />
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <VocabSetModal
          set={editingSet}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;