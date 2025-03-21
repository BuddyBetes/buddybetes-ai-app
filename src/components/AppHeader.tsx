
import React from 'react';
import { User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileNotifications from './profile/ProfileNotifications';
import NotificationIndicator from './profile/NotificationIndicator';

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAssistant = location.pathname === '/assistant';
  
  // Don't show header on assistant page since it has its own layout
  if (isAssistant) return null;
  
  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 flex justify-between items-center bg-white shadow-sm">
      <div className="text-xl font-bold text-buddy-600">BuddyBetes</div>
      <div className="flex items-center space-x-4">
        <ProfileNotifications>
          <NotificationIndicator className="p-2 rounded-full hover:bg-gray-100 relative" />
        </ProfileNotifications>
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={navigateToProfile}
        >
          <User size={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
