
import { toast } from '@/hooks/use-toast';
import { blobToBase64 } from '@/services/speech/speechUtils';
import { convertSpeechToText } from '@/services/speechServices';

export interface SpeechProcessingOptions {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

export const processSpeechFromBlob = async (
  audioBlob: Blob, 
  options: SpeechProcessingOptions
): Promise<void> => {
  const { onSpeechResult, onProcessingStateChange } = options;

  try {
    // Validate audio blob
    if (!audioBlob || audioBlob.size < 100) {
      console.log("Audio blob too small, likely no speech detected");
      onProcessingStateChange(false);
      toast({
        title: "No Speech Detected",
        description: "We couldn't detect any speech. Please try again and speak clearly.",
        variant: "destructive"
      });
      return;
    }

    console.log("Processing audio blob of size:", audioBlob.size, "bytes");
    console.log("Audio blob type:", audioBlob.type);
    
    // Check if the audio format is supported by Whisper API
    const supportedFormats = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mpga', 'audio/m4a', 'audio/flac'];
    const audioType = audioBlob.type.split(';')[0]; // Get base MIME type without codec info
    
    if (!supportedFormats.some(format => audioType.includes(format))) {
      console.warn(`Audio format ${audioBlob.type} may not be supported by Whisper API. Supported formats: webm, ogg, wav, mp3, etc.`);
    }
    
    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      console.log("Audio converted to base64, length:", base64Audio.length);
      
      if (!base64Audio || base64Audio.length < 100) {
        console.error("Base64 conversion failed or resulted in invalid data");
        toast({
          title: "Processing Error",
          description: "Failed to process audio. Please try again.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
        return;
      }
      
      // Process speech using the API service
      const result = await convertSpeechToText(base64Audio);
      
      if (result && result.text) {
        onSpeechResult(result.text);
      } else {
        toast({
          title: "Empty Transcription",
          description: "We couldn't transcribe your speech. Please try again and speak clearly.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
      }
    } catch (apiError) {
      console.error("Speech-to-text API error:", apiError);
      toast({
        title: "Transcription Error",
        description: "Error processing your speech. Please try again.",
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
