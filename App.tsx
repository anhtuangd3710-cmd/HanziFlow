
import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import Spinner from './components/Spinner';
import ApiKeyModal from './components/ApiKeyModal'; // Import the modal

// --- Lazy Load Views ---
const Dashboard = lazy(() => import('./components/Dashboard'));
const FlashcardView = lazy(() => import('./components/FlashcardView'));
const QuizView = lazy(() => import('./components/QuizView'));
const LightningQuizView = lazy(() => import('./components/LightningQuizView'));
const QuizResult = lazy(() => import('./components/QuizResult'));
const ProgressView = lazy(() => import('./components/ProgressView'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const PublicSetPreview = lazy(() => import('./components/PublicSetPreview'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));


const ProtectedLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
    <Header />
    <main className="p-4 sm:p-6 lg:p-8">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Spinner />
          <p className="ml-4 text-gray-600">Loading page...</p>
        </div>
      }>
        <Outlet />
      </Suspense>
    </main>
  </div>
);

const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const { state, closeApiKeyModal } = context;

  const isAdmin = state.user?.role === 'admin';

  return (
    <>
      {state.isRequestingUserApiKey && <ApiKeyModal onClose={closeApiKeyModal} />}
      <Routes>
        <Route path="/login" element={state.user ? <Navigate to="/" /> : <AuthScreen />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}
        />

        {/* User Routes */}
        <Route
          path="/*"
          element={state.user ? <ProtectedLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="set/:setId/study" element={<FlashcardView />} />
          <Route path="set/:setId/quiz" element={<QuizView />} />
          <Route path="set/:setId/lightning-quiz" element={<LightningQuizView />} />
          <Route path="set/:setId/result" element={<QuizResult />} />
          <Route path="set/:setId/progress" element={<ProgressView />} />
          <Route path="community" element={<CommunityView />} />
          <Route path="community/set/:setId" element={<PublicSetPreview />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="leaderboard" element={<LeaderboardView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;