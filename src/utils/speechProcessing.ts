
import { useToast } from '@/hooks/use-toast';
import { blobToBase64, convertSpeechToText } from '@/services/speechServices';

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
    // Validate audio blob
    if (!audioBlob || audioBlob.size < 100) {
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
    
    try {
      // Process speech using the API service
      const result = await convertSpeechToText(base64Audio);
      
      if (result && result.text) {
        onSpeechResult(result.text);
      } else {
        toast.toast({
          title: "Empty Transcription",
          description: "We couldn't transcribe your speech. Please try again and speak clearly.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
      }
    } catch (apiError) {
      console.error("Speech-to-text API error:", apiError);
      toast.toast({
        title: "Transcription Error",
        description: "Error processing your speech. Please try again.",
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
