
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileNotifications from './profile/ProfileNotifications';
import NotificationIndicator from './profile/NotificationIndicator';
import ProfileMenu from './profile/ProfileMenu';

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
      <div className="flex items-center">
        <img src="/favicon.png" alt="buddybetes Logo" className="w-6 h-6" />
      </div>
      <div className="flex items-center space-x-4">
        <ProfileNotifications>
          <NotificationIndicator className="p-2 rounded-full hover:bg-gray-100 relative" />
        </ProfileNotifications>
        <ProfileMenu />
      </div>
    </header>
  );
};

export default AppHeader;
