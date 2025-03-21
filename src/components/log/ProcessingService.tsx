
import React, { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLogContext } from '@/context/LogContext';

interface ProcessingServiceProps {
  scanMode: 'food' | 'meter';
  capturedImage: string | null;
  setProcessingImage: (isProcessing: boolean) => void;
  onProcessingComplete: () => void;
}

const ProcessingService: React.FC<ProcessingServiceProps> = ({
  scanMode,
  capturedImage,
  setProcessingImage,
  onProcessingComplete
}) => {
  const { toast } = useToast();
  const { addLog } = useLogContext();
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  React.useEffect(() => {
    // Only process when there's a captured image
    if (!capturedImage) return;
    
    setProcessingImage(true);
    
    // Show processing toast
    if (scanMode === 'food') {
      toast({
        title: "Food scan complete",
        description: "Processing food image...",
      });
      
      // Simulate food recognition (in a real app, this would call an API)
      processingTimeoutRef.current = setTimeout(async () => {
        setProcessingImage(false);
        
        toast({
          title: "Food recognized",
          description: "Detected: Apple (15g carbs). Adding to your log entry.",
        });
        
        // Add food data to logs - fixed to match GlucoseLog type
        await addLog({
          timestamp: new Date(),
          glucoseLevel: 0, // Setting a default value since it's required by the type
          food: "Apple",
          notes: "Estimated: 15g carbs, 95 calories"
        });
        
        onProcessingComplete();
      }, 1500);
    } else {
      toast({
        title: "Meter scan complete",
        description: "Processing glucose reading...",
      });
      
      // Simulate OCR for glucose reading (in a real app, this would call an API)
      processingTimeoutRef.current = setTimeout(async () => {
        setProcessingImage(false);
        
        // Detected glucose value
        const glucoseValue = 118;
        
        toast({
          title: "Reading detected",
          description: `Glucose reading: ${glucoseValue} mg/dL. Adding to your log entry.`,
        });
        
        // Add the glucose reading to logs
        await addLog({
          timestamp: new Date(),
          glucoseLevel: glucoseValue,
          mealContext: 'fasting',
        });
        
        onProcessingComplete();
      }, 1500);
    }
    
    // Clean up timeouts when component unmounts
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    };
  }, [capturedImage, scanMode, toast, addLog, setProcessingImage, onProcessingComplete]);
  
  return null; // This is a service component with no UI
};

export default ProcessingService;
