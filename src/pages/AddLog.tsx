
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import LogFormContainer from '@/components/log/LogFormContainer';
import CameraModal from '@/components/food/CameraModal';
import FoodAnalysisResult from '@/components/food/FoodAnalysisResult';
import { FoodItem } from '@/components/food/types';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { Button } from '@/components/ui/button';
import { Camera, Edit3 } from 'lucide-react';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

const AddLog: React.FC = () => {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showManualLog, setShowManualLog] = useState(false);
  const { analyzeImage, resetAnalysis, isAnalyzing, result, error } = useImageAnalysis();
  const { addLog } = useLogContext();
  const { toast } = useToast();

  const handleImageCapture = (imageData: string) => {
    console.log('AddLog: Image captured, showing results panel');
    setShowResults(true);
    
    // Wrap in setTimeout to ensure the UI updates before the potentially 
    // long-running analysis starts, preventing race conditions
    setTimeout(() => {
      analyzeImage(imageData);
    }, 50);
  };

  const handleSaveFood = async (foodItems: FoodItem[]) => {
    try {
      console.log('Saving food items to log:', foodItems);
      
      // Process food items to ensure carbs are rounded up to whole numbers
      const processedFoodItems = foodItems.map(item => ({
        ...item,
        carbs: Math.ceil(item.carbs), // Round up carbs to whole numbers
        protein: Math.round(item.protein),
        fat: Math.round(item.fat),
        calories: Math.round(item.calories)
      }));
      
      // Create a food log with the analyzed items
      await addLog({
        timestamp: new Date(),
        glucoseLevel: undefined, // Add this to match the type requirements
        food: processedFoodItems.map(item => item.name).join(', '),
        notes: `Carbs: ${processedFoodItems.reduce((sum, item) => sum + item.carbs, 0)}g, ` +
               `Protein: ${processedFoodItems.reduce((sum, item) => sum + item.protein, 0)}g, ` +
               `Fat: ${processedFoodItems.reduce((sum, item) => sum + item.fat, 0)}g, ` +
               `Calories: ${processedFoodItems.reduce((sum, item) => sum + item.calories, 0)}`
      });

      toast({
        title: "Food logged successfully",
        description: "Your food has been added to your logs",
      });

      // Reset UI state
      setShowResults(false);
      resetAnalysis();
      
      // Navigate to logs page after successful save
      navigate('/logs');
    } catch (err) {
      console.error('Error saving food log:', err);
      toast({
        title: "Error saving food log",
        description: "There was a problem saving your food log",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    console.log('Cancelling food analysis');
    setShowResults(false);
    resetAnalysis();
  };

  console.log("AddLog render state:", {
    showResults, 
    isAnalyzing, 
    error,
    resultExists: !!result,
    foodItems: result?.foodItems || []
  });

  return (
    <Layout title="Add Glucose Log">
      <AppHeader />
      <div className="space-y-6">
        {!showResults && !showManualLog && (
          <div className="flex flex-col items-center justify-center mt-6 space-y-4">
            <h2 className="text-lg font-medium text-center">How would you like to log?</h2>
            <div className="flex flex-col w-full max-w-md gap-3 px-4">
              <Button 
                onClick={() => setShowCamera(true)}
                className="bg-buddy-500 hover:bg-buddy-600 h-14 text-lg w-full flex justify-center items-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                Scan Food with Camera
              </Button>
              
              <Button 
                onClick={() => setShowManualLog(true)}
                variant="outline"
                className="h-14 text-lg w-full flex justify-center items-center border-buddy-300"
              >
                <Edit3 className="h-5 w-5 mr-2" />
                Log Manually
              </Button>
            </div>
          </div>
        )}
        
        {!showResults && showManualLog && (
          <LogFormContainer onLogAdded={() => navigate('/logs')} />
        )}
        
        {showResults && (
          <FoodAnalysisResult
            isLoading={isAnalyzing}
            error={error || undefined}
            foodItems={result?.foodItems || []}
            onSave={handleSaveFood}
            onCancel={handleCancel}
          />
        )}
      </div>

      <CameraModal
        open={showCamera}
        onOpenChange={setShowCamera}
        onImageCapture={handleImageCapture}
      />
    </Layout>
  );
};

export default AddLog;
