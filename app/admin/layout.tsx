'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import Spinner from '@/components/Spinner';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've finished hydrating AND user is not admin
    if (context?.state.isHydrated && (!context.state.user || context.state.user.role !== 'admin')) {
      router.push('/');
    }
  }, [context?.state.isHydrated, context?.state.user, context?.state.user?.role, router]);

  if (!context || !context.state.isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state } = context;
  const isAdmin = state.user?.role === 'admin';

  // Show loading state while checking admin access
  if (!state.user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
