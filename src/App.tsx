
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LogProvider } from "./context/LogContext";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LogProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/add-log" element={<AddLog />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
