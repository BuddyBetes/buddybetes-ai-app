
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { LogProvider } from "./context/LogContext";
import { Toaster } from "@/components/ui/toaster";
import { usePwaInstall } from "./hooks/usePwaInstall";

function App() {
  // Initialize the PWA installation hook with proper effect
  const { canInstall } = usePwaInstall();
  
  // Log PWA installation availability
  useEffect(() => {
    if (canInstall) {
      console.log("PWA can be installed on this device");
    }
  }, [canInstall]);
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <LogProvider>
          <AppRoutes />
          <Toaster />
        </LogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
