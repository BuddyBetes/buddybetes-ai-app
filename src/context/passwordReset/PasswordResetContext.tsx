
import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PasswordResetContextProps, ResetLocationState } from './types';
import { useTokenProcessor } from './useTokenProcessor';
import { useLinkValidator } from './useLinkValidator';
import { useResetCompletion } from './useResetCompletion';

const PasswordResetContext = createContext<PasswordResetContextProps | undefined>(undefined);

export const PasswordResetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, isPasswordRecovery } = useAuth();
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const location = useLocation();

  // Get location state from navigation, if any
  const locationState = location.state as ResetLocationState | null;

  // Process tokens from location state
  const { processingTokens } = useTokenProcessor({
    isPasswordRecovery,
    setIsValidResetLink,
    setMode
  });

  // Validate reset link
  useLinkValidator({
    isPasswordRecovery,
    isAuthenticated,
    loading,
    processingTokens,
    locationState,
    isValidResetLink,
    setIsValidResetLink,
    setMode,
    setIsCheckingLink
  });

  // Handle reset completion
  const { resetComplete, handleResetComplete } = useResetCompletion();

  // Prevent redirecting to dashboard if we're in password recovery mode
  // This hook is kept simple in the main context file
  React.useEffect(() => {
    if ((isPasswordRecovery || isValidResetLink) && isAuthenticated && !loading && !isCheckingLink) {
      console.log('In password recovery mode, preventing dashboard redirect');
      // Stay on reset password page when in password recovery flow
    }
  }, [isPasswordRecovery, isAuthenticated, loading, isCheckingLink, isValidResetLink]);

  return (
    <PasswordResetContext.Provider
      value={{
        mode,
        resetComplete,
        isValidResetLink,
        isCheckingLink,
        handleResetComplete
      }}
    >
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => {
  const context = useContext(PasswordResetContext);
  if (context === undefined) {
    throw new Error('usePasswordReset must be used within a PasswordResetProvider');
  }
  return context;
};
