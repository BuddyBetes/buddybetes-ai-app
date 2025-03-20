
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AppHeader = () => {
  const location = useLocation();
  const isAssistant = location.pathname === '/assistant';
  
  // Don't show header on assistant page since it has its own layout
  if (isAssistant) return null;
  
  return (
    <header className="w-full px-4 py-3 flex justify-between items-center bg-white shadow-sm mb-4">
      <div className="text-xl font-bold text-buddy-600">BuddyBetes</div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} className="text-gray-700" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <User size={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
