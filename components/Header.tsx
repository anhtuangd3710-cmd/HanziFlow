
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FlameIcon } from './icons/FlameIcon';
import { UsersIcon } from './icons/UsersIcon';

const Header: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;
  const { state, logout } = context;

  const handleLogout = () => {
    logout();
  };
  
  const user = state.user;
  const level = user ? Math.floor(user.xp / 100) + 1 : 1;
  const xpForNextLevel = 100;
  const currentLevelXp = user ? user.xp % xpForNextLevel : 0;
  const progressPercentage = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              HanziFlow
            </Link>
          </div>
          {user && (
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                to="/community"
                className="flex items-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <UsersIcon size={20} />
                <span className="hidden sm:inline">Community</span>
              </Link>

              <div className="flex items-center gap-2">
                 <FlameIcon className="h-6 w-6 text-orange-500" />
                 <span className="font-bold text-lg text-gray-700">{user.currentStreak}</span>
              </div>
              
              <div className="hidden md:block w-40">
                  <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-bold text-gray-700">Level {level}</span>
                      <span className="text-xs text-gray-500">{currentLevelXp} / {xpForNextLevel} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
                  </div>
              </div>

              <div className="flex items-center">
                  <span className="hidden lg:inline text-gray-700 mr-4">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Logout
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;