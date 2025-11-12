
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { AwardIcon } from './icons/AwardIcon';
import { FlameIcon } from './icons/FlameIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import Spinner from './Spinner';
import EditProfileModal from './EditProfileModal';
import { QuizHistory } from '../types';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
        <div className="bg-gray-200 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

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


const ProfileView: React.FC = () => {
    const context = useContext(AppContext);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (context && !context.state.profileQuizHistory) {
            context.fetchProfileHistory();
        }
    }, [context]);

    if (!context) return <Spinner />;
    const { state } = context;
    const { user, userStats, setsPagination, profileQuizHistory, isLoading } = state;

    if (!user) {
        return <div className="text-center">Please log in to view your profile.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-6">
                <UserCircleIcon size={80} className="text-gray-400" />
                <div className="flex-grow text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-400 mt-1">Member since {formatJoinDate(user.createdAt)}</p>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <EditIcon size={16} className="mr-2" />
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={<AwardIcon className="text-yellow-600" />} label="Total XP" value={user.xp} />
                 <StatCard icon={<FlameIcon className="text-orange-500" />} label="Current Streak" value={`${user.currentStreak} days`} />
                 <StatCard icon={<ClipboardListIcon className="text-blue-500" />} label="Sets Created" value={setsPagination?.totalSets || 0} />
                 <StatCard icon={<BookOpenIcon className="text-green-500" />} label="Words Learned" value={userStats?.mastery.total || 0} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Quiz History</h2>
                {isLoading && !profileQuizHistory ? (
                     <div className="flex justify-center items-center h-40">
                        <Spinner />
                        <p className="ml-4 text-gray-600">Loading history...</p>
                    </div>
                ) : profileQuizHistory && profileQuizHistory.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {profileQuizHistory.map((history: QuizHistory) => {
                            const percentage = history.total > 0 ? Math.round((history.score / history.total) * 100) : 0;
                            return (
                                <div key={history._id} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-700">{history.vocabSet.title}</p>
                                        <p className="text-sm text-gray-500">{formatRelativeTime(history.createdAt)}</p>
                                    </div>
                                    <p className="font-bold text-blue-600 text-lg">{history.score}/{history.total} ({percentage}%)</p>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No quiz history found. Complete a quiz to see your results here!</p>
                )}
            </div>

            {isEditModalOpen && (
                <EditProfileModal 
                    currentUser={user}
                    onClose={() => setIsEditModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default ProfileView;