
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface VoiceStatusHeadingProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
}

const VoiceStatusHeading: React.FC<VoiceStatusHeadingProps> = ({ status }) => {
  const isMobile = useIsMobile();
  
  const getStatusHeading = () => {
    switch(status) {
      case 'idle': return "Any questions?";
      case 'listening': return "I'm listening...";
      case 'processing': return "Processing...";
      case 'speaking': return "Speaking...";
    }
  };

  return (
    <h1 className={`text-2xl ${isMobile ? 'text-xl' : 'text-3xl'} font-medium mb-6 md:mb-8 text-gray-800`}>
      {getStatusHeading()}
    </h1>
  );
};

export default VoiceStatusHeading;
