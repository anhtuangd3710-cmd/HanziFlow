'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import AuthScreen from '@/components/AuthScreen';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (context?.state.user) {
      router.push('/');
    }
  }, [context?.state.user, router]);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state } = context;

  // Show loading state while checking auth
  if (state.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <AuthScreen />;
}
