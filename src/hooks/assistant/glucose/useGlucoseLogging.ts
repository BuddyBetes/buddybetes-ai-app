
import { useEffect } from 'react';
import { useGlucoseProcessor } from './useGlucoseProcessor';
import { useGlucoseNavigation } from './useGlucoseNavigation';

export const useGlucoseLogging = (
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  playResponseAudio: ((text: string) => Promise<void>) | undefined,
  mode: 'voice' | 'text'
) => {
  const {
    askForTime,
    processGlucoseLogIntent
  } = useGlucoseProcessor(setMessages, playResponseAudio, mode);

  const {
    logCreated,
    setLogCreated,
    processViewLogsNavigation,
    handleLogCreated: handleLogCreatedBase
  } = useGlucoseNavigation();

  // Handle log creation follow-up - wrapper to provide setMessages
  const handleLogCreated = () => {
    handleLogCreatedBase(setMessages, playResponseAudio, mode);
  };

  // Watch for log creation and trigger the follow-up
  useEffect(() => {
    handleLogCreated();
  }, [logCreated]);

  return {
    logCreated,
    askForTime,
    processGlucoseLogIntent,
    processViewLogsNavigation,
    handleLogCreated
  };
};
