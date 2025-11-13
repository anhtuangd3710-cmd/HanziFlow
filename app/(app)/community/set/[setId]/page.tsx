'use client';

import React, { Suspense, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import ApiKeyModal from '@/components/ApiKeyModal';
import PublicSetPreview from '@/components/PublicSetPreview';

export default function PublicSetPage() {
  const context = useContext(AppContext);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state, closeApiKeyModal } = context;

  if (!state.user) {
    return null;
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
            <PublicSetPreview />
          </Suspense>
        </main>
      </div>
    </>
  );
}
