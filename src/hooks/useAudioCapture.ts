
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// MediaRecorder configuration options
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Use a supported audio format that works well with the OpenAI Whisper API
const AUDIO_MIME_TYPE = 'audio/webm';

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
   * Check if the browser supports the required MediaRecorder functionality
   */
  const checkBrowserSupport = (): boolean => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      console.error("MediaRecorder or mediaDevices not supported in this browser");
      return false;
    }
    return true;
  };

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
      // Check browser support first
      if (!checkBrowserSupport()) {
        throw new Error("Your browser doesn't support audio recording. Please try using Chrome or Firefox.");
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: AUDIO_CONSTRAINTS
      });
      
      console.log("Microphone access granted", stream);
      return stream;
    } catch (error) {
      console.error("Microphone access error:", error);
      throw new Error("Could not access microphone. Please check permissions.");
    }
  };

  /**
   * Create and configure a MediaRecorder for the given stream
   */
  const initializeMediaRecorder = (stream: MediaStream): MediaRecorder => {
    let options = {};
    
    // Try to use a specific MIME type that works well with speech recognition
    if (MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)) {
      options = { mimeType: AUDIO_MIME_TYPE };
      console.log(`Using supported MIME type: ${AUDIO_MIME_TYPE}`);
    } else {
      console.warn(`${AUDIO_MIME_TYPE} is not supported, using default`);
    }
    
    // Create media recorder
    const mediaRecorder = new MediaRecorder(stream, options);
    
    // Set up data handler
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        console.log("Voice data chunk received, size:", event.data.size, "type:", event.data.type);
        setAudioChunks(prev => [...prev, event.data]);
        setHasRecordingStarted(true);
      } else {
        console.log("Empty audio chunk received");
      }
    };
    
    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      toast({
        title: "Recording Error",
        description: "An error occurred while recording audio.",
        variant: "destructive"
      });
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
      console.log("Media recorder started with MIME type:", mediaRecorder.mimeType);
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
      // Get MIME type from the first chunk or use a fallback
      const mimeType = audioChunks[0].type || AUDIO_MIME_TYPE;
      console.log(`Creating audio blob with MIME type: ${mimeType}`);
      
      return new Blob(audioChunks, { type: mimeType });
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
