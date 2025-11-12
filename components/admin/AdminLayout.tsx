
import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { UsersIcon } from '../icons/UsersIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DataExport from './DataExport';

const AdminLayout: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800 text-center">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
            <NavLink to="/admin" end className={navLinkClass}>
                <ChartBarIcon size={20} className="mr-3" /> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
                <UsersIcon size={20} className="mr-3" /> User Management
            </NavLink>
            <NavLink to="/admin/data-export" className={navLinkClass}>
                <DownloadIcon size={20} className="mr-3" /> Data Export
            </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="data-export" element={<DataExport />} />
            <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
