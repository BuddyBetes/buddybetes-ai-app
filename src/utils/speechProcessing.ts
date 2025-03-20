
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
    
    // Detailed information about the blob for debugging
    const audioType = audioBlob.type.split(';')[0]; // Get base MIME type without codec info
    console.log("Audio base type:", audioType);
    
    // Check if the audio format is supported by Whisper API
    const supportedFormats = ['audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];
    
    // Log detailed information about the audio format
    if (audioBlob.type.includes('codecs')) {
      console.log(`Audio format includes codec information: ${audioBlob.type}`);
    }
    
    let isSupported = false;
    for (const format of supportedFormats) {
      if (audioType.includes(format) || format.includes(audioType)) {
        isSupported = true;
        console.log(`Audio format ${audioBlob.type} matches supported format ${format}`);
        break;
      }
    }
    
    if (!isSupported) {
      console.warn(`Audio format ${audioBlob.type} may not be supported by Whisper API.`);
      console.log(`Supported formats: ${supportedFormats.join(', ')}`);
      // Continue anyway, the edge function will try to normalize the format
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
      
      // Check if base64 is valid
      const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(base64Audio);
      console.log("Is valid base64:", isValidBase64);
      
      if (!isValidBase64) {
        console.error("Generated base64 is not valid");
        toast({
          title: "Processing Error",
          description: "Audio conversion failed. Please try again.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
        return;
      }
      
      // Add explicit information about the mime type if available
      const payload: any = { 
        audio: base64Audio,
        language: 'en'
      };
      
      // Include original MIME type for the edge function to handle properly
      if (audioBlob.type) {
        payload.mimeType = audioBlob.type;
      }
      
      console.log("Sending to speech-to-text function with payload:", {
        audioLength: payload.audio.length,
        mimeType: payload.mimeType || 'not specified'
      });
      
      // Process speech using the API service with enhanced payload
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
