
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

const AudioRecorder = ({ onSpeechResult, onProcessingStateChange }: AudioRecorderProps) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Effect to propagate processing state changes
  useEffect(() => {
    onProcessingStateChange(isProcessing);
  }, [isProcessing, onProcessingStateChange]);

  // Initialize media recorder
  useEffect(() => {
    let mounted = true;
    
    const initializeRecorder = async () => {
      try {
        console.log("Initializing voice recorder...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.onstart = () => {
          console.log("Voice recording started");
          if (mounted) setAudioChunks([]);
        };
        
        recorder.ondataavailable = (e) => {
          console.log("Voice data chunk received");
          if (mounted) setAudioChunks(chunks => [...chunks, e.data]);
        };
        
        recorder.onstop = async () => {
          console.log("Voice recording stopped");
          if (!mounted) return;
          
          if (audioChunks.length > 0) {
            setIsProcessing(true);
            console.log("Processing audio...");
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await processAudio(audioBlob);
          }
        };
        
        if (mounted) setMediaRecorder(recorder);
        console.log("Voice recorder initialized successfully");
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

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
      setIsRecording(true);
      console.log("Started recording audio");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("Stopped recording audio");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log("Converting audio blob to base64...");
      // Convert blob to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            console.log("Audio converted to base64, sending to speech-to-text function...");
            
            // Send to speech-to-text function
            console.log("📤 SENDING AUDIO to speech-to-text function");
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });
            
            console.log("📥 RECEIVED RESPONSE from speech-to-text function:", data);
            
            if (error) {
              console.error("❌ Speech-to-text error:", error);
              setIsProcessing(false);
              throw new Error(error.message);
            }
            
            if (data && data.text) {
              console.log("🎯 TRANSCRIBED TEXT:", data.text);
              console.log("Speech recognition successful, passing text to handler...");
              // Call the callback with the transcribed text
              onSpeechResult(data.text);
              
              // Wait a moment before switching from processing to allow for AI response
              setTimeout(() => {
                setIsProcessing(false);
              }, 500);
            } else {
              console.log("❌ No transcription received from speech-to-text function");
              console.log("Raw response data:", JSON.stringify(data));
              setIsProcessing(false);
              toast({
                title: "No Speech Detected",
                description: "We couldn't detect any speech in your recording.",
                variant: "destructive"
              });
            }
            
            resolve(true);
          } catch (error) {
            console.error("❌ Processing error:", error);
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
          console.error("File reader error:", error);
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

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

export default AudioRecorder;
