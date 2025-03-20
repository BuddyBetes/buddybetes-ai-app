
import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 page-container">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
