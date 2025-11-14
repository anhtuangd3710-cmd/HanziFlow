

import React, { useContext, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { FlameIcon } from './icons/FlameIcon';
import { UsersIcon } from './icons/UsersIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';


const Header: React.FC = () => {
  const context = useContext(AppContext);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydration and close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!context) return null;
  const { state, logout } = context;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login');
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
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="HanziFlow Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-blue-600 hidden sm:inline">HanziFlow</span>
            </Link>
          </div>
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <Link
                href="/leaderboard"
                className="hidden sm:flex items-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors text-sm"
              >
                <TrophyIcon size={18} />
                <span className="hidden lg:inline">Leaderboard</span>
              </Link>
              <Link
                href="/community"
                className="hidden sm:flex items-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors text-sm"
              >
                <UsersIcon size={18} />
                <span className="hidden lg:inline">Community</span>
              </Link>

              <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                 <FlameIcon className="h-5 w-5 text-orange-500" />
                 <span className="font-bold text-sm text-gray-700">{user.currentStreak}</span>
              </div>
              
              <div className="hidden lg:block w-32">
                  <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-bold text-gray-700">L{level}</span>
                      <span className="text-xs text-gray-500">{currentLevelXp}/{xpForNextLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${progressPercentage}%`}}></div>
                  </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <UserCircleIcon size={28} className="text-gray-600" />
                      <span className="hidden sm:inline font-semibold text-gray-800 text-sm">{user.name.split(' ')[0]}</span>
                      <ChevronDownIcon size={16} className={`text-gray-500 transition-transform hidden sm:inline ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                          <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              My Profile
                          </Link>
                          {user.role === 'admin' && (
                              <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <ShieldCheckIcon size={16} className="mr-2" />
                                Admin Panel
                              </Link>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              Logout
                          </button>
                      </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
