

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UsersIcon } from '../icons/UsersIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800 text-center">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className={navLinkClass('/admin')}>
            <ChartBarIcon size={20} className="mr-3" /> Dashboard
          </Link>
          <Link href="/admin/users" className={navLinkClass('/admin/users')}>
            <UsersIcon size={20} className="mr-3" /> User Management
          </Link>
          <Link href="/admin/data-export" className={navLinkClass('/admin/data-export')}>
            <DownloadIcon size={20} className="mr-3" /> Data Export
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
