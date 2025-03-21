
import React, { useRef, useEffect } from 'react';
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
  
  useEffect(() => {
    // Only process when there's a captured image
    if (!capturedImage) return;
    
    console.log(`Starting ${scanMode} processing`);
    setProcessingImage(true);
    
    // Simulate processing with different results based on scan mode
    if (scanMode === 'food') {
      // Simulate food recognition (in a real app, this would call an API)
      processingTimeoutRef.current = setTimeout(async () => {
        try {
          // Simulate random food items for demo
          const foodItems = [
            { name: "Apple", carbs: 15, calories: 95 },
            { name: "Banana", carbs: 27, calories: 105 },
            { name: "Orange", carbs: 12, calories: 62 },
            { name: "Yogurt", carbs: 17, calories: 150 },
            { name: "Sandwich", carbs: 28, calories: 350 }
          ];
          
          // Randomly select a food item
          const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
          
          toast({
            title: "Food recognized",
            description: `Detected: ${randomFood.name} (${randomFood.carbs}g carbs, ${randomFood.calories} calories)`,
            duration: 5000,
          });
          
          // Add food data to logs
          await addLog({
            timestamp: new Date(),
            glucoseLevel: 0, // Default value since it's required
            food: randomFood.name,
            notes: `Estimated: ${randomFood.carbs}g carbs, ${randomFood.calories} calories`
          });
          
          setProcessingImage(false);
          onProcessingComplete();
          console.log('Food processing complete');
        } catch (error) {
          console.error('Error during food processing:', error);
          toast({
            title: "Processing failed",
            description: "Could not process food image. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
          setProcessingImage(false);
        }
      }, 2000);
    } else {
      // Simulate OCR for glucose reading
      processingTimeoutRef.current = setTimeout(async () => {
        try {
          // Generate a realistic glucose value
          const glucoseBase = 100;
          const variation = Math.floor(Math.random() * 80) - 30; // -30 to +50
          const glucoseValue = glucoseBase + variation;
          
          toast({
            title: "Reading detected",
            description: `Glucose reading: ${glucoseValue} mg/dL. Adding to your log entry.`,
            duration: 5000,
          });
          
          // Add the glucose reading to logs
          await addLog({
            timestamp: new Date(),
            glucoseLevel: glucoseValue,
            mealContext: 'fasting', // Default context
            notes: "Scanned from meter"
          });
          
          setProcessingImage(false);
          onProcessingComplete();
          console.log('Meter processing complete');
        } catch (error) {
          console.error('Error during meter processing:', error);
          toast({
            title: "Processing failed",
            description: "Could not process meter image. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
          setProcessingImage(false);
        }
      }, 2000);
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
