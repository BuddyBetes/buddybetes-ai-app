
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useResetCompletion() {
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();

  // Handle reset completion - redirect to signin when complete
  const handleResetComplete = () => {
    setResetComplete(true);
  };

  // Effect to handle redirection after reset is complete
  useEffect(() => {
    if (resetComplete) {
      // Give time for the success message to be seen, then redirect
      const redirectTimer = setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [resetComplete, navigate]);

  return {
    resetComplete,
    handleResetComplete
  };
}
