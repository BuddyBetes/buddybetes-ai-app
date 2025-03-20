
import React, { useState } from 'react';
import Layout from '../components/Layout';
import LogForm from '../components/LogForm';
import { Camera, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/hooks/use-toast';
import { useLogContext } from '@/context/LogContext';
import { processSpeechFromBlob } from '@/utils/speechProcessing';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { extractGlucoseInfo } from '@/utils/voiceParser';

const AddLog = () => {
  const { toast } = useToast();
  const { addLog } = useLogContext();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isRecording: micRecording,
    startRecording,
    stopRecording: captureStop,
    getAudioBlob,
    stopMediaTracks
  } = useAudioCapture();

  const handleScanFood = () => {
    toast({
      title: "Opening camera",
      description: "Starting food scanning process. Please allow camera access.",
    });
    
    // Check if the device has a camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera not available",
        description: "Your device doesn't support camera access or permission was denied.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would open the camera here
    // For now, we'll just simulate the process
    setTimeout(() => {
      toast({
        title: "Food recognized",
        description: "Detected: Apple (15g carbs). Adding to your log entry.",
      });
      
      // Here you would update the form with the detected food
      // For now this is just a demonstration
    }, 2000);
  };

  const handleScanMeter = () => {
    toast({
      title: "Opening camera",
      description: "Please align your glucose meter display in the frame.",
    });
    
    // Check if the device has a camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Camera not available",
        description: "Your device doesn't support camera access or permission was denied.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would open the camera here and do OCR
    // For now, we'll just simulate the process
    setTimeout(() => {
      toast({
        title: "Reading detected",
        description: "Glucose reading: 118 mg/dL. Adding to your log entry.",
      });
      
      // Here you would update the form with the detected glucose reading
      // For now this is just a demonstration
    }, 2000);
  };

  const stopRecording = async () => {
    if (!micRecording) return;
    
    setIsProcessing(true);
    captureStop();
    
    const audioBlob = getAudioBlob();
    if (audioBlob) {
      try {
        await processSpeech(audioBlob);
      } catch (error) {
        console.error("Error processing speech:", error);
        toast({
          title: "Error",
          description: "Failed to process your voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    stopMediaTracks();
    setIsRecording(false);
    setIsProcessing(false);
  };

  const processSpeech = async (audioBlob: Blob) => {
    return new Promise<void>((resolve, reject) => {
      processSpeechFromBlob(
        audioBlob, 
        {
          onSpeechResult: (text) => {
            console.log("Speech recognized:", text);
            
            // Extract glucose information from the text
            const glucoseInfo = extractGlucoseInfo(text);
            
            if (glucoseInfo && glucoseInfo.glucoseLevel) {
              toast({
                title: "Voice log detected",
                description: `Glucose level: ${glucoseInfo.glucoseLevel} mg/dL. Adding to your log.`,
              });
              
              // Create the log entry
              const newLog = {
                timestamp: new Date(),
                glucoseLevel: glucoseInfo.glucoseLevel,
                food: glucoseInfo.food || "",
                mealContext: glucoseInfo.mealContext || "after",
                notes: glucoseInfo.notes || `Voice log: "${text}"`,
              };
              
              // Add the log
              addLog(newLog);
              
              resolve();
            } else {
              toast({
                title: "Voice log incomplete",
                description: "Could not detect glucose level from your voice input. Please try again or use the form.",
                variant: "destructive",
              });
              reject(new Error("No glucose data detected"));
            }
          },
          onProcessingStateChange: (isProcessing) => {
            setIsProcessing(isProcessing);
          }
        }
      );
    });
  };

  const handleVoiceLog = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      setIsRecording(true);
      try {
        await startRecording();
        toast({
          title: "Recording started",
          description: "Speak your glucose reading, e.g., 'My glucose is 120'",
        });
      } catch (error) {
        console.error("Failed to start recording:", error);
        setIsRecording(false);
        toast({
          title: "Microphone access failed",
          description: "Could not access your microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout title="Add Glucose Log">
      <AppHeader />
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center space-x-4 mb-6 mt-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
            onClick={handleScanFood}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-1">
              <Camera size={20} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Scan Food</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
            onClick={handleScanMeter}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
              <Camera size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Scan Meter</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center ${isRecording ? 'animate-pulse' : ''}`}
            onClick={handleVoiceLog}
          >
            <div className={`w-12 h-12 rounded-full ${isRecording ? 'bg-red-100' : 'bg-buddy-100'} flex items-center justify-center mb-1`}>
              <Mic size={20} className={`${isRecording ? 'text-red-600' : 'text-buddy-600'}`} />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {isRecording ? 'Stop Recording' : 'Voice Log'}
            </span>
          </motion.button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <LogForm />
        </motion.div>
      </div>
    </Layout>
  );
};

export default AddLog;
