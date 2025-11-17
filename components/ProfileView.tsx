
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { AwardIcon } from './icons/AwardIcon';
import { FlameIcon } from './icons/FlameIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import Spinner from './Spinner';
import EditProfileModal from './EditProfileModal';
import BadgeShowcase from './BadgeShowcase';
import StreakAndAchievements from './StreakAndAchievements';
import { QuizHistory } from '@/lib/types';
import { saveApiKey, getApiKey, deleteApiKey } from '@/lib/api';
import { clearApiKeyCache } from '@/lib/geminiService';

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
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeySaved, setApiKeySaved] = useState(false);
    const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
    const [isSavingApiKey, setIsSavingApiKey] = useState(false);

    useEffect(() => {
        if (context && !context.state.profileQuizHistory) {
            context.fetchProfileHistory();
        }
        // Load existing API key from backend
        loadApiKey();
    }, [context]);

    const loadApiKey = async () => {
        try {
            setIsLoadingApiKey(true);
            const response = await getApiKey();
            if (response.apiKey) {
                setApiKey(response.apiKey);
                setApiKeySaved(true);
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        } finally {
            setIsLoadingApiKey(false);
        }
    };

    const handleSaveApiKey = async () => {
        if (!apiKey.trim()) {
            alert('⚠️ Vui lòng nhập API Key!');
            return;
        }

        try {
            setIsSavingApiKey(true);
            await saveApiKey(apiKey.trim());
            setApiKeySaved(true);
            // Clear cache so new key will be used immediately
            clearApiKeyCache();
            alert('✅ API Key đã được lưu thành công!');
        } catch (error: any) {
            console.error('Error saving API key:', error);
            alert(`❌ Lỗi: ${error.message || 'Không thể lưu API Key'}`);
        } finally {
            setIsSavingApiKey(false);
        }
    };

    const handleRemoveApiKey = async () => {
        if (!confirm('Bạn có chắc muốn xóa API Key?')) {
            return;
        }

        try {
            setIsSavingApiKey(true);
            await deleteApiKey();
            setApiKey('');
            setApiKeySaved(false);
            // Clear cache so env key will be used
            clearApiKeyCache();
            alert('🗑️ API Key đã được xóa!');
        } catch (error: any) {
            console.error('Error deleting API key:', error);
            alert(`❌ Lỗi: ${error.message || 'Không thể xóa API Key'}`);
        } finally {
            setIsSavingApiKey(false);
        }
    };

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

            {/* Streak and Achievements Section */}
            <StreakAndAchievements />

            {/* Badges Section */}
            <BadgeShowcase />

            {/* API Key Configuration Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg shadow-md border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🤖</span>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gemini API Configuration</h2>
                        <p className="text-sm text-gray-600">Thiết lập API Key để sử dụng các tính năng AI</p>
                    </div>
                </div>

                {/* API Status */}
                {isLoadingApiKey ? (
                    <div className="mb-4 p-3 rounded-lg bg-gray-100 border border-gray-300 flex items-center gap-2">
                        <Spinner />
                        <p className="text-sm text-gray-600">Đang tải thông tin API Key...</p>
                    </div>
                ) : (
                    <div className={`mb-4 p-3 rounded-lg ${apiKeySaved ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                        <p className="text-sm font-semibold">
                            {apiKeySaved ? '✅ API Key đã được cài đặt' : '⚠️ Chưa có API Key - Đang dùng API miễn phí (có giới hạn)'}
                        </p>
                    </div>
                )}

                {/* API Key Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gemini API Key:
                    </label>
                    <div className="flex gap-2">
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Nhập API Key của bạn..."
                            disabled={isLoadingApiKey || isSavingApiKey}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            disabled={isLoadingApiKey || isSavingApiKey}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={showApiKey ? 'Ẩn' : 'Hiện'}
                        >
                            {showApiKey ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim() || isLoadingApiKey || isSavingApiKey}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSavingApiKey ? (
                            <>
                                <Spinner />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>💾 Lưu API Key</>
                        )}
                    </button>
                    {apiKeySaved && (
                        <button
                            onClick={handleRemoveApiKey}
                            disabled={isLoadingApiKey || isSavingApiKey}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🗑️ Xóa
                        </button>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span>📖</span>
                        <span>Hướng dẫn lấy Gemini API Key (Miễn phí):</span>
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">1.</span>
                            <span>Truy cập: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">https://aistudio.google.com/apikey</a></span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">2.</span>
                            <span>Đăng nhập bằng tài khoản Google của bạn</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">3.</span>
                            <span>Nhấn nút <strong>"Create API Key"</strong> hoặc <strong>"Get API Key"</strong></span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">4.</span>
                            <span>Chọn project (hoặc tạo mới nếu chưa có)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">5.</span>
                            <span>Copy API Key và dán vào ô bên trên</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600">6.</span>
                            <span>Nhấn <strong>"Lưu API Key"</strong> để hoàn tất</span>
                        </li>
                    </ol>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700">
                            <strong>💡 Lưu ý:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                            <li>API Key của Gemini <strong>hoàn toàn miễn phí</strong> với hạn mức sử dụng hợp lý</li>
                            <li>API Key được lưu trên trình duyệt của bạn (localStorage)</li>
                            <li>Không ai có thể truy cập API Key của bạn</li>
                            <li>Sử dụng cho: AI Generator, Support Chatbot</li>
                            <li>Giới hạn: 15 requests/phút, 1500 requests/ngày (Free tier)</li>
                        </ul>
                    </div>

                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-700">
                            <strong>✨ Lợi ích khi dùng API Key riêng:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                            <li>Không bị giới hạn bởi API miễn phí của web</li>
                            <li>Tốc độ phản hồi nhanh hơn</li>
                            <li>Sử dụng không giới hạn các tính năng AI</li>
                            <li>Chatbot thông minh hơn với Gemini 2.5</li>
                        </ul>
                    </div>
                </div>
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