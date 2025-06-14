
import React, { useState, useEffect, useMemo } from 'react';
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
import ExerciseField from './form/ExerciseField';
import MedicationField from './form/MedicationField';
import NotesField from './form/NotesField';
import SubmitButton from './form/SubmitButton';

interface LogFormProps {
  onLogAdded?: () => void;
  initialGlucoseLevel?: number | null;
  initialNutritionData?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
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
  
  // Form state declarations
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [mealContext, setMealContext] = useState<'before' | 'after' | 'fasting'>('before');
  const [glucoseMeasurementMethod, setGlucoseMeasurementMethod] = useState<'finger_prick' | 'cgm' | ''>('');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [exercise, setExercise] = useState('');
  const [medication, setMedication] = useState('');
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
      if (initialNutritionData.fat) {
        setFat(initialNutritionData.fat.toString());
      }
    }
  }, [initialNutritionData]);

  // Form validation logic
  const isFormValid = useMemo(() => {
    // Check if glucose level has a valid value
    const hasValidGlucose = glucoseLevel.trim() !== '' && !isNaN(Number(glucoseLevel));
    
    // Check if food field has content
    const hasFood = food.trim() !== '';
    
    // Check if exercise field has content
    const hasExercise = exercise.trim() !== '';
    
    // Check if medication field has content
    const hasMedication = medication.trim() !== '';
    
    // Check if notes field has content
    const hasNotes = notes.trim() !== '';
    
    // At least one meaningful field must be filled
    return hasValidGlucose || hasFood || hasExercise || hasMedication || hasNotes;
  }, [glucoseLevel, food, exercise, medication, notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!isFormValid) {
      toast({
        title: "Form incomplete",
        description: "Please fill in at least one field (glucose level, food, exercise, medication, or notes)",
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
      fat: fat ? Number(fat) : undefined,
      exercise: exercise.trim() || undefined,
      medication: medication.trim() || undefined,
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
    setFat('');
    setExercise('');
    setMedication('');
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
                fat={fat}
                onCaloriesChange={setCalories}
                onProteinChange={setProtein}
                onCarbsChange={setCarbs}
                onFatChange={setFat}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Activity/Exercise Card */}
      <Card className="bg-purple-50/30 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Activity/Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseField
            value={exercise}
            onChange={setExercise}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Medications Card */}
      <Card className="bg-amber-50/30 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MedicationField
            value={medication}
            onChange={setMedication}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Notes Card */}
      <Card className="bg-gray-50/30 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotesField
            value={notes}
            onChange={setNotes}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
      
      <SubmitButton loading={isLoading} disabled={!isFormValid} />
    </form>
  );
};

export default LogForm;
