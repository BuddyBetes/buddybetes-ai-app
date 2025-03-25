
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
  const { signIn, signUp, signOut: authSignOut } = useAuthOperations();

  // Wrap sign out to clear onboarding state
  const signOut = async () => {
    await authSignOut();
    setHasCompletedOnboarding(false);
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
