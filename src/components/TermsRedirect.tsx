import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Terms from '../pages/Terms';

const TermsRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is the /terms route and render the Terms component
    if (location.pathname === '/terms') {
      return;
    } else {
      // If not on terms route, we'll let the normal routing work
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // If we're on the terms route, render the Terms component
  if (location.pathname === '/terms') {
    return <Terms />;
  }
  
  // Otherwise return null
  return null;
};

export default TermsRedirect;
