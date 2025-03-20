
import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;
