
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Scale, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';
import GlucoseLevelField from './form/GlucoseLevelField';
import FoodField from './form/FoodField';
import MealContextField from './form/MealContextField';
import GlucoseMeasurementMethodField from './form/GlucoseMeasurementMethodField';
import NutritionFields from './form/NutritionFields';
import NotesField from './form/NotesField';
import SubmitButton from './form/SubmitButton';

interface LogFormProps {
  onLogAdded?: () => void;
  initialGlucoseLevel?: number | null;
  initialFood?: string;
  initialCalories?: number;
  initialProtein?: number;
  initialCarbs?: number;
  initialFat?: number;
}

const LogForm: React.FC<LogFormProps> = ({
  onLogAdded,
  initialGlucoseLevel = null,
  initialFood = '',
  initialCalories = undefined,
  initialProtein = undefined,
  initialCarbs = undefined,
  initialFat = undefined
}) => {
  const { addLog, isLoading } = useLogContext();
  const { toast } = useToast();
  
  // Core log fields
  const [glucoseLevel, setGlucoseLevel] = useState<string>(
    initialGlucoseLevel ? initialGlucoseLevel.toString() : ''
  );
  const [food, setFood] = useState<string>(initialFood);
  const [mealContext, setMealContext] = useState<'before' | 'after' | 'fasting'>('before');
  const [measurementMethod, setMeasurementMethod] = useState<'finger_prick' | 'cgm'>('finger_prick');
  const [notes, setNotes] = useState<string>('');
  
  // Nutrition fields - always start as strings for controlled inputs
  const initialNutritionData = {
    calories: initialCalories?.toString() || '',
    protein: initialProtein?.toString() || '',
    carbs: initialCarbs?.toString() || '',
    fat: initialFat?.toString() || ''
  };
  
  const [nutritionData, setNutritionData] = useState(initialNutritionData);
  const [showNutrition, setShowNutrition] = useState(false);

  // Auto-show nutrition fields if we have initial nutrition data
  useEffect(() => {
    if (initialCalories || initialProtein || initialCarbs || initialFat) {
      setShowNutrition(true);
    }
  }, [initialCalories, initialProtein, initialCarbs, initialFat]);

  const updateNutritionField = (field: keyof typeof nutritionData, value: string) => {
    setNutritionData(prev => ({ ...prev, [field]: value }));
  };

  const hasValidData = glucoseLevel.trim() !== '' || food.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasValidData) {
      toast({
        title: "Missing data",
        description: "Please enter either a glucose level or food information",
        variant: "destructive",
      });
      return;
    }

    try {
      const numericGlucoseLevel = glucoseLevel ? parseFloat(glucoseLevel) : undefined;
      
      // Convert nutrition strings to numbers only if they have values
      const calories = nutritionData.calories ? parseFloat(nutritionData.calories) : undefined;
      const protein = nutritionData.protein ? parseFloat(nutritionData.protein) : undefined;
      const carbs = nutritionData.carbs ? parseFloat(nutritionData.carbs) : undefined;
      const fat = nutritionData.fat ? parseFloat(nutritionData.fat) : undefined;

      await addLog({
        timestamp: new Date(),
        glucoseLevel: isNaN(numericGlucoseLevel!) ? undefined : numericGlucoseLevel,
        food: food.trim() || undefined,
        mealContext,
        glucoseMeasurementMethod: numericGlucoseLevel ? measurementMethod : undefined,
        calories: isNaN(calories!) ? undefined : calories,
        protein: isNaN(protein!) ? undefined : protein,
        carbs: isNaN(carbs!) ? undefined : carbs,
        fat: isNaN(fat!) ? undefined : fat,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setGlucoseLevel('');
      setFood('');
      setMealContext('before');
      setMeasurementMethod('finger_prick');
      setNotes('');
      setNutritionData({ calories: '', protein: '', carbs: '', fat: '' });
      setShowNutrition(false);

      if (onLogAdded) {
        onLogAdded();
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <GlucoseLevelField
            value={glucoseLevel}
            onChange={setGlucoseLevel}
            disabled={isLoading}
          />

          <FoodField
            value={food}
            onChange={setFood}
            disabled={isLoading}
          />

          <MealContextField
            value={mealContext}
            onChange={setMealContext}
            disabled={isLoading}
          />

          {glucoseLevel && (
            <GlucoseMeasurementMethodField
              value={measurementMethod}
              onChange={setMeasurementMethod}
              disabled={isLoading}
            />
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNutrition(!showNutrition)}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Target className="h-4 w-4" />
                {showNutrition ? 'Hide' : 'Add'} Nutrition Info
              </Button>
            </div>

            <AnimatePresence>
              {showNutrition && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <NutritionFields
                    calories={nutritionData.calories}
                    protein={nutritionData.protein}
                    carbs={nutritionData.carbs}
                    fat={nutritionData.fat}
                    onCaloriesChange={(value) => updateNutritionField('calories', value)}
                    onProteinChange={(value) => updateNutritionField('protein', value)}
                    onCarbsChange={(value) => updateNutritionField('carbs', value)}
                    onFatChange={(value) => updateNutritionField('fat', value)}
                    disabled={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NotesField
            value={notes}
            onChange={setNotes}
            disabled={isLoading}
          />

          <SubmitButton
            hasValidData={hasValidData}
            isLoading={isLoading}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default LogForm;
