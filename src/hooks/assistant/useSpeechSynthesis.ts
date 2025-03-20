
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
      console.log("Playing response as audio:", text.substring(0, 50) + "...");
      setIsPlayingResponse(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        console.error("Text-to-speech error:", error);
        throw new Error(error.message);
      }
      
      if (data.audioContent && audioRef.current) {
        console.log("Received audio content, playing...");
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Audio play error:", error);
              setIsPlayingResponse(false);
              toast({
                title: "Audio Playback Error",
                description: "Browser blocked autoplay. Try again or click to enable audio.",
                variant: "destructive"
              });
            });
          }
        } catch (error) {
          console.error("Audio play method error:", error);
          setIsPlayingResponse(false);
          throw error;
        }
      } else {
        console.log("No audio content received or audio reference is null");
        setIsPlayingResponse(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlayingResponse(false);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play audio response",
        variant: "destructive"
      });
    }
  };

  return {
    isPlayingResponse,
    playResponseAudio
  };
};
