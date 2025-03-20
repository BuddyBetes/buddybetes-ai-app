
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
  const audioChunksRef = useRef<Blob[]>([]);
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        recorder.onstart = () => {
          console.log("Voice recording started");
          if (mounted) {
            setAudioChunks([]);
            audioChunksRef.current = [];
          }
        };
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            console.log(`Voice data chunk received: ${e.data.size} bytes`);
            if (mounted) {
              audioChunksRef.current = [...audioChunksRef.current, e.data];
              setAudioChunks(prev => [...prev, e.data]);
            }
          } else {
            console.log("Empty data chunk received, ignoring");
          }
        };
        
        recorder.onstop = async () => {
          console.log("Voice recording stopped");
          if (!mounted) return;
          
          const chunks = audioChunksRef.current;
          console.log(`Total audio chunks collected: ${chunks.length}`);
          
          if (chunks.length > 0) {
            setIsProcessing(true);
            console.log(`Processing audio... Total size: ${chunks.reduce((acc, chunk) => acc + chunk.size, 0)} bytes`);
            
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            console.log(`Created audio blob, size: ${audioBlob.size} bytes`);
            
            if (audioBlob.size < 100) {
              console.log("Audio blob too small, likely no speech detected");
              setIsProcessing(false);
              toast({
                title: "No Audio Detected",
                description: "We couldn't detect any speech. Please try again and speak clearly.",
                variant: "destructive"
              });
              return;
            }
            
            await processAudio(audioBlob);
          } else {
            console.log("❌ No audio chunks received, skipping processing");
            setIsProcessing(false);
            toast({
              title: "Recording Failed",
              description: "No audio was captured. Please check your microphone and try again.",
              variant: "destructive"
            });
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
      // Set a timeslice to get data chunks while recording (every 1 second)
      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log("Started recording audio");
    } else {
      console.log("MediaRecorder not ready or already recording", mediaRecorder?.state);
      toast({
        title: "Recording Not Available",
        description: "The microphone isn't ready. Please refresh the page and try again.",
        variant: "warning"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("Stopped recording audio");
    } else {
      console.log("MediaRecorder not recording", mediaRecorder?.state);
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
            console.log(`Audio converted to base64, length: ${base64Audio.length} characters`);
            
            if (!base64Audio || base64Audio.length < 100) {
              console.log("Base64 audio data too small or empty");
              setIsProcessing(false);
              toast({
                title: "Recording Too Short",
                description: "The recording was too short. Please try again and speak longer.",
                variant: "destructive"
              });
              return resolve(false);
            }
            
            // Send to speech-to-text function
            console.log("📤 SENDING AUDIO to speech-to-text function");
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });
            
            console.log("📥 RECEIVED RESPONSE from speech-to-text function:", data);
            
            if (error) {
              console.error("❌ Speech-to-text error:", error);
              setIsProcessing(false);
              toast({
                title: "Processing Error",
                description: error.message || "Failed to process speech",
                variant: "destructive"
              });
              return resolve(false);
            }
            
            if (data && data.text) {
              console.log("🎯 TRANSCRIBED TEXT:", data.text);
              // Call the callback with the transcribed text
              onSpeechResult(data.text);
              
              // Wait a moment before switching from processing to allow for AI response
              setTimeout(() => {
                setIsProcessing(false);
              }, 500);
              return resolve(true);
            } else {
              console.log("❌ No transcription received from speech-to-text function");
              console.log("Raw response data:", JSON.stringify(data));
              setIsProcessing(false);
              toast({
                title: "No Speech Detected",
                description: "We couldn't detect any speech in your recording.",
                variant: "destructive"
              });
              return resolve(false);
            }
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
