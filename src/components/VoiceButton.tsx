
import React, { useState } from 'react';
import PulseAnimation from './voice/PulseAnimation';
import StatusButton from './voice/StatusButton';
import CancelButton from './voice/CancelButton';
import LanguageToggle from './voice/LanguageToggle';
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
  const [isPulsing, setIsPulsing] = useState(false);
  
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
    setIsPulsing(true);
    onStartSession && onStartSession();
    console.log("Started listening for voice input");
  };

  const handleEndSession = () => {
    stopRecording();
    setStatus('idle');
    setIsPulsing(false);
    onEndSession && onEndSession();
    console.log("Stopped listening for voice input");
  };

  const handleCancel = () => {
    console.log("Cancelling current voice operation");
    setStatus('idle');
    setIsPulsing(false);
    stopRecording();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onEndSession && onEndSession();
  };

  // Get the background color class based on current status
  const getBackgroundColorClass = () => {
    switch (status) {
      case 'listening': return 'bg-red-500/10';
      case 'processing': return 'bg-yellow-500/10';
      case 'speaking': return 'bg-green-500/10';
      default: return 'bg-buddy-500/10';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <audio ref={audioRef} className="hidden" />
      
      <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-8 ${getBackgroundColorClass()}`}>
        <PulseAnimation isActive={isPulsing} />
        
        <StatusButton 
          status={status}
          onClick={handleToggle}
        />
        
        {(status !== 'idle') && (
          <CancelButton onClick={handleCancel} />
        )}
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <LanguageToggle />
        
        <ActionButtons 
          status={status}
          onStartEndSession={handleToggle}
          onTextMode={onTextMode || (() => {})}
        />
      </div>
    </div>
  );
};

export default VoiceButton;
