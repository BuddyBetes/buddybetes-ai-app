
import { useState, useEffect } from 'react';
import { useGlucoseProcessor } from './useGlucoseProcessor';
import { useGlucoseNavigation } from './useGlucoseNavigation';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types';

export const TIME_GROUPS = {
  just_now: 'Just now',
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This week',
  older: 'Older'
};

export const useGlucoseLogging = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  playResponseAudio: ((text: string) => Promise<void>) | undefined,
  mode: 'voice' | 'text'
) => {
  const [logCreated, setLogCreated] = useState<boolean>(false);
  const { toast } = useToast();
  
  const {
    askForTime,
    processGlucoseLogIntent
  } = useGlucoseProcessor(setMessages, playResponseAudio, mode);
  
  const { processViewLogsNavigation } = useGlucoseNavigation();
  
  // Clear logCreated flag after a delay
  useEffect(() => {
    if (logCreated) {
      const timer = setTimeout(() => {
        setLogCreated(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [logCreated]);
  
  // Handle log creation completion
  const handleLogCreated = () => {
    if (logCreated) {
      toast({
        title: "Log Added",
        description: "Your glucose reading was added successfully.",
        duration: 3000
      });
      
      setLogCreated(false);
    }
  };
  
  return {
    logCreated,
    askForTime,
    processGlucoseLogIntent,
    processViewLogsNavigation,
    handleLogCreated
  };
};

// No need to re-export TIME_GROUPS here since it's already exported above
