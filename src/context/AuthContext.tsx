
import React, { createContext, useContext } from 'react';
import { useAuthSession } from '@/context/auth/useAuthSession';
import { useOnboardingStatus } from '@/context/auth/useOnboardingStatus';
import { useAuthOperations } from '@/context/auth/useAuthOperations';
import { AuthContextProps } from '@/context/auth/types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Handle session and basic auth state
  const { 
    session, 
    user, 
    loading, 
    isAuthenticated,
    isPasswordRecovery 
  } = useAuthSession();

  // Handle onboarding status
  const {
    hasCompletedOnboarding,
    setHasCompletedOnboarding
  } = useOnboardingStatus(user?.id, isPasswordRecovery);

  // Handle auth operations
  const { signIn, signUp, signOut: authSignOut, isSignupInProgress } = useAuthOperations();

  // Wrap sign out without clearing onboarding state (it's user data, not session data)
  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        isPasswordRecovery,
        isSignupInProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
