
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LogProvider } from './context/LogContext';
import AppRoutes from './components/AppRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LogProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LogProvider>
    </AuthProvider>
  );
};

export default App;
