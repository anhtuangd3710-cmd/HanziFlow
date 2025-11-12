
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import Spinner from '../Spinner';
import Pagination from '../Pagination';
import { TrashIcon } from '../icons/TrashIcon';

const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const UserManagement: React.FC = () => {
    const context = useContext(AppContext);

    useEffect(() => {
        if (context && !context.state.adminUsers) {
            context.fetchAdminUsers(1);
        }
    }, [context]);

    if (!context) return null;
    const { state, fetchAdminUsers, adminDeleteUser } = context;
    const { adminUsers, adminUsersPagination, isLoading, user: currentUser } = state;

    const handlePageChange = (page: number) => {
        fetchAdminUsers(page);
    };

    const handleDelete = (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            adminDeleteUser(userId);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && !adminUsers ? (
                                <tr><td colSpan={6} className="text-center py-10"><Spinner /></td></tr>
                            ) : adminUsers && adminUsers.length > 0 ? adminUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-semibold">{user.xp.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{formatJoinDate(user.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            onClick={() => handleDelete(user._id, user.name)} 
                                            disabled={user._id === currentUser?._id}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title={user._id === currentUser?._id ? "Cannot delete yourself" : "Delete User"}
                                        >
                                            <TrashIcon size={20}/>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {adminUsersPagination && adminUsersPagination.totalPages > 1 && (
                    <div className="p-4 border-t flex justify-center">
                        <Pagination 
                            currentPage={adminUsersPagination.currentPage}
                            totalPages={adminUsersPagination.totalPages}
                            onPageChange={handlePageChange}
                            isDisabled={isLoading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
