
import React, { useState, useEffect } from 'react';
import { useLogContext } from '../context/LogContext';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import GlucoseLevelField from './form/GlucoseLevelField';
import MealContextField from './form/MealContextField';
import FoodField from './form/FoodField';
import NotesField from './form/NotesField';
import SubmitButton from './form/SubmitButton';

interface LogFormProps {
  onLogAdded?: () => void;
  initialGlucoseLevel?: number | null;
}

const LogForm: React.FC<LogFormProps> = ({ onLogAdded, initialGlucoseLevel }) => {
  const { addLog, isLoading } = useLogContext();
  const { toast } = useToast();
  const { glucoseUnit } = useGlucoseUnit();
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [food, setFood] = useState('');
  const [mealContext, setMealContext] = useState<'before' | 'after' | 'fasting'>('before');
  const [notes, setNotes] = useState('');

  // Set initial glucose level if provided
  useEffect(() => {
    if (initialGlucoseLevel) {
      setGlucoseLevel(initialGlucoseLevel.toString());
    }
  }, [initialGlucoseLevel]);

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
      food: food.trim() || undefined,
      mealContext,
      notes: notes.trim() || undefined,
    };
    
    await addLog(newLog);
    
    // Reset form
    setGlucoseLevel('');
    setFood('');
    setMealContext('before');
    setNotes('');
    
    // Navigate to logs page via callback if provided
    if (onLogAdded) {
      onLogAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-700 mb-2">Add Log Details</h3>
      </div>
      
      <GlucoseLevelField
        value={glucoseLevel}
        onChange={setGlucoseLevel}
        disabled={isLoading}
      />
      
      <MealContextField
        value={mealContext}
        onChange={setMealContext}
        disabled={isLoading}
      />
      
      <FoodField
        value={food}
        onChange={setFood}
        disabled={isLoading}
      />
      
      <NotesField
        value={notes}
        onChange={setNotes}
        disabled={isLoading}
      />
      
      <SubmitButton loading={isLoading} />
    </form>
  );
};

export default LogForm;
