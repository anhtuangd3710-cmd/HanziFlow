import React, { useContext, Suspense, lazy } from 'react';
import { AppContext } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import Spinner from './components/Spinner';

// --- Lazy Load Views ---
const Dashboard = lazy(() => import('./components/Dashboard'));
const FlashcardView = lazy(() => import('./components/FlashcardView'));
const QuizView = lazy(() => import('./components/QuizView'));
const QuizResult = lazy(() => import('./components/QuizResult'));
const ProgressView = lazy(() => import('./components/ProgressView'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const PublicSetPreview = lazy(() => import('./components/PublicSetPreview'));


const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state } = context;

  const renderView = () => {
    if (!state.user) {
      return <AuthScreen />;
    }

    switch (state.currentView.view) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'FLASHCARDS':
        return <FlashcardView setId={state.currentView.setId} />;
      case 'QUIZ':
        return <QuizView setId={state.currentView.setId} quizType={state.currentView.quizType} questionTypes={state.currentView.questionTypes} />;
      case 'QUIZ_RESULT':
          return <QuizResult quizResult={state.currentView.result} setId={state.currentView.setId} quizType={state.currentView.quizType} questionTypes={state.currentView.questionTypes} />;
      case 'PROGRESS':
        return <ProgressView setId={state.currentView.setId} />;
      case 'COMMUNITY':
        return <CommunityView />;
      case 'PUBLIC_SET_PREVIEW':
        return <PublicSetPreview setId={state.currentView.setId} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {state.user && <Header />}
      <main className="p-4 sm:p-6 lg:p-8">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
              <Spinner />
              <p className="ml-4 text-gray-600">Loading page...</p>
          </div>
        }>
          {renderView()}
        </Suspense>
      </main>
    </div>
  );
};

export default App;