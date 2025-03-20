
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Defining clear interfaces for the component props and audio state
interface AudioRecorderProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

interface AudioRecorderState {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

// MediaRecorder configuration options
const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Split out into a custom hook to separate concerns
const useAudioRecorder = ({ 
  onSpeechResult, 
  onProcessingStateChange 
}: AudioRecorderProps): AudioRecorderState => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Clean up media resources
  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Initialize media recorder and start capturing audio
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
      handleRecordingError(error);
    }
  };

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

  const handleRecordingError = (error: unknown) => {
    console.error("Error starting recording:", error);
    toast({
      title: "Recording Error",
      description: "Could not access microphone. Please check permissions.",
      variant: "destructive"
    });
  };

  // Stop recording and process audio
  const stopRecording = async () => {
    console.log("Stopping recording...");
    
    if (!isRecordingActive()) {
      console.log("Not recording or MediaRecorder not initialized");
      onProcessingStateChange(false);
      return;
    }
    
    stopMediaRecorder();
    
    if (!hasValidAudioData()) {
      handleNoAudioDetected();
      return;
    }
    
    await processAudioData();
    
    // Clean up media tracks
    stopMediaTracks();
  };

  const isRecordingActive = (): boolean => {
    return mediaRecorderRef.current !== null && isRecording;
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      console.log("Voice recording stopped");
      setIsRecording(false);
    }
  };

  const hasValidAudioData = (): boolean => {
    return audioChunks.length > 0 && hasRecordingStarted;
  };

  const handleNoAudioDetected = () => {
    console.log("No audio chunks collected");
    onProcessingStateChange(false);
    toast({
      title: "No Audio Detected",
      description: "We couldn't detect any audio. Please try again and speak clearly.",
      variant: "destructive"
    });
  };

  const processAudioData = async () => {
    try {
      onProcessingStateChange(true);
      
      // Create a blob from the audio chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      console.log("Created audio blob, size:", audioBlob.size);
      
      if (audioBlob.size < 100) {
        handleSmallAudioBlob();
        return;
      }
      
      await convertAndSendAudio(audioBlob);
      
    } catch (error) {
      handleProcessingError(error);
    }
  };

  const handleSmallAudioBlob = () => {
    console.log("Audio blob too small, likely no speech detected");
    onProcessingStateChange(false);
    toast({
      title: "No Speech Detected",
      description: "We couldn't detect any speech. Please try again and speak clearly.",
      variant: "destructive"
    });
  };

  const convertAndSendAudio = async (audioBlob: Blob) => {
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    
    reader.onloadend = async () => {
      try {
        const base64data = reader.result as string;
        // Remove the data URL prefix
        const base64Audio = base64data.split(',')[1];
        console.log("Audio converted to base64, length:", base64Audio.length);
        
        await sendAudioForTranscription(base64Audio);
        
      } catch (error) {
        handleProcessingError(error);
      }
    };
  };

  const sendAudioForTranscription = async (base64Audio: string) => {
    console.log("Sending audio to speech-to-text function...");
    const { data, error } = await supabase.functions.invoke('speech-to-text', {
      body: { audio: base64Audio }
    });
    
    if (error) {
      console.error("Speech-to-text function error:", error);
      handleTranscriptionError();
      return;
    }
    
    handleTranscriptionResult(data);
  };

  const handleTranscriptionResult = (data: any) => {
    if (data && data.text) {
      console.log("Speech transcription result:", data.text);
      onSpeechResult(data.text);
    } else {
      console.log("No text returned from speech-to-text");
      toast({
        title: "Empty Transcription",
        description: "We couldn't transcribe your speech. Please try again and speak clearly.",
        variant: "destructive"
      });
      onProcessingStateChange(false);
    }
  };

  const handleTranscriptionError = () => {
    toast({
      title: "Transcription Error",
      description: "Error processing your speech. Please try again.",
      variant: "destructive"
    });
    onProcessingStateChange(false);
  };

  const handleProcessingError = (error: unknown) => {
    console.error("Error processing audio:", error);
    toast({
      title: "Processing Error",
      description: "Error processing your audio. Please try again.",
      variant: "destructive"
    });
    onProcessingStateChange(false);
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

// Main component that exports the hook functionality
const AudioRecorder = (props: AudioRecorderProps) => {
  return useAudioRecorder(props);
};

export default AudioRecorder;
