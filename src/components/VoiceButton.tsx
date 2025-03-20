
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioRecorder from './voice/AudioRecorder';
import { useSpeechSynthesis } from '@/hooks/assistant/useSpeechSynthesis';
import PulseAnimation from './voice/PulseAnimation';

interface VoiceButtonProps {
  onStartSession?: () => void;
  onEndSession?: () => void;
  onTextMode?: () => void;
  onSpeechResult?: (text: string) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onStartSession, 
  onEndSession,
  onTextMode,
  onSpeechResult
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use the speech synthesis hook directly
  const { isPlayingResponse, playResponseAudio } = useSpeechSynthesis();
  
  // Initialize the audio recorder
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      console.log("Speech recognized:", text);
      setStatus('processing');
      onSpeechResult && onSpeechResult(text);
    },
    onProcessingStateChange: (isProcessing) => {
      if (!isProcessing && status === 'processing') {
        // Set status to speaking, which will trigger audio playback in the useEffect below
        setStatus('speaking');
      }
    }
  });

  // Effect to handle audio response when status changes to speaking
  React.useEffect(() => {
    if (status === 'speaking' && !isPlayingResponse) {
      // Play a default response if we don't have a real one yet
      const demoResponse = "I've processed your request. Is there anything else you'd like me to help you with?";
      console.log("Playing audio response");
      playResponseAudio(demoResponse).catch(error => {
        console.error("Failed to play audio response:", error);
      });
    }
  }, [status, isPlayingResponse, playResponseAudio]);

  // When audio finishes playing, reset status to idle
  React.useEffect(() => {
    if (!isPlayingResponse && status === 'speaking') {
      console.log("Audio playback finished, setting status to idle");
      // Add a slight delay before setting to idle to avoid UI flickering
      const timer = setTimeout(() => setStatus('idle'), 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayingResponse, status]);

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

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <audio ref={audioRef} className="hidden" />
      
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
