
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGlucoseNavigation = () => {
  const navigate = useNavigate();
  const [logCreated, setLogCreated] = useState(false);

  // Process a message that might follow log creation - check for navigation intent
  const processViewLogsNavigation = (text: string): boolean => {
    if (text.toLowerCase().includes("yes") && text.length < 10) {
      setTimeout(() => {
        navigate('/logs');
      }, 500);
      return true;
    }
    return false;
  };

  // Handle offering to view logs after creating a log
  const handleLogCreated = async (
    setMessages: React.Dispatch<React.SetStateAction<any[]>>,
    playResponseAudio?: (text: string) => Promise<void>,
    mode?: 'voice' | 'text'
  ) => {
    if (logCreated) {
      setTimeout(() => {
        const viewLogsMessage = "Would you like to view your logs?";
        
        setMessages(prev => [
          ...prev,
          {
            text: viewLogsMessage,
            type: 'assistant',
            timestamp: Date.now(),
            isNew: true
          }
        ]);
        
        if (mode === 'voice' && playResponseAudio) {
          playResponseAudio(viewLogsMessage);
        }
        
        setLogCreated(false);
      }, 1000);
    }
  };

  return {
    logCreated,
    setLogCreated,
    processViewLogsNavigation,
    handleLogCreated
  };
};
