
import { useEffect } from 'react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { processSpeechFromBlob } from '@/utils/speechProcessing';

// Defining clear interfaces for the component props
interface AudioRecorderProps {
  onSpeechResult: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

interface AudioRecorderState {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

/**
 * Hook that combines audio capture with speech processing
 */
const useAudioRecorder = ({ 
  onSpeechResult, 
  onProcessingStateChange 
}: AudioRecorderProps): AudioRecorderState => {
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
      onProcessingStateChange(true);
      await processSpeechFromBlob(
        audioBlob, 
        { onSpeechResult, onProcessingStateChange }
      );
    } else {
      console.log("No audio to process");
      onProcessingStateChange(false);
    }
    
    // Clean up media tracks
    stopMediaTracks();
  };

  return {
    isRecording,
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
