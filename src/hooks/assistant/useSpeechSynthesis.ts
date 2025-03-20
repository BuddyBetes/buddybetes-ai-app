
import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export const useSpeechSynthesis = () => {
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Initialize audio element for TTS
  useEffect(() => {
    console.log("Initializing audio player for TTS");
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      console.log("TTS audio playback finished");
      setIsPlayingResponse(false);
    };
    audioRef.current.onerror = (e) => {
      console.error("TTS audio playback error:", e);
      setIsPlayingResponse(false);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play assistant's response",
        variant: "destructive"
      });
    };
    
    return () => {
      if (audioRef.current) {
        console.log("Cleaning up audio player");
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [toast]);
  
  const playResponseAudio = async (text: string) => {
    try {
      if (!text || text.trim().length === 0) {
        console.log("Empty text provided, skipping TTS");
        return;
      }
      
      console.log("Playing response as audio:", text.substring(0, 50) + "...");
      setIsPlayingResponse(true);
      
      // Limit text length to prevent overloading the API
      const truncatedText = text.substring(0, 1000);
      
      // Add a delay to ensure any previous audio processing is completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: truncatedText }
      });
      
      if (error) {
        console.error("Text-to-speech error:", error);
        throw new Error(error.message || "Failed to generate speech");
      }
      
      if (!data) {
        console.error("No data received from text-to-speech function");
        throw new Error("No data received from text-to-speech function");
      }
      
      if (data.error) {
        console.error("Text-to-speech function returned error:", data.error);
        throw new Error(data.error);
      }
      
      if (data.audioContent && audioRef.current) {
        console.log("Received audio content, playing...");
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          console.error("Audio play method error:", error);
          setIsPlayingResponse(false);
          toast({
            title: "Audio Playback Error",
            description: "Browser blocked autoplay. Try again or click to enable audio.",
            variant: "destructive"
          });
        }
      } else {
        console.log("No audio content received or audio reference is null");
        setIsPlayingResponse(false);
        // Still consider this "completed" even though no audio played
        return;
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingResponse(false);
      toast({
        title: "Audio Playback Error",
        description: error instanceof Error ? error.message : "Failed to play audio response",
        variant: "destructive"
      });
      
      // Consider the operation completed even on error
      return;
    }
  };

  return {
    isPlayingResponse,
    playResponseAudio
  };
};
