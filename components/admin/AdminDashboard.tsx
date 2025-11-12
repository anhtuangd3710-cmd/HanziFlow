
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { UsersIcon } from '../icons/UsersIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { HelpCircleIcon } from '../icons/HelpCircleIcon';
import Spinner from '../Spinner';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; isLoading: boolean }> = ({ icon, label, value, isLoading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-blue-100 p-4 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-gray-600 font-semibold">{label}</p>
            {isLoading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div> : <p className="text-3xl font-bold text-gray-800">{value}</p>}
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);

    useEffect(() => {
        if (context && !context.state.adminStats) {
            context.fetchAdminStats();
        }
    }, [context]);

    if (!context) return null;

    const { state } = context;
    const { adminStats, isLoading } = state;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    icon={<UsersIcon className="text-blue-600" size={28} />} 
                    label="Total Users" 
                    value={adminStats?.userCount.toLocaleString() ?? '...'}
                    isLoading={isLoading && !adminStats}
                />
                <StatCard 
                    icon={<ClipboardListIcon className="text-blue-600" size={28} />} 
                    label="Total Vocab Sets" 
                    value={adminStats?.setCount.toLocaleString() ?? '...'}
                    isLoading={isLoading && !adminStats}
                />
            </div>

            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <HelpCircleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <span className="font-bold">Note on Web Traffic:</span> This dashboard provides application-specific data. For detailed web traffic analytics (e.g., page views, visitor locations, bounce rate), integrating a dedicated service like Google Analytics is recommended. This requires adding a tracking script to the frontend code.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
