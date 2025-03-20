
import React, { useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  onPlaybackStateChange: (isPlaying: boolean) => void;
}

const AudioPlayer = ({ onPlaybackStateChange }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playResponseAudio = async (text: string) => {
    try {
      console.log("Converting AI response to speech:", text.substring(0, 50) + "...");
      onPlaybackStateChange(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: text }
      });
      
      if (error) {
        console.error("Text-to-speech error:", error);
        throw new Error(error.message);
      }
      
      if (data.audioContent) {
        console.log("Text-to-speech response received, playing audio...");
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
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
          
          try {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error("Audio play error:", error);
                onPlaybackStateChange(false);
                toast({
                  title: "Audio Playback Error",
                  description: "Browser blocked autoplay. Click to try again.",
                  variant: "destructive"
                });
              });
            }
          } catch (error) {
            console.error("Play method error:", error);
            onPlaybackStateChange(false);
          }
        } else {
          console.error("Audio reference is null");
          onPlaybackStateChange(false);
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
