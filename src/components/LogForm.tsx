
import React, { useState, useEffect } from 'react';
import { useLogContext } from '../context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GlucoseLevelField from './form/GlucoseLevelField';
import MealContextField from './form/MealContextField';
import GlucoseMeasurementMethodField from './form/GlucoseMeasurementMethodField';
import FoodField from './form/FoodField';
import NutritionFields from './form/NutritionFields';
import NotesField from './form/NotesField';
import SubmitButton from './form/SubmitButton';

interface LogFormProps {
  onLogAdded?: () => void;
  initialGlucoseLevel?: number | null;
  initialNutritionData?: {
    calories?: number;
    protein?: number;
    carbs?: number;
  };
}

const LogForm: React.FC<LogFormProps> = ({ 
  onLogAdded, 
  initialGlucoseLevel,
  initialNutritionData 
}) => {
  const { addLog, isLoading } = useLogContext();
  const { toast } = useToast();
  const { glucoseUnit } = useGlucoseUnit();
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [mealContext, setMealContext] = useState<'before' | 'after' | 'fasting'>('before');
  const [glucoseMeasurementMethod, setGlucoseMeasurementMethod] = useState<'finger_prick' | 'cgm' | ''>('');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [notes, setNotes] = useState('');

  // Set initial glucose level if provided
  useEffect(() => {
    if (initialGlucoseLevel) {
      setGlucoseLevel(initialGlucoseLevel.toString());
    }
  }, [initialGlucoseLevel]);

  // Set initial nutrition data if provided
  useEffect(() => {
    if (initialNutritionData) {
      if (initialNutritionData.calories) {
        setCalories(initialNutritionData.calories.toString());
      }
      if (initialNutritionData.protein) {
        setProtein(initialNutritionData.protein.toString());
      }
      if (initialNutritionData.carbs) {
        setCarbs(initialNutritionData.carbs.toString());
      }
    }
  }, [initialNutritionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // At least one of glucose level or food must be entered
    if (!glucoseLevel && !food.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter either glucose level or food information",
        variant: "destructive",
      });
      return;
    }
    
    if (glucoseLevel && isNaN(Number(glucoseLevel))) {
      toast({
        title: "Invalid glucose level",
        description: "Please enter a valid number for glucose level",
        variant: "destructive",
      });
      return;
    }
    
    let numericGlucoseLevel: number | undefined = undefined;
    
    if (glucoseLevel) {
      numericGlucoseLevel = Number(glucoseLevel);
      
      // Convert from mmol/L to mg/dL if necessary for storage
      // (We always store as mg/dL in the database for consistency)
      if (glucoseUnit === 'mmol/L') {
        numericGlucoseLevel = convertGlucoseValue(
          numericGlucoseLevel,
          'mmol/L',
          'mg/dL'
        );
      }
    }
    
    const newLog = {
      timestamp: new Date(),
      glucoseLevel: numericGlucoseLevel,
      mealContext,
      glucoseMeasurementMethod: glucoseMeasurementMethod || undefined,
      food: food.trim() || undefined,
      calories: calories ? Number(calories) : undefined,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      notes: notes.trim() || undefined,
    };
    
    await addLog(newLog);
    
    // Reset form
    setGlucoseLevel('');
    setMealContext('before');
    setGlucoseMeasurementMethod('');
    setFood('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setNotes('');
    
    // Navigate to logs page via callback if provided
    if (onLogAdded) {
      onLogAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-700 mb-2">Add Log Details</h3>
      </div>
      
      {/* Glucose Information Card */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Glucose Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <GlucoseLevelField
            value={glucoseLevel}
            onChange={setGlucoseLevel}
            disabled={isLoading}
          />
          
          {glucoseLevel && (
            <>
              <MealContextField
                value={mealContext}
                onChange={setMealContext}
                disabled={isLoading}
              />
              
              <GlucoseMeasurementMethodField
                value={glucoseMeasurementMethod}
                onChange={setGlucoseMeasurementMethod}
                disabled={isLoading}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Food Information Card */}
      <Card className="bg-green-50/30 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Food Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FoodField
            value={food}
            onChange={setFood}
            disabled={isLoading}
          />
          
          {food.trim() && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-700">Nutritional Information (optional)</h4>
              <NutritionFields
                calories={calories}
                protein={protein}
                carbs={carbs}
                onCaloriesChange={setCalories}
                onProteinChange={setProtein}
                onCarbsChange={setCarbs}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Notes Card */}
      <Card className="bg-gray-50/30 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesField
            value={notes}
            onChange={setNotes}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
      
      <SubmitButton loading={isLoading} />
    </form>
  );
};

export default LogForm;
