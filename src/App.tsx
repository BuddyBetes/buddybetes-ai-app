
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LogProvider } from "./context/LogContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import AddLog from "./pages/AddLog";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Settings from "./pages/settings/Settings";
import Privacy from "./pages/settings/Privacy";
import Help from "./pages/settings/Help";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Onboarding from "./pages/Onboarding";

// Create Query Client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Update error handling to use the proper syntax for the current version
      // of @tanstack/react-query
      meta: {
        onError: (error: Error) => {
          console.error("Query error:", error);
        }
      }
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <LogProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected routes - require authentication and completed onboarding */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/logs" element={
                <ProtectedRoute>
                  <Logs />
                </ProtectedRoute>
              } />
              <Route path="/add-log" element={
                <ProtectedRoute>
                  <AddLog />
                </ProtectedRoute>
              } />
              <Route path="/assistant" element={
                <ProtectedRoute>
                  <Assistant />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/privacy" element={
                <ProtectedRoute>
                  <Privacy />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LogProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
