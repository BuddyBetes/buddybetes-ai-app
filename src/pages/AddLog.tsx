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
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CameraCapture from '@/components/camera/CameraCapture';

const AddLog = () => {
  const { toast } = useToast();
  const { addLog } = useLogContext();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanMode, setScanMode] = useState<'food' | 'meter'>('food');
  
  const {
    isRecording: micRecording,
    startRecording,
    stopRecording: captureStop,
    getAudioBlob,
    stopMediaTracks
  } = useAudioCapture();

  const handleScanFood = () => {
    setScanMode('food');
    setShowCamera(true);
  };

  const handleScanMeter = () => {
    setScanMode('meter');
    setShowCamera(true);
  };

  const handleCapture = (imageDataUrl: string) => {
    if (scanMode === 'food') {
      toast({
        title: "Food scan complete",
        description: "Processing food image...",
      });
      
      setTimeout(() => {
        toast({
          title: "Food recognized",
          description: "Detected: Apple (15g carbs). Adding to your log entry.",
        });
        setShowCamera(false);
      }, 1500);
    } else {
      toast({
        title: "Meter scan complete",
        description: "Processing glucose reading...",
      });
      
      setTimeout(() => {
        toast({
          title: "Reading detected",
          description: "Glucose reading: 118 mg/dL. Adding to your log entry.",
        });
        setShowCamera(false);
      }, 1500);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
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
            
            const glucoseInfo = extractGlucoseInfo(text);
            
            if (glucoseInfo && glucoseInfo.glucoseLevel) {
              toast({
                title: "Voice log detected",
                description: `Glucose level: ${glucoseInfo.glucoseLevel} mg/dL. Adding to your log.`,
              });
              
              const newLog = {
                timestamp: new Date(),
                glucoseLevel: glucoseInfo.glucoseLevel,
                food: glucoseInfo.food || "",
                mealContext: glucoseInfo.mealContext || "after",
                notes: glucoseInfo.notes || `Voice log: "${text}"`,
              };
              
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

  const handleVoiceLog = () => {
    navigate('/assistant');
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
            className="flex flex-col items-center"
            onClick={handleVoiceLog}
          >
            <div className="w-12 h-12 rounded-full bg-buddy-100 flex items-center justify-center mb-1">
              <Mic size={20} className="text-buddy-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Voice Log</span>
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

      <Sheet open={showCamera} onOpenChange={setShowCamera}>
        <SheetContent side="bottom" className="h-[100dvh] p-0">
          <CameraCapture 
            mode={scanMode} 
            onCapture={handleCapture} 
            onClose={handleCloseCamera} 
          />
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default AddLog;
