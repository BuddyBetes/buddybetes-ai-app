
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AppHeader = () => {
  const location = useLocation();
  const isAssistant = location.pathname === '/assistant';
  
  // Don't show header on assistant page since it has its own layout
  if (isAssistant) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 flex justify-between items-center bg-white shadow-sm">
      <div className="text-xl font-bold text-buddy-600">BuddyBetes</div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">2</div>
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
