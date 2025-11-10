import React, { useState, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { VocabSet, QuizHistory, QuestionType } from '../types';
import VocabSetModal from './VocabSetModal';
import { PlusIcon } from './icons/PlusIcon';
import Spinner from './Spinner';
import VocabSetCard from './VocabSetCard';
import { EmptySetIcon } from './icons/EmptySetIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import AiSetGeneratorModal from './AiSetGeneratorModal';
import { FlameIcon } from './icons/FlameIcon';

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSet(null);
  };

  const handleDeleteSet = useCallback(async (setId: string) => {
    if (window.confirm('Are you sure you want to delete this set? This cannot be undone.')) {
      await deleteSet(setId);
    }
  }, [deleteSet]);

  const handleStudy = useCallback((setId: string) => {
    setView({ view: 'FLASHCARDS', setId });
  }, [setView]);
  
  const handleQuiz = useCallback((setId: string, questionTypes?: QuestionType[]) => {
    setView({ view: 'QUIZ', setId, quizType: 'standard', questionTypes });
  }, [setView]);

  const handleReviewQuiz = useCallback((setId: string) => {
    setView({ view: 'QUIZ', setId, quizType: 'review' });
  }, [setView]);

  const handleProgress = useCallback((setId: string) => {
    setView({ view: 'PROGRESS', setId });
  }, [setView]);
  
  const user = state.user;
  const level = user ? Math.floor(user.xp / 100) + 1 : 1;
  const userSets = state.vocabSets; 

  if (state.isLoading && userSets.length === 0 && state.quizHistory.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
            <Spinner />
            <p className="ml-4 text-gray-600">Loading your data...</p>
        </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content: Vocab Sets */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-gray-800">My Vocabulary Sets</h2>
          <div className="flex gap-2">
            <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                <BrainCircuitIcon size={20} className="mr-2" />
                Generate with AI
            </button>
            <button
              onClick={handleAddNewSet}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <PlusIcon size={20} className="mr-2" />
              New Set
            </button>
          </div>
        </div>

        {userSets.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
            <EmptySetIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Create Your First Vocabulary Set</h3>
            <p className="mt-2 text-gray-500">Your learning journey begins here. Click "New Set" to add words manually, or "Generate with AI" to get started instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userSets.map(set => (
              <VocabSetCard 
                key={set._id}
                set={set}
                onStudy={handleStudy}
                onQuiz={handleQuiz}
                onReviewQuiz={handleReviewQuiz}
                onProgress={handleProgress}
                onEdit={handleEditSet}
                onDelete={handleDeleteSet}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Sidebar: Gamification & History */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-8">
           {/* Gamification Status Card */}
           {user && (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Progress</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Level</span>
                        <span className="font-bold text-lg text-blue-600">{level}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Total XP</span>
                        <span className="font-bold text-lg text-green-600">{user.xp}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Current Streak</span>
                        <div className="flex items-center gap-2">
                           <FlameIcon className="h-5 w-5 text-orange-500" />
                           <span className="font-bold text-lg text-orange-600">{user.currentStreak} day{user.currentStreak !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Longest Streak</span>
                        <span className="font-bold text-lg text-red-600">{user.longestStreak} day{user.longestStreak !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
           )}

          {/* Quiz History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Quiz History</h3>
              {state.quizHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't completed any quizzes yet. Take a quiz to see your history here!</p>
              ) : (
                  <ul className="space-y-4 max-h-[40vh] overflow-y-auto">
                      {state.quizHistory.map(history => {
                          const percentage = history.total > 0 ? Math.round((history.score / history.total) * 100) : 0;
                          return (
                              <li key={history._id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                  <p className="font-semibold text-gray-700">{history.vocabSet.title}</p>
                                  <div className="flex justify-between items-center text-sm mt-1">
                                      <p className="font-bold text-blue-600">{history.score}/{history.total} ({percentage}%)</p>
                                      <p className="text-gray-500">{formatRelativeTime(history.createdAt)}</p>
                                  </div>
                              </li>
                          )
                      })}
                  </ul>
              )}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <VocabSetModal
          set={editingSet}
          onClose={handleCloseModal}
        />
      )}
      {isAiModalOpen && (
        <AiSetGeneratorModal
          onClose={() => setIsAiModalOpen(false)}
          onSetCreated={(createdSet) => {
            setIsAiModalOpen(false);
            handleEditSet(createdSet); // Open the standard modal for review/editing
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;