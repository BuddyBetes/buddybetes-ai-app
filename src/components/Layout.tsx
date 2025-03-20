
import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const path = location.pathname;
  
  return (
    <div className="flex flex-col min-h-screen">
      {isDashboard && path !== '/assistant' && (
        <header className="pt-6 pb-2 text-center">
          <h1 className="text-2xl font-bold text-buddy-600">BuddyBetes</h1>
        </header>
      )}
      <main className="flex-1 page-container">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
