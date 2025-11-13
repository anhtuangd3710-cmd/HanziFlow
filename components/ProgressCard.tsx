
import React, { useMemo } from 'react';
import { User, UserStats } from '@/lib/types';
import { FlameIcon } from './icons/FlameIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { CalendarCheckIcon } from './icons/CalendarCheckIcon';

interface Props {
  user: User;
  userStats: UserStats;
  onStartReview: () => void;
}

const ProgressCard: React.FC<Props> = ({ user, userStats, onStartReview }) => {
  const { mastery, reviewForecast, setsForReview } = userStats;
  
  const totalDueToday = setsForReview.reduce((acc, current) => acc + current.dueCount, 0);

  const getPercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };
  
  const level = Math.floor(user.xp / 100) + 1;
  const xpForNextLevel = 100;
  const currentLevelXp = user.xp % xpForNextLevel;
  const levelProgressPercentage = (currentLevelXp / xpForNextLevel) * 100;

  const masteryConfig = [
      { key: 'mastered', label: 'Mastered', color: 'bg-green-500', value: mastery.mastered },
      { key: 'known', label: 'Known', color: 'bg-blue-500', value: mastery.known },
      { key: 'learning', label: 'Learning', color: 'bg-yellow-500', value: mastery.learning },
      { key: 'new', label: 'New', color: 'bg-gray-300', value: mastery.new },
  ];

  const maxForecast = Math.max(...reviewForecast.map(d => d.count), 1); // Avoid division by zero
  const totalWeekReviews = useMemo(() => reviewForecast.reduce((acc, day) => acc + day.count, 0), [reviewForecast]);

  const today = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                Word Mastery ({mastery.total} total)
            </h4>
            {mastery.total > 0 ? (
                <>
                    <div className="flex w-full h-3 rounded-full overflow-hidden mb-3">
                        {masteryConfig.map(m => (
                            <div key={m.key} className={m.color} style={{ width: `${getPercentage(m.value, mastery.total)}%`}} title={`${m.label}: ${m.value}`}></div>
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
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg text-gray-700 flex items-center">
                    <CalendarCheckIcon size={20} className="mr-2 text-green-600"/>
                    Review Forecast
                </h4>
                {totalWeekReviews > 0 && (
                    <p className="text-sm text-gray-500 font-medium">
                        {totalWeekReviews} reviews this week
                    </p>
                )}
            </div>
            
            {totalWeekReviews > 0 ? (
                <div className="mb-4">
                    <div className="flex justify-between h-32 px-2 border-b border-gray-200">
                        {reviewForecast.map(day => (
                            <div key={day.date} className="flex-1 flex flex-col justify-end items-center relative group">
                                <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {day.count} words
                                </div>
                                <div className="w-6 bg-gray-200 rounded-t-md flex-grow flex items-end">
                                    <div 
                                        className={`${day.date === today ? 'bg-green-500' : 'bg-gray-400'} w-full rounded-t-md transition-all duration-300`}
                                        style={{ height: `${(day.count / maxForecast) * 100}%`}}
                                    ></div>
                                </div>
                                <span className={`mt-1 text-xs font-semibold ${day.date === today ? 'text-green-600' : 'text-gray-500'}`}>
                                    {dayNames[new Date(day.date + 'T00:00:00').getDay()]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-md border-2 border-dashed">
                    <p className="text-gray-600 font-medium">Your week is clear!</p>
                    <p className="text-sm text-gray-500">No reviews scheduled. Time to learn some new words.</p>
                </div>
            )}

            <div className="text-center mt-4">
                 <button 
                    onClick={onStartReview}
                    disabled={totalDueToday === 0}
                    className="w-full py-2 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                     Review {totalDueToday > 0 ? `${totalDueToday} ` : ''} Word{totalDueToday !== 1 ? 's' : ''}
                 </button>
            </div>
         </div>
    </div>
  );
};

export default ProgressCard;
