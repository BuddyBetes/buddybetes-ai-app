
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { LogProvider } from '@/context/LogContext';
import { GlucoseUnitProvider } from '@/context/GlucoseUnitContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes from '@/components/AppRoutes';
import Layout from '@/components/Layout';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { usePageTracking } from '@/hooks/usePageTracking';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  useSessionTracking();
  usePageTracking();
  
  return (
    <Layout>
      <AppRoutes />
      <Toaster />
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SubscriptionProvider>
            <LogProvider>
              <GlucoseUnitProvider>
                <AppContent />
              </GlucoseUnitProvider>
            </LogProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
