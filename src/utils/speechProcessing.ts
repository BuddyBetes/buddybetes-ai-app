
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
    
    // Enhanced logging for audio format
    const originalMimeType = audioBlob.type;
    console.log("Original MIME type:", originalMimeType);
    
    // Check support for Whisper API formats
    const supportedFormats = [
      'audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 
      'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 
      'audio/wav', 'audio/webm'
    ];
    
    // Check if format is directly supported
    const isDirectlySupported = supportedFormats.some(format => 
      originalMimeType.includes(format));
    
    console.log("Format directly supported by Whisper API:", isDirectlySupported);
    
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
      
      // Validate base64 format
      const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(base64Audio);
      if (!isValidBase64) {
        console.error("Invalid base64 format");
        toast({
          title: "Processing Error",
          description: "Audio conversion failed. Please try again.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
        return;
      }
      
      console.log("✅ Valid base64 data, sending to speech-to-text service");
      
      // Add explicit information about the mime type
      const payload = { 
        audio: base64Audio,
        language: 'en',
        mimeType: originalMimeType
      };
      
      console.log("Sending to speech-to-text function with payload:", {
        audioLength: payload.audio.length,
        mimeType: payload.mimeType
      });
      
      // Process speech using the API service
      const result = await convertSpeechToText(base64Audio, payload.mimeType);
      
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
