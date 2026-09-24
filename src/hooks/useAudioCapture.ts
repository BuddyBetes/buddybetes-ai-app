import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMedia } from '@/utils/mediaPermissions';

// MediaRecorder configuration options
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Use a supported audio format that works well with the OpenAI Whisper / Gemini API
const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/wav',
  'audio/mp3'
];

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
   * Find the first supported MIME type for audio recording
   */
  const getSupportedMimeType = (): string | null => {
    for (const mimeType of PREFERRED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`Using supported MIME type: ${mimeType}`);
        return mimeType;
      }
    }
    console.warn('None of the preferred MIME types are supported, using browser default');
    return null;
  };

  /**
   * Request microphone access using getMedia helper
   */
  const initializeMicrophone = async (): Promise<MediaStream | null> => {
    if (!checkBrowserSupport()) {
      toast({
        title: "Recording Error",
        description: "Your browser does not support audio recording.",
        variant: "destructive"
      });
      return null;
    }
    
    // getMedia displays custom toast with "Open settings" button on Android when denied
    const stream = await getMedia('microphone', { 
      audio: AUDIO_CONSTRAINTS
    });
    
    if (stream) {
      console.log("Microphone access granted", stream);
    }
    return stream;
  };

  /**
   * Create and configure a MediaRecorder for the given stream
   */
  const initializeMediaRecorder = (stream: MediaStream): MediaRecorder => {
    const mimeType = getSupportedMimeType();
    const options = mimeType ? { mimeType } : {};
    console.log("Creating MediaRecorder with options:", options);
    
    const mediaRecorder = new MediaRecorder(stream, options);
    
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
   * Begins audio recording from the microphone (called only on user tap)
   */
  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setAudioChunks([]);
      setHasRecordingStarted(false);
      
      const stream = await initializeMicrophone();
      // If access was denied or no device exists, reset state and exit
      if (!stream) {
        setIsRecording(false);
        return;
      }
      
      streamRef.current = stream;
      const mediaRecorder = initializeMediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start(1000);
      console.log("Media recorder started with MIME type:", mediaRecorder.mimeType);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
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
      const mimeType = audioChunks[0].type || PREFERRED_MIME_TYPES[0];
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
