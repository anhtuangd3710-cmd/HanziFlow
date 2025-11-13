
import React, { useContext, useEffect } from 'react';
import { AppContext } from '@/context/AppContext';
import Spinner from './Spinner';
import { TrophyIcon } from './icons/TrophyIcon';
import { User } from '@/lib/types';

const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
};

const LeaderboardView: React.FC = () => {
    const context = useContext(AppContext);

    // Destructure for stable dependencies to prevent re-renders
    const fetchLeaderboard = context?.fetchLeaderboard;
    const leaderboard = context?.state.leaderboard;

    useEffect(() => {
        // This effect will now only run when fetchLeaderboard or the leaderboard data itself changes,
        // preventing the infinite loop caused by depending on the entire context object.
        if (fetchLeaderboard && !leaderboard) {
            fetchLeaderboard();
        }
    }, [fetchLeaderboard, leaderboard]);

    if (!context) return <Spinner />;
    const { state } = context;
    const { isLoading, user: currentUser } = state;

    if (isLoading && !leaderboard) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
                <p className="ml-4 text-gray-600">Loading leaderboard...</p>
            </div>
        );
    }

    if (!leaderboard) {
        return <div className="text-center text-gray-500">Could not load leaderboard data.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <TrophyIcon size={48} className="mx-auto text-yellow-500" />
                <h1 className="text-4xl font-bold text-gray-800 mt-2">Leaderboard</h1>
                <p className="mt-2 text-lg text-gray-600">See who's at the top of their game!</p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total XP</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaderboard.map((user, index) => {
                                const rank = index + 1;
                                const level = Math.floor(user.xp / 100) + 1;
                                const isCurrentUser = currentUser?._id === user._id;

                                return (
                                    <tr key={user._id} className={isCurrentUser ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`font-bold text-lg ${rank <= 3 ? 'text-yellow-600' : 'text-gray-700'}`}>
                                                {rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-2.5 py-0.5 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">
                                                {level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">
                                            {user.xp.toLocaleString()} XP
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {formatJoinDate(user.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
