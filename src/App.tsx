import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LogProvider } from "@/context/LogContext";
import { PasswordResetProvider } from "@/context/passwordReset/PasswordResetContext";
import AppRoutes from "@/components/AppRoutes";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import NativeBackButton from "@/components/NativeBackButton";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <NativeBackButton />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PasswordResetProvider>
            <LogProvider>
              <AnalyticsTracker>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                  <AppRoutes />
                  <Toaster />
                  <Sonner />
                </div>
              </AnalyticsTracker>
            </LogProvider>
          </PasswordResetProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;