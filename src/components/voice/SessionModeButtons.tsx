
// This component is now empty as we're removing the classic and guided buttons
import React from 'react';

interface SessionModeButtonsProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
}

const SessionModeButtons: React.FC<SessionModeButtonsProps> = () => {
  // Return null to effectively remove the buttons from the UI
  return null;
};

export default SessionModeButtons;
