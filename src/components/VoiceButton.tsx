
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

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
  const [isListening, setIsListening] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Initialize media recorder
  useEffect(() => {
    let mounted = true;
    
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.onstart = () => {
          if (mounted) setAudioChunks([]);
        };
        
        recorder.ondataavailable = (e) => {
          if (mounted) setAudioChunks(chunks => [...chunks, e.data]);
        };
        
        recorder.onstop = async () => {
          if (!mounted) return;
          
          if (audioChunks.length > 0) {
            setIsProcessing(true);
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await processAudio(audioBlob);
          }
        };
        
        if (mounted) setMediaRecorder(recorder);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          title: "Microphone Error",
          description: "Please make sure your microphone is connected and permissions are granted.",
          variant: "destructive"
        });
      }
    };
    
    initializeRecorder();
    
    return () => {
      mounted = false;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, []);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
      setIsListening(true);
      setIsPulsing(true);
      onStartSession && onStartSession();
    }
  };

  const stopListening = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsListening(false);
      setIsPulsing(false);
      onEndSession && onEndSession();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            
            // Send to speech-to-text function
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            if (data.text) {
              // Call the callback with the transcribed text
              onSpeechResult && onSpeechResult(data.text);
              
              // Wait for response and then convert it to speech
              toast({
                title: "Transcription",
                description: data.text,
              });
            }
            
            setIsProcessing(false);
            resolve(true);
          } catch (error) {
            console.error("Processing error:", error);
            setIsProcessing(false);
            toast({
              title: "Processing Error",
              description: error instanceof Error ? error.message : "Failed to process audio",
              variant: "destructive"
            });
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          setIsProcessing(false);
          reject(error);
        };
        
        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      setIsProcessing(false);
      console.error("Audio processing error:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process audio",
        variant: "destructive"
      });
    }
  };

  // Play the AI's response as audio
  const playResponseAudio = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.audioContent) {
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.onended = () => setIsSpeaking(false);
          audioRef.current.play();
        }
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      toast({
        title: "Audio Playback Error",
        description: error instanceof Error ? error.message : "Failed to play audio response",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <audio ref={audioRef} className="hidden" />
      
      <motion.div
        className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-8 ${
          isListening ? 'bg-red-500/10' : 
          isProcessing ? 'bg-yellow-500/10' : 
          isSpeaking ? 'bg-green-500/10' : 'bg-buddy-500/10'
        }`}
      >
        {isPulsing && (
          <AnimatePresence>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.7 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
                className="absolute w-full h-full rounded-full bg-buddy-500/20"
              />
            ))}
          </AnimatePresence>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-24 h-24 rounded-full shadow-lg flex items-center justify-center z-10 ${
            isListening ? 'bg-red-500' : 
            isProcessing ? 'bg-yellow-500' :
            isSpeaking ? 'bg-green-500' : 'bg-buddy-500'
          }`}
          onClick={handleToggle}
          disabled={isProcessing || isSpeaking}
        >
          {isListening ? (
            <MicOff size={40} className="text-white" />
          ) : isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </motion.div>
          ) : isSpeaking ? (
            <Volume2 size={40} className="text-white" />
          ) : (
            <Mic size={40} className="text-white" />
          )}
        </motion.button>
        
        {(isListening || isProcessing || isSpeaking) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md"
            onClick={() => {
              setIsListening(false);
              setIsPulsing(false);
              setIsProcessing(false);
              setIsSpeaking(false);
              if (audioRef.current) {
                audioRef.current.pause();
              }
              if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
              onEndSession && onEndSession();
            }}
          >
            <X size={16} className="text-gray-600" />
          </motion.button>
        )}
      </motion.div>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Tagalog</span>
          <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
            <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
          </div>
          <span className="text-sm font-medium text-gray-500">Off</span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full rounded-full py-4 px-8 font-medium text-white shadow-md ${
            isListening ? 'bg-red-500' : 
            isProcessing ? 'bg-yellow-500' : 
            isSpeaking ? 'bg-green-500' : 'bg-buddy-500'
          }`}
          onClick={handleToggle}
          disabled={isProcessing || isSpeaking}
        >
          {isListening ? 'End Session' : 
           isProcessing ? 'Processing...' : 
           isSpeaking ? 'Speaking...' : 'Start Session'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full py-3 px-8 font-medium text-gray-700 border border-gray-300 flex items-center justify-center space-x-2"
          onClick={onTextMode}
        >
          <span className="text-xl">💬</span>
          <span>Text Mode</span>
        </motion.button>
      </div>
    </div>
  );
};

export default VoiceButton;
