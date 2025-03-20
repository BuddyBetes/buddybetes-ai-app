
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

const AudioRecorder = ({ onSpeechResult, onProcessingStateChange }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

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

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setAudioChunks([]);
      setHasRecordingStarted(false);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
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

  const stopRecording = async () => {
    console.log("Stopping recording...");
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log("Voice recording stopped");
      setIsRecording(false);
      
      // Check if we've collected any audio chunks
      if (audioChunks.length === 0 || !hasRecordingStarted) {
        console.log("No audio chunks collected");
        onProcessingStateChange(false);
        toast({
          title: "No Audio Detected",
          description: "We couldn't detect any audio. Please try again and speak clearly.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Process the collected audio chunks
        onProcessingStateChange(true);
        
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log("Created audio blob, size:", audioBlob.size);
        
        if (audioBlob.size < 100) {
          console.log("Audio blob too small, likely no speech detected");
          onProcessingStateChange(false);
          toast({
            title: "No Speech Detected",
            description: "We couldn't detect any speech. Please try again and speak clearly.",
            variant: "destructive"
          });
          return;
        }
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            // Remove the data URL prefix
            const base64Audio = base64data.split(',')[1];
            console.log("Audio converted to base64, length:", base64Audio.length);
            
            // Send to Supabase Function
            console.log("Sending audio to speech-to-text function...");
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });
            
            if (error) {
              console.error("Speech-to-text function error:", error);
              toast({
                title: "Transcription Error",
                description: "Error processing your speech. Please try again.",
                variant: "destructive"
              });
              onProcessingStateChange(false);
              return;
            }
            
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
          } catch (error) {
            console.error("Error processing audio:", error);
            toast({
              title: "Processing Error",
              description: "Error processing your audio. Please try again.",
              variant: "destructive"
            });
            onProcessingStateChange(false);
          }
        };
      } catch (error) {
        console.error("Error in stopRecording:", error);
        onProcessingStateChange(false);
        toast({
          title: "Processing Error",
          description: "Error processing your recording. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      console.log("Not recording or MediaRecorder not initialized");
      onProcessingStateChange(false);
    }
    
    // Clean up media tracks
    stopMediaTracks();
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

export default AudioRecorder;
