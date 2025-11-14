'use client';

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import Spinner from '@/components/Spinner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    // If context is not ready yet, wait
    if (!context) return;
    
    // If user is already logged in, redirect to home
    if (context.state.isHydrated && context.state.user) {
      router.push('/');
    }
  }, [context, router]);

  // Show loading spinner while checking auth
  if (!context || !context.state.isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // If user is logged in, show loading while redirecting
  if (context.state.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
