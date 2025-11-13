'use client';

import React, { Suspense, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import ApiKeyModal from '@/components/ApiKeyModal';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've finished hydrating AND there's no user
    if (context?.state.isHydrated && !context.state.user) {
      router.push('/login');
    }
  }, [context?.state.isHydrated, context?.state.user, router]);

  if (!context || !context.state.isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state, closeApiKeyModal } = context;

  // Return loading state until user is hydrated
  if (!state.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {state.isRequestingUserApiKey && <ApiKeyModal onClose={closeApiKeyModal} />}
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <Spinner />
              <p className="ml-4 text-gray-600">Loading page...</p>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </>
  );
}
