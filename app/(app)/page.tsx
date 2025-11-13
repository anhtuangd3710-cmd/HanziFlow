'use client';

import React, { Suspense, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import Dashboard from '@/components/Dashboard';
import Spinner from '@/components/Spinner';

export default function HomePage() {
  const context = useContext(AppContext);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <p className="ml-4 text-gray-600">Loading page...</p>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
