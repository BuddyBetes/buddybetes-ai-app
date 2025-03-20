
import { useEffect, useState } from 'react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { processSpeechFromBlob } from '@/utils/speechProcessing';
import { toast } from '@/hooks/use-toast';

// Defining clear interfaces for the component props
interface AudioRecorderProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

/**
 * Hook that combines audio capture with speech processing
 */
const useAudioRecorder = ({ 
  onSpeechResult, 
  onProcessingStateChange 
}: AudioRecorderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isRecording,
    startRecording: captureStart,
    stopRecording: captureStop,
    getAudioBlob,
    stopMediaTracks
  } = useAudioCapture();

  // Handle the stop recording and process audio flow
  const stopRecording = async () => {
    // First stop the actual recording
    captureStop();
    
    // Get the audio blob
    const audioBlob = getAudioBlob();
    
    // If we have valid audio data, process it
    if (audioBlob) {
      setIsProcessing(true);
      onProcessingStateChange(true);
      
      try {
        await processSpeechFromBlob(
          audioBlob, 
          { onSpeechResult, onProcessingStateChange }
        );
      } catch (error) {
        console.error("Error processing speech:", error);
        toast({
          title: "Processing Error",
          description: "An error occurred while processing your speech.",
          variant: "destructive"
        });
        onProcessingStateChange(false);
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log("No audio to process");
      onProcessingStateChange(false);
    }
    
    // Clean up media tracks
    stopMediaTracks();
  };

  return {
    isRecording,
    isProcessing,
    startRecording: captureStart,
    stopRecording
  };
};

/**
 * Main component that exports the hook functionality
 */
const AudioRecorder = (props: AudioRecorderProps) => {
  return useAudioRecorder(props);
};

export default AudioRecorder;
