
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

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

// Route guards
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import PageTransition from '@/components/PageTransition';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-log"
        element={
          <ProtectedRoute>
            <PageTransition>
              <AddLog />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Logs />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Assistant />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarding={false}>
            <PageTransition>
              <Onboarding />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <PageTransition>
              <Settings />
            </PageTransition>
          </ProtectedRoute>
        }
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
