'use client';

import React, { Suspense } from 'react';
import Spinner from '@/components/Spinner';
import QuizResult from '@/components/QuizResult';

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <p className="ml-4 text-gray-600">Loading page...</p>
      </div>
    }>
      <QuizResult />
    </Suspense>
  );
}
