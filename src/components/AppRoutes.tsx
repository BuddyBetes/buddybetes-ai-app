
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
import Event from '@/pages/Event';
import Settings from '@/pages/settings/Settings';
import Terms from '@/pages/Terms';
import Subscription from '@/pages/Subscription';
import PaymentSuccess from '@/pages/PaymentSuccess';
import DeleteAccountInfo from '@/pages/DeleteAccountInfo';

// Admin imports
import AdminAuth from '@/pages/admin/AdminAuth';
import AdminDashboardHome from '@/pages/admin/AdminDashboardHome';
import PaymentReceipts from '@/pages/admin/PaymentReceipts';
import EmailManagement from '@/pages/admin/EmailManagement';
import EventDashboard from '@/pages/admin/EventDashboard';
import EventScannerView from '@/pages/admin/EventScannerView';
import DiscountCodes from '@/pages/admin/DiscountCodes';
import EmailCampaigns from '@/pages/admin/EmailCampaigns';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminRoute } from '@/components/AdminRoute';

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
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminAuth />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboardHome /></AdminLayout></AdminRoute>} />
      <Route path="/admin/receipts" element={<AdminRoute><AdminLayout><PaymentReceipts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/campaigns" element={<AdminRoute><AdminLayout><EmailCampaigns /></AdminLayout></AdminRoute>} />
      <Route path="/admin/emails" element={<AdminRoute><AdminLayout><EmailManagement /></AdminLayout></AdminRoute>} />
      <Route path="/admin/events" element={<AdminRoute><AdminLayout><EventDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/events/scan/:eventId" element={<AdminRoute><AdminLayout><EventScannerView /></AdminLayout></AdminRoute>} />
      <Route path="/admin/discounts" element={<AdminRoute><AdminLayout><DiscountCodes /></AdminLayout></AdminRoute>} />
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
        path="/payment-success"
        element={renderProtectedRoute(<PaymentSuccess />)}
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
      <Route path="/delete-account" element={<DeleteAccountInfo />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/event/:eventId" element={<Event />} />
    </Routes>
  );
};

export default AppRoutes;
