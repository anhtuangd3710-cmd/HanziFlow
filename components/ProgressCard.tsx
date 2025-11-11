
import React, { useMemo } from 'react';
import { User, VocabSet } from '../types';
import { FlameIcon } from './icons/FlameIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { CalendarCheckIcon } from './icons/CalendarCheckIcon';

interface Props {
  user: User;
  vocabSets: VocabSet[];
  onStartReview: (setsForReview: { setId: string; setTitle: string; dueCount: number }[]) => void;
}

const ProgressCard: React.FC<Props> = ({ user, vocabSets, onStartReview }) => {
  const masteryStats = useMemo(() => {
    const stats = {
      new: 0,
      learning: 0,
      known: 0,
      mastered: 0,
      total: 0,
    };
    vocabSets.forEach(set => {
      set.items.forEach(item => {
        stats.total++;
        const srsLevel = item.srsLevel || 0;
        if (srsLevel === 0) stats.new++;
        else if (srsLevel <= 2) stats.learning++;
        else if (srsLevel <= 5) stats.known++;
        else stats.mastered++;
      });
    });
    return stats;
  }, [vocabSets]);

  const reviewsDue = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueItemsBySet: { [key: string]: { setTitle: string, dueCount: number } } = {};
      
      vocabSets.forEach(set => {
          set.items.forEach(item => {
              if (item.nextReviewDate) {
                  const reviewDate = new Date(item.nextReviewDate);
                  reviewDate.setHours(0, 0, 0, 0);
                  if (reviewDate <= today) {
                      if (!dueItemsBySet[set._id]) {
                          dueItemsBySet[set._id] = { setTitle: set.title, dueCount: 0 };
                      }
                      dueItemsBySet[set._id].dueCount++;
                  }
              }
          });
      });

      const setsForReview = Object.entries(dueItemsBySet).map(([setId, data]) => ({
          setId,
          setTitle: data.setTitle,
          dueCount: data.dueCount,
      }));

      const totalDue = setsForReview.reduce((acc, current) => acc + current.dueCount, 0);
      
      return { setsForReview, totalDue };
  }, [vocabSets]);

  const getPercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };
  
  const level = Math.floor(user.xp / 100) + 1;
  const xpForNextLevel = 100;
  const currentLevelXp = user.xp % xpForNextLevel;
  const levelProgressPercentage = (currentLevelXp / xpForNextLevel) * 100;

  const masteryConfig = [
      { key: 'mastered', label: 'Mastered', color: 'bg-green-500', value: masteryStats.mastered },
      { key: 'known', label: 'Known', color: 'bg-blue-500', value: masteryStats.known },
      { key: 'learning', label: 'Learning', color: 'bg-yellow-500', value: masteryStats.learning },
      { key: 'new', label: 'New', color: 'bg-gray-300', value: masteryStats.new },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Learning Overview</h3>

        {/* Level & XP */}
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-lg font-bold text-gray-700">Level {level}</span>
                <span className="text-sm text-gray-500">{currentLevelXp} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${levelProgressPercentage}%`}}></div>
            </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-4 text-center">
             <div>
                <p className="font-semibold text-gray-600">Current Streak</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                   <FlameIcon className="h-6 w-6 text-orange-500" />
                   <span className="font-bold text-xl text-orange-600">{user.currentStreak} day{user.currentStreak !== 1 ? 's' : ''}</span>
                </div>
            </div>
             <div>
                <p className="font-semibold text-gray-600">Longest Streak</p>
                 <div className="flex items-center justify-center gap-2 mt-1">
                   <FlameIcon className="h-6 w-6 text-red-500" />
                   <span className="font-bold text-xl text-red-600">{user.longestStreak} day{user.longestStreak !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>

        {/* Word Mastery */}
        <div className="pt-4 border-t">
            <h4 className="font-bold text-lg text-gray-700 flex items-center mb-3">
                <BrainCircuitIcon size={20} className="mr-2 text-purple-600"/>
                Word Mastery ({masteryStats.total} total)
            </h4>
            {masteryStats.total > 0 ? (
                <>
                    <div className="flex w-full h-3 rounded-full overflow-hidden mb-3">
                        {masteryConfig.map(m => (
                            <div key={m.key} className={m.color} style={{ width: `${getPercentage(m.value, masteryStats.total)}%`}} title={`${m.label}: ${m.value}`}></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {masteryConfig.map(m => (
                            <div key={m.label} className="flex items-center">
                                <span className={`w-3 h-3 rounded-full ${m.color} mr-2`}></span>
                                <span>{m.label}:</span>
                                <span className="font-semibold ml-auto">{m.value}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                 <p className="text-gray-500 text-sm">Add words to a set to track your mastery.</p>
            )}
        </div>

        {/* Reviews Due */}
         <div className="pt-4 border-t">
            <h4 className="font-bold text-lg text-gray-700 flex items-center mb-3">
                <CalendarCheckIcon size={20} className="mr-2 text-green-600"/>
                Today's Reviews
            </h4>
            <div className="text-center">
                <p className="text-4xl font-extrabold text-gray-800">{reviewsDue.totalDue}</p>
                <p className="text-gray-600">words to review</p>
                 <button 
                    onClick={() => onStartReview(reviewsDue.setsForReview)}
                    disabled={reviewsDue.totalDue === 0}
                    className="mt-3 w-full py-2 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                     Start Review
                 </button>
            </div>
         </div>
    </div>
  );
};

export default ProgressCard;
