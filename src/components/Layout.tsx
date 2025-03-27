
import React, { ReactNode, useEffect } from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { isAuthenticated } = useAuth();
  
  // Add meta tag for iOS status bar
  useEffect(() => {
    // Add viewport-fit=cover to enable safe areas
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Add safe area padding at the top for iOS notch */}
      <div className="w-full h-safe-top bg-white fixed top-0 left-0 right-0 z-50"></div>
      
      <main className="flex-1 page-container pt-16 pb-16 px-4 mt-safe-top">
        {children}
      </main>
      
      {isAuthenticated && <Navigation />}
    </div>
  );
};

export default Layout;
