
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  
  // Find the main content element within children
  const childArray = React.Children.toArray(children);
  const mainContent = childArray.find(child => 
    React.isValidElement(child) && 
    child.type === 'main'
  );
  
  // Extract other elements (header, nav, etc.)
  const otherElements = childArray.filter(child => 
    !React.isValidElement(child) || 
    child.type !== 'main'
  );

  return (
    <>
      {/* Render header, nav, etc. without animations */}
      {otherElements}
      
      {/* Apply animation only to main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {mainContent}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
