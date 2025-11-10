import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';

interface Props {
  setId: string;
}

const ProgressView: React.FC<Props> = ({ setId }) => {
  const context = useContext(AppContext);

  if (!context) return <div>Loading...</div>;
  const { state, setView } = context;

  const set = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);
  const historyForSet = useMemo(() =>
    state.quizHistory
      .filter(h => h.vocabSet._id === setId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.quizHistory, setId]
  );

  if (!set) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Set not found.</h2>
        <button onClick={() => setView({ view: 'DASHBOARD' })} className="mt-4 text-blue-500 underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const reviewItemsCount = set.items.filter(item => item.needsReview).length;
  const totalItems = set.items.length;
  const reviewPercentage = totalItems > 0 ? (reviewItemsCount / totalItems) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{set.title}</h1>
          <p className="text-gray-500">Progress Overview</p>
        </div>
        <button onClick={() => setView({ view: 'DASHBOARD' })} className="py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
          ← Back to Dashboard
        </button>
      </div>

      {/* Word Status Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Word Status</h2>
        {totalItems > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2 text-sm font-medium">
              <span className="text-yellow-600">Needs Review: {reviewItemsCount}</span>
              <span className="text-green-600">Learned: {totalItems - reviewItemsCount}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-yellow-400 h-4 rounded-full"
                style={{ width: `${reviewPercentage}%` }}
                title={`${reviewPercentage.toFixed(1)}% Needs Review`}
              ></div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">This set has no words yet.</p>
        )}
      </div>

      {/* Quiz History Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Quiz Performance</h2>
        {historyForSet.length > 0 ? (
          <ul className="space-y-5">
            {historyForSet.map(history => {
              const percentage = history.total > 0 ? Math.round((history.score / history.total) * 100) : 0;
              return (
                <li key={history._id}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-gray-600">
                      {new Date(history.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="font-bold text-blue-600">
                      {history.score}/{history.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No quiz history for this set.</p>
            <p className="text-sm text-gray-400 mt-1">Take a quiz to start tracking your performance!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressView;
