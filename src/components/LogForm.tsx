
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLogContext } from '../context/LogContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface LogFormProps {
  onLogAdded?: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ onLogAdded }) => {
  const { addLog, isLoading } = useLogContext();
  const { toast } = useToast();
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [food, setFood] = useState('');
  const [mealContext, setMealContext] = useState<'before' | 'after' | 'fasting'>('before');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!glucoseLevel && !food.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter either a glucose level or food information",
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
    
    const newLog = {
      timestamp: new Date(),
      glucoseLevel: glucoseLevel ? Number(glucoseLevel) : undefined,
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

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 12px rgba(94, 207, 185, 0.2)" },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-700 mb-2">Add Log Details</h3>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="glucoseLevel" className="text-sm">
          Glucose Level (mg/dL)
        </Label>
        <motion.div whileFocus="focus" variants={inputVariants}>
          <Input
            id="glucoseLevel"
            type="number"
            value={glucoseLevel}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            placeholder="Enter your glucose reading"
            className="h-11 text-base"
            disabled={isLoading}
          />
        </motion.div>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="mealContext" className="text-sm">
          When was this reading taken?
        </Label>
        <RadioGroup 
          value={mealContext} 
          onValueChange={(value) => setMealContext(value as 'before' | 'after' | 'fasting')}
          className="flex space-x-3"
          disabled={isLoading}
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
      
      <div className="space-y-1.5">
        <Label htmlFor="food" className="text-sm">
          Food (optional)
        </Label>
        <motion.div whileFocus="focus" variants={inputVariants}>
          <Input
            id="food"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="What did you eat?"
            className="h-11 text-base"
            disabled={isLoading}
          />
        </motion.div>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm">
          Notes (optional)
        </Label>
        <motion.div whileFocus="focus" variants={inputVariants}>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes"
            className="min-h-20 text-base"
            disabled={isLoading}
          />
        </motion.div>
      </div>
      
      <motion.div
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        <Button 
          type="submit" 
          className="w-full h-11 mt-2 text-base bg-buddy-500 hover:bg-buddy-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Log'
          )}
        </Button>
      </motion.div>
    </form>
  );
};

export default LogForm;
