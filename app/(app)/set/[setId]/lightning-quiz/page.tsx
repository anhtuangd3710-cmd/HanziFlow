'use client';

import React, { Suspense } from 'react';
import Spinner from '@/components/Spinner';
import LightningQuizView from '@/components/LightningQuizView';

export default function LightningQuizPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <p className="ml-4 text-gray-600">Loading page...</p>
      </div>
    }>
      <LightningQuizView />
    </Suspense>
  );
}
