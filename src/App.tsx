
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { LogProvider } from "./context/LogContext";
import { Toaster } from "@/components/ui/toaster";
import { GlucoseUnitProvider } from "@/context/GlucoseUnitContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlucoseUnitProvider>
          <LogProvider>
            <AppRoutes />
            <Toaster />
          </LogProvider>
        </GlucoseUnitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
