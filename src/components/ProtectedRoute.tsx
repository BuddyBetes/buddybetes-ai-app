
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  skipOnboardingCheck = false,
}) => {
  const { isAuthenticated, loading, hasCompletedOnboarding, user } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // For onboarding route, verify email is confirmed
  if (skipOnboardingCheck && user) {
    // Check if email is confirmed
    const emailConfirmed = user.email_confirmed_at || user.confirmed_at;
    
    if (!emailConfirmed) {
      console.log('[PROTECTED ROUTE] Email not confirmed, redirecting to signin');
      return <Navigate to="/signin" replace />;
    }
  }

  // If this is the onboarding route, we don't need to check completion status
  if (skipOnboardingCheck) {
    return <>{children}</>;
  }

  // If we need to check onboarding and the user hasn't completed it, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
