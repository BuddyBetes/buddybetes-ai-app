
import React, { ReactNode, useEffect } from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppHeader from './AppHeader';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { isAuthenticated } = useAuth();
  const isAssistant = path === '/assistant';
  
  // Add meta tag for iOS status bar
  useEffect(() => {
    // Add viewport-fit=cover to enable safe areas
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Set body style to prevent overscroll bouncing on iOS
    document.body.style.overscrollBehavior = 'none';
    
    // Prevent elastic scrolling on iOS
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflowY = 'scroll';
    
    return () => {
      // Clean up when component unmounts
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflowY = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Add safe area padding at the top for iOS notch */}
      <div className="w-full h-safe-top bg-white fixed top-0 left-0 right-0 z-50"></div>
      
      {/* Only show AppHeader if not on assistant page */}
      {isAuthenticated && !isAssistant && <AppHeader />}
      
      <main className={`flex-1 page-container ${isAssistant ? 'pt-0' : 'pt-16'} pb-20 px-4 mt-safe-top`}>
        {children}
      </main>
      
      {isAuthenticated && <Navigation />}
    </div>
  );
};

export default Layout;
