import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import StatsOverview from './StatsOverview';
import Spinner from '../Spinner';

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);

    useEffect(() => {
        if (context?.state.user?.role === 'admin' && !context.state.adminStats) {
            context.fetchAdminStats();
        }
    }, []); // Empty dependency - fetch only on mount

    if (!context) return null;

    const { state } = context;
    const { adminStats, isLoading } = state;

    if (isLoading && !adminStats) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            
            <StatsOverview
                userCount={adminStats?.userCount ?? 0}
                setCount={adminStats?.setCount ?? 0}
                isLoading={isLoading && !adminStats}
            />
        </div>
    );
};

export default AdminDashboard;
