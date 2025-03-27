
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationState } from './types';

export const useAssistantNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fromAddLog, setFromAddLog] = useState(false);
  const [schedulingIntent, setSchedulingIntent] = useState(false);
  
  // Check if we came from the add-log page and check for scheduling intent
  useEffect(() => {
    if (location.state) {
      const state = location.state as NavigationState;
      
      if (state.from === 'add-log') {
        setFromAddLog(true);
      }
      
      if (state.intent === 'schedule') {
        setSchedulingIntent(true);
      }
    }
  }, [location]);
  
  const handleBackToLog = () => {
    navigate('/add-log');
  };
  
  return {
    fromAddLog,
    schedulingIntent,
    handleBackToLog
  };
};
