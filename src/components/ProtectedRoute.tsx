
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  skipOnboardingCheck = false,
  requireEmailVerification = true,
}) => {
  const { isAuthenticated, isEmailVerified, loading, hasCompletedOnboarding } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate to="/signin" state={{ requiresVerification: true }} replace />;
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
