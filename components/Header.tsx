import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;
  const { state, logout, setView } = context;

  const handleLogout = () => {
    logout();
  };
  
  const goDashboard = () => {
    setView({ view: 'DASHBOARD' });
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 onClick={goDashboard} className="text-2xl font-bold text-blue-600 cursor-pointer">
              HanziFlow
            </h1>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">Welcome, {state.user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
