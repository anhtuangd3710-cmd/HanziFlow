
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Spinner from '../Spinner';
import Pagination from '../Pagination';
import { TrashIcon } from '../icons/TrashIcon';
import { LockIcon } from '../icons/LockIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

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
    const [blockModalUser, setBlockModalUser] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState('');
    const [isBlockingUser, setIsBlockingUser] = useState(false);

    useEffect(() => {
        if (context?.state.user?.role === 'admin' && !context.state.adminUsers) {
            context.fetchAdminUsers(1);
        }
    }, []); // Empty dependency - fetch only on mount

    if (!context) return null;
    const { state, fetchAdminUsers, adminDeleteUser, adminBlockUser, adminUnblockUser } = context;
    const { adminUsers, adminUsersPagination, isLoading, user: currentUser } = state;

    const handlePageChange = (page: number) => {
        fetchAdminUsers(page);
    };

    const handleDelete = (userId: string, userName: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            adminDeleteUser(userId);
        }
    };

    const handleBlockClick = (userId: string) => {
        setBlockModalUser(userId);
        setBlockReason('');
    };

    const handleBlockSubmit = async (userId: string) => {
        if (!blockReason.trim()) {
            alert('Please provide a reason for blocking');
            return;
        }

        setIsBlockingUser(true);
        try {
            await adminBlockUser(userId, blockReason);
            setBlockModalUser(null);
            setBlockReason('');
            fetchAdminUsers(adminUsersPagination?.currentPage || 1);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to block user');
        } finally {
            setIsBlockingUser(false);
        }
    };

    const handleUnblock = async (userId: string) => {
        if (window.confirm('Are you sure you want to unblock this user?')) {
            try {
                await adminUnblockUser(userId);
                fetchAdminUsers(adminUsersPagination?.currentPage || 1);
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Failed to unblock user');
            }
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
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && !adminUsers ? (
                                <tr><td colSpan={7} className="text-center py-10"><Spinner /></td></tr>
                            ) : adminUsers && adminUsers.length > 0 ? adminUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {user.isBlocked ? (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Blocked</span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-blue-600 font-semibold">{user.xp.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{formatJoinDate(user.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex gap-2 justify-center">
                                            {user.isBlocked ? (
                                                <button 
                                                    onClick={() => handleUnblock(user._id)}
                                                    disabled={user._id === currentUser?._id || isLoading}
                                                    className="p-2 text-gray-400 hover:text-green-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                                    title="Unblock User"
                                                >
                                                    <ShieldCheckIcon size={20}/>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleBlockClick(user._id)}
                                                    disabled={user._id === currentUser?._id}
                                                    className="p-2 text-gray-400 hover:text-orange-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                                    title={user._id === currentUser?._id ? "Cannot block yourself" : "Block User"}
                                                >
                                                    <LockIcon size={20}/>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(user._id, user.name)} 
                                                disabled={user._id === currentUser?._id}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                                title={user._id === currentUser?._id ? "Cannot delete yourself" : "Delete User"}
                                            >
                                                <TrashIcon size={20}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-500">No users found.</td></tr>
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

            {/* Block User Modal */}
            {blockModalUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Block User</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Are you sure you want to block this user? They will not be able to login until unblocked.
                                </p>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Enter reason for blocking (e.g., Spam, Harassment, Community Policy Violation)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                />
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    onClick={() => handleBlockSubmit(blockModalUser)}
                                    disabled={isBlockingUser || !blockReason.trim()}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isBlockingUser ? 'Blocking...' : 'Block User'}
                                </button>
                                <button
                                    onClick={() => {
                                        setBlockModalUser(null);
                                        setBlockReason('');
                                    }}
                                    disabled={isBlockingUser}
                                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
