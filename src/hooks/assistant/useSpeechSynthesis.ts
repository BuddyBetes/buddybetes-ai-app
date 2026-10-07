import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { browserTextToSpeech } from '@/services/browserSpeechServices';
import {
  playAudioSrc,
  playNotificationChime,
  stopAudio,
  unlockAudio,
} from '@/utils/audioUnlock';

export const useSpeechSynthesis = () => {
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const { toast } = useToast();

  // No local Audio element and no mount-time init: playback goes through the
  // shared singleton in utils/audioUnlock, which is the only element iOS has
  // seen inside a user gesture.

  const playResponseAudio = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    // Cheap no-op if a tap already unlocked us. Covers the case where this is
    // reached from a gesture that did not call unlockAudio itself.
    await unlockAudio();

    setIsPlayingResponse(true);
    const truncatedText = text.substring(0, 1000);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: truncatedText,
          voice: 'nova',
        },
      });

      if (error) throw new Error(error.message || "Failed to generate speech");
      if (!data) throw new Error("No data received from text-to-speech function");
      if (data.error) throw new Error(data.error);
      if (!data.audioContent) throw new Error("No audio content received");

      // Always use the MIME type the function returns. Gemini TTS is WAV,
      // not MP3, and iOS is strict about the data URI declaring it correctly.
      const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioContent}`;

      await playAudioSrc(audioSrc, {
        onEnded: () => {
          setIsPlayingResponse(false);
          playNotificationChime();
        },
        onError: (event) => {
          console.error("TTS audio playback error:", event);
          setIsPlayingResponse(false);
          toast({
            title: "Audio Playback Error",
            description: "Failed to play assistant's response",
            variant: "destructive",
          });
        },
      });
    } catch (edgeFunctionError) {
      console.error("TTS failed, falling back to browser speech:", edgeFunctionError);

      const browserTtsResult = await browserTextToSpeech(truncatedText);
      setIsPlayingResponse(false);

      if (!browserTtsResult) {
        toast({
          title: "Audio Playback Error",
          description: "Could not play audio response using any method",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const stopResponseAudio = useCallback(() => {
    stopAudio();
    setIsPlayingResponse(false);
  }, []);

  return {
    isPlayingResponse,
    playResponseAudio,
    stopResponseAudio,
  };
};