
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlucoseUnitProvider } from '@/context/GlucoseUnitContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

// Page components
import Dashboard from '@/pages/Dashboard';
import AddLog from '@/pages/AddLog';
import Logs from '@/pages/Logs';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Onboarding from '@/pages/Onboarding';
import ResetPassword from '@/pages/auth/ResetPassword';
import EmailConfirmed from '@/pages/auth/EmailConfirmed';
import Profile from '@/pages/Profile';
import Assistant from '@/pages/Assistant';
import Settings from '@/pages/settings/Settings';
import Terms from '@/pages/Terms';
import Subscription from '@/pages/Subscription';

// Route guards
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import PageTransition from '@/components/PageTransition';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Wrap all authenticated routes with providers
  const renderProtectedRoute = (component: React.ReactNode) => (
    <ProtectedRoute>
      <GlucoseUnitProvider>
        <SubscriptionProvider>
          <PageTransition>
            {component}
          </PageTransition>
        </SubscriptionProvider>
      </GlucoseUnitProvider>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/dashboard"
        element={renderProtectedRoute(<Dashboard />)}
      />
      <Route
        path="/add-log"
        element={renderProtectedRoute(<AddLog />)}
      />
      <Route
        path="/logs"
        element={renderProtectedRoute(<Logs />)}
      />
      <Route
        path="/assistant"
        element={renderProtectedRoute(<Assistant />)}
      />
      <Route
        path="/subscription"
        element={renderProtectedRoute(<Subscription />)}
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute skipOnboardingCheck>
            <GlucoseUnitProvider>
              <SubscriptionProvider>
                <PageTransition>
                  <Onboarding />
                </PageTransition>
              </SubscriptionProvider>
            </GlucoseUnitProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={renderProtectedRoute(<Profile />)}
      />
      <Route
        path="/settings"
        element={renderProtectedRoute(<Settings />)}
      />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <PageTransition>
              <SignIn />
            </PageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <PageTransition>
              <SignUp />
            </PageTransition>
          </PublicRoute>
        }
      />
      <Route path="/confirm" element={<EmailConfirmed />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
