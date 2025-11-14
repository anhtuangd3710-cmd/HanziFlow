'use client';

import React, { useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import FlashcardView from '@/components/FlashcardView';
import MatchingGame from '@/components/MatchingGame';
import WritingPractice from '@/components/WritingPractice';
import LightningQuizView from '@/components/LightningQuizView';
import QuizView from '@/components/QuizView';
import MixedStudyMode from '@/components/MixedStudyMode';
import StudyModeSelector from '@/components/StudyModeSelector';
import Spinner from '@/components/Spinner';

export default function StudyPage() {
  const searchParams = useSearchParams();
  const studyMode = searchParams.get('studyMode') || 'all';
  const context = useContext(AppContext);
  const router = useRouter();

  if (!context?.state.user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  // Based on studyMode query param, render appropriate component
  switch (studyMode) {
    case 'flashcard':
      return <FlashcardView />;
    case 'matching':
      return <MatchingGame />;
    case 'writing':
      return <WritingPractice />;
    case 'lightning':
      return <LightningQuizView />;
    case 'quiz':
      return <QuizView />;
    case 'mixed':
      return <MixedStudyMode />;
    case 'all':
    default:
      return <StudyModeSelector />;
  }
}
