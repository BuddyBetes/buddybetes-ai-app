
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// MediaRecorder configuration options
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export interface AudioCaptureState {
  isRecording: boolean;
  hasRecordingStarted: boolean;
  audioChunks: Blob[];
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  streamRef: React.MutableRefObject<MediaStream | null>;
}

export interface AudioCaptureControls {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  getAudioBlob: () => Blob | null;
  stopMediaTracks: () => void;
}

/**
 * Hook for managing audio recording from microphone
 */
export const useAudioCapture = (): AudioCaptureControls => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Clean up media resources when unmounted
  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  /**
   * Stops all active media tracks and cleans up resources
   */
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  /**
   * Request microphone access and initialize media stream
   */
  const initializeMicrophone = async (): Promise<MediaStream> => {
    try {
      // Request microphone access
      return await navigator.mediaDevices.getUserMedia({ 
        audio: AUDIO_CONSTRAINTS
      });
    } catch (error) {
      console.error("Microphone access error:", error);
      throw new Error("Could not access microphone. Please check permissions.");
    }
  };

  /**
   * Create and configure a MediaRecorder for the given stream
   */
  const initializeMediaRecorder = (stream: MediaStream): MediaRecorder => {
    // Create media recorder
    const mediaRecorder = new MediaRecorder(stream);
    
    // Set up data handler
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log("Voice data chunk received, size:", event.data.size);
        setAudioChunks(prev => [...prev, event.data]);
        setHasRecordingStarted(true);
      } else {
        console.log("Empty audio chunk received");
      }
    };
    
    return mediaRecorder;
  };

  /**
   * Begins audio recording from the microphone
   */
  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setAudioChunks([]);
      setHasRecordingStarted(false);
      
      const stream = await initializeMicrophone();
      streamRef.current = stream;
      
      const mediaRecorder = initializeMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every 1000ms
      console.log("Media recorder started");
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  /**
   * Stops the current recording session
   */
  const stopRecording = () => {
    console.log("Stopping recording...");
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log("Voice recording stopped");
      setIsRecording(false);
    } else {
      console.log("Not recording or MediaRecorder not initialized");
    }
  };

  /**
   * Returns the recorded audio as a Blob
   */
  const getAudioBlob = (): Blob | null => {
    if (audioChunks.length > 0 && hasRecordingStarted) {
      return new Blob(audioChunks, { type: 'audio/webm' });
    }
    return null;
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    getAudioBlob,
    stopMediaTracks
  };
};
