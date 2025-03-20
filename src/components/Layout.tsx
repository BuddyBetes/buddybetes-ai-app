
import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 page-container">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
