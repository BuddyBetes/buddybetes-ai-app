
import React, { useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  onPlaybackStateChange: (isPlaying: boolean) => void;
}

const AudioPlayer = ({ onPlaybackStateChange }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Initialize audio element for TTS
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Set up event listeners for the audio element
    if (audioRef.current) {
      audioRef.current.onplay = () => {
        console.log("Audio playback started");
        onPlaybackStateChange(true);
      };
      
      audioRef.current.onended = () => {
        console.log("Audio playback finished");
        onPlaybackStateChange(false);
      };
      
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        onPlaybackStateChange(false);
        toast({
          title: "Audio Playback Error",
          description: "Failed to play audio response",
          variant: "destructive"
        });
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onPlaybackStateChange, toast]);

  const playResponseAudio = async (text: string) => {
    try {
      console.log("Converting AI response to speech:", text.substring(0, 50) + "...");
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        console.error("Text-to-speech error:", error);
        throw new Error(error.message);
      }
      
      if (data.audioContent && audioRef.current) {
        console.log("Text-to-speech response received, playing audio...");
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error("Play method error:", error);
          onPlaybackStateChange(false);
          toast({
            title: "Audio Playback Error",
            description: "Browser blocked autoplay. Click again to try.",
            variant: "destructive"
          });
        }
      } else {
        console.log("No audio content received from text-to-speech function");
        onPlaybackStateChange(false);
        toast({
          title: "Text-to-Speech Error",
          description: "Failed to generate audio from text",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("TTS error:", error);
      onPlaybackStateChange(false);
      toast({
        title: "Audio Playback Error",
        description: error instanceof Error ? error.message : "Failed to play audio response",
        variant: "destructive"
      });
    }
  };

  return {
    audioRef,
    playResponseAudio
  };
};

export default AudioPlayer;
