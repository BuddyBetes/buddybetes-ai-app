
import { useEffect } from 'react';

export const useSchedulingIntent = (
  schedulingIntent: boolean, 
  mode: 'voice' | 'text',
  isLoading: boolean,
  handleStartSession: () => void,
  handleInputChange: (text: string) => void,
  handleSend: () => void,
  handleVoiceMode: () => void
) => {
  // If coming with scheduling intent, automatically start the voice session
  // and prompt the user for scheduling information
  useEffect(() => {
    if (schedulingIntent && mode === 'voice' && !isLoading) {
      // Add a small delay to let the UI render before starting the session
      const timer = setTimeout(() => {
        handleStartSession();
        // Pre-fill with scheduling message to guide the assistant
        handleInputChange("I'd like to schedule a glucose logging reminder");
        handleSend();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [schedulingIntent, mode, isLoading, handleStartSession, handleInputChange, handleSend]);

  // Switch to voice mode when scheduling intent is detected
  useEffect(() => {
    if (schedulingIntent) {
      handleVoiceMode();
    }
  }, [schedulingIntent, handleVoiceMode]);
};
