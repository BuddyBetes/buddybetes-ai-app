
import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -10,
    },
  };

  const pageTransition = {
    type: 'tween',
    duration: 0.2,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <motion.main
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="flex-1 page-container"
      >
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </motion.main>
      <Navigation />
    </div>
  );
};

export default Layout;
