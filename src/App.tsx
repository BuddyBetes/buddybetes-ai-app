
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { LogProvider } from "./context/LogContext";
import { Toaster } from "@/components/ui/toaster";
import { usePwaInstall } from "./hooks/usePwaInstall";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

function App() {
  // Initialize the PWA installation hook with proper effect
  const { canInstall, installPwa } = usePwaInstall();
  const isMobile = useIsMobile();
  
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
          
          {/* PWA Install Button - only shown on mobile */}
          {canInstall && isMobile && (
            <div className="fixed bottom-20 right-4 z-50">
              <Button 
                onClick={installPwa}
                className="rounded-full shadow-lg bg-[#35cab4] hover:bg-[#29A493] text-white"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            </div>
          )}
        </LogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
