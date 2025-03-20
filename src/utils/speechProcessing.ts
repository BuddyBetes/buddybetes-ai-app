
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpeechProcessingOptions {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

export const processSpeechFromBlob = async (
  audioBlob: Blob, 
  options: SpeechProcessingOptions
): Promise<void> => {
  const { onSpeechResult, onProcessingStateChange } = options;
  const toast = useToast();

  try {
    if (audioBlob.size < 100) {
      console.log("Audio blob too small, likely no speech detected");
      onProcessingStateChange(false);
      toast.toast({
        title: "No Speech Detected",
        description: "We couldn't detect any speech. Please try again and speak clearly.",
        variant: "destructive"
      });
      return;
    }

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    console.log("Audio converted to base64, length:", base64Audio.length);
    
    // Send to speech-to-text function
    console.log("Sending audio to speech-to-text function...");
    const { data, error } = await supabase.functions.invoke('speech-to-text', {
      body: { audio: base64Audio }
    });
    
    if (error) {
      console.error("Speech-to-text function error:", error);
      toast.toast({
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
      toast.toast({
        title: "Empty Transcription",
        description: "We couldn't transcribe your speech. Please try again and speak clearly.",
        variant: "destructive"
      });
      onProcessingStateChange(false);
    }
  } catch (error) {
    console.error("Error processing audio:", error);
    toast.toast({
      title: "Processing Error",
      description: "Error processing your audio. Please try again.",
      variant: "destructive"
    });
    onProcessingStateChange(false);
  }
};

// Helper function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        // Remove the data URL prefix
        const base64Audio = base64data.split(',')[1];
        resolve(base64Audio);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
