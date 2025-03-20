
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioRecorder from './voice/AudioRecorder';
import PulseAnimation from './voice/PulseAnimation';

interface VoiceButtonProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onTextMode?: () => void;
  onSpeechResult?: (text: string) => void;
  isPlayingResponse: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onStartSession, 
  onEndSession,
  onTextMode,
  onSpeechResult,
  isPlayingResponse
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Initialize the audio recorder
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      console.log("Speech recognized:", text);
      setStatus('processing');
      setErrorMsg(null);
      if (text.trim().length > 0) {
        onSpeechResult && onSpeechResult(text);
      } else {
        // Handle empty text
        console.log("Empty text received from speech recognition");
        setStatus('idle');
      }
    },
    onProcessingStateChange: (isProcessing) => {
      if (!isProcessing && status === 'processing') {
        console.log("Processing complete, ready for speaking state");
        // Don't transition to idle here - we need to wait for the assistant response
        // The transition will be handled by the isPlayingResponse effect
      }
    }
  });

  // Effect to handle state changes based on external isPlayingResponse prop
  React.useEffect(() => {
    console.log("isPlayingResponse changed:", isPlayingResponse, "current status:", status);
    
    if (isPlayingResponse) {
      console.log("Setting status to speaking because isPlayingResponse is true");
      setStatus('speaking');
    } else if (!isPlayingResponse && status === 'speaking') {
      console.log("Response finished playing, setting status to idle after delay");
      // Reset to idle after response is done playing
      const timer = setTimeout(() => {
        console.log("Timeout executed, setting status to idle");
        setStatus('idle');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayingResponse, status]);

  // Reset error message when status changes
  React.useEffect(() => {
    if (status !== 'idle') {
      setErrorMsg(null);
    }
  }, [status]);

  // Debugging effect to monitor status changes
  React.useEffect(() => {
    console.log("Voice button status changed to:", status);
  }, [status]);

  const handleToggle = () => {
    if (status === 'listening') {
      handleEndSession();
    } else {
      handleStartSession();
    }
  };

  const handleStartSession = () => {
    startRecording();
    setStatus('listening');
    setErrorMsg(null);
    onStartSession && onStartSession();
  };

  const handleEndSession = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  // Add a dedicated function for the X button
  const handleStopButton = () => {
    stopRecording();
    setStatus('processing');
    onEndSession && onEndSession();
  };

  const renderButtonContent = () => {
    switch (status) {
      case 'listening':
        return <X size={24} className="text-gray-800" />;
      case 'processing':
        return <Loader size={24} className="text-gray-800 animate-spin" />;
      case 'speaking':
        return <Mic size={24} className="text-gray-800" />;
      default:
        return <span className="text-gray-800 font-medium">begin session</span>;
    }
  };

  // Render content for the main circle based on the current status
  const renderCircleContent = () => {
    if (status === 'processing') {
      return <Loader size={48} className="text-white animate-spin" />;
    } else if (status === 'speaking') {
      return <Mic size={48} className="text-white" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-medium mb-8 text-gray-800">
        {status === 'idle' ? "still up? same!" : 
         status === 'listening' ? "I'm listening..." :
         status === 'processing' ? "Processing..." :
         "Speaking..."}
      </h1>
      
      <div className="relative mb-16">
        <motion.div 
          className="w-48 h-48 rounded-full bg-[#35cab4] flex items-center justify-center relative"
          animate={{
            scale: status === 'speaking' ? [1, 1.05, 1] : 1
          }}
          transition={{ 
            duration: 2, 
            repeat: status === 'speaking' ? Infinity : 0,
            repeatType: "loop" 
          }}
        >
          <PulseAnimation isActive={status === 'listening'} />
          {renderCircleContent()}
        </motion.div>
        
        {status === 'listening' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md z-10"
            onClick={handleStopButton}
          >
            <X size={18} className="text-gray-600" />
          </motion.button>
        )}
      </div>
      
      {errorMsg && (
        <div className="mb-4 text-red-500 text-center">{errorMsg}</div>
      )}
      
      <div className="flex space-x-4 mb-6">
        <Button 
          variant="outline" 
          className={`rounded-full px-8 py-2 ${status === 'idle' ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-white border-gray-200 text-gray-400'}`}
        >
          classic
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full px-8 py-2 bg-white border-gray-200 text-gray-400"
        >
          guided
        </Button>
      </div>
      
      <Button 
        onClick={handleToggle}
        disabled={status === 'processing' || status === 'speaking'}
        className={`bg-[#35cab4] hover:bg-[#2ba999] text-white rounded-full px-12 py-6 text-lg font-medium w-64 flex items-center justify-center transition-all ${status === 'processing' || status === 'speaking' ? 'opacity-80' : ''}`}
      >
        {renderButtonContent()}
      </Button>
      
      <Button
        variant="ghost" 
        onClick={onTextMode}
        className="mt-4 text-gray-500"
      >
        Switch to Text Mode
      </Button>
    </div>
  );
};

export default VoiceButton;
