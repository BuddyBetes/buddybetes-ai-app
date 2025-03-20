
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionButtons from './voice/ActionButtons';
import AudioRecorder from './voice/AudioRecorder';
import AudioPlayer from './voice/AudioPlayer';

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
  
  // Initialize the audio recorder
  const { isRecording, startRecording, stopRecording } = AudioRecorder({
    onSpeechResult: (text) => {
      onSpeechResult && onSpeechResult(text);
    },
    onProcessingStateChange: (isProcessing) => {
      setStatus(isProcessing ? 'processing' : 'idle');
    }
  });

  // Initialize the audio player
  const { audioRef, playResponseAudio } = AudioPlayer({
    onPlaybackStateChange: (isPlaying) => {
      setStatus(isPlaying ? 'speaking' : 'idle');
    }
  });

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
    setStatus('idle');
    onEndSession && onEndSession();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <audio ref={audioRef} className="hidden" />
      
      <h1 className="text-3xl font-medium mb-8 text-gray-800">
        {status === 'idle' ? "still up? same!" : "I'm listening..."}
      </h1>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-48 h-48 rounded-full bg-[#FFD872] mb-16 relative flex items-center justify-center"
      >
        {status === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FFD872] opacity-70"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "loop" 
            }}
          />
        )}
        
        {status === 'listening' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-md z-10"
            onClick={handleEndSession}
          >
            <X size={18} className="text-gray-600" />
          </motion.button>
        )}
      </motion.div>
      
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
        className="bg-[#FFD872] hover:bg-[#E5C267] text-gray-800 rounded-full px-12 py-6 text-lg font-medium w-64"
      >
        {status === 'listening' ? "end session" : "begin session"}
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
