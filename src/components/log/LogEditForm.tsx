import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { useLogContext } from '@/context/LogContext';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import { format } from 'date-fns';

interface LogEditFormProps {
  log: GlucoseLog;
  onCancel: () => void;
  onComplete: () => void;
}

const LogEditForm: React.FC<LogEditFormProps> = ({ log, onCancel, onComplete }) => {
  const { updateLog } = useLogContext();
  const { glucoseUnit } = useGlucoseUnit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Convert glucose value for display if needed
  const displayGlucoseValue = log.glucoseLevel && glucoseUnit === 'mmol/L' 
    ? convertGlucoseValue(log.glucoseLevel, 'mg/dL', 'mmol/L').toString()
    : log.glucoseLevel?.toString() || '';

  const [formData, setFormData] = useState({
    glucoseLevel: displayGlucoseValue,
    food: log.food || '',
    mealContext: log.mealContext || 'before',
    calories: log.calories?.toString() || '',
    protein: log.protein?.toString() || '',
    carbs: log.carbs?.toString() || '',
    fat: log.fat?.toString() || '',
    notes: log.notes || '',
    date: format(log.timestamp, 'yyyy-MM-dd'),
    time: format(log.timestamp, 'HH:mm')
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealContextChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      mealContext: value as 'before' | 'after' | 'fasting' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a date object from the date and time inputs
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Month is 0-indexed in JavaScript Date
      const timestamp = new Date(year, month - 1, day, hours, minutes);
      
      // Convert glucose level if needed
      let numericGlucoseLevel: number | undefined = undefined;
      
      if (formData.glucoseLevel) {
        numericGlucoseLevel = parseFloat(formData.glucoseLevel);
        
        // Convert from mmol/L to mg/dL if necessary for storage
        if (glucoseUnit === 'mmol/L' && !isNaN(numericGlucoseLevel)) {
          numericGlucoseLevel = convertGlucoseValue(
            numericGlucoseLevel,
            'mmol/L',
            'mg/dL'
          );
        }
      }
      
      const updatedLog: GlucoseLog = {
        ...log,
        timestamp,
        glucoseLevel: isNaN(numericGlucoseLevel!) ? undefined : numericGlucoseLevel,
        food: formData.food.trim() || undefined,
        mealContext: formData.mealContext as 'before' | 'after' | 'fasting',
        calories: formData.calories ? Number(formData.calories) : undefined,
        protein: formData.protein ? Number(formData.protein) : undefined,
        carbs: formData.carbs ? Number(formData.carbs) : undefined,
        fat: formData.fat ? Number(formData.fat) : undefined,
        notes: formData.notes.trim() || undefined,
      };
      
      await updateLog(updatedLog);
      onComplete();
    } catch (error) {
      console.error('Error updating log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="glucoseLevel">Glucose Level ({glucoseUnit})</Label>
            <Input
              id="glucoseLevel"
              name="glucoseLevel"
              type="text"
              value={formData.glucoseLevel}
              onChange={handleInputChange}
              placeholder={`Enter glucose level in ${glucoseUnit}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="food">Food</Label>
            <Input
              id="food"
              name="food"
              value={formData.food}
              onChange={handleInputChange}
              placeholder="What did you eat?"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Nutritional Information</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="calories" className="text-sm">Calories</Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="kcal"
                  min="0"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="protein" className="text-sm">Protein (g)</Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  value={formData.protein}
                  onChange={handleInputChange}
                  placeholder="g"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="carbs" className="text-sm">Carbs (g)</Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  value={formData.carbs}
                  onChange={handleInputChange}
                  placeholder="g"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fat" className="text-sm">Fat (g)</Label>
                <Input
                  id="fat"
                  name="fat"
                  type="number"
                  value={formData.fat}
                  onChange={handleInputChange}
                  placeholder="g"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Meal Context</Label>
            <RadioGroup 
              value={formData.mealContext} 
              onValueChange={handleMealContextChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="before" id="before" />
                <Label htmlFor="before" className="text-sm">Before meal</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after" className="text-sm">After meal</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="fasting" id="fasting" />
                <Label htmlFor="fasting" className="text-sm">Fasting</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 mb-10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default LogEditForm;
