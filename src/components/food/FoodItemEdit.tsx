
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { FoodItem } from './types';

interface FoodItemEditProps {
  item: FoodItem;
  onChange: (field: keyof FoodItem, value: string) => void;
  onSave: () => void;
}

const FoodItemEdit: React.FC<FoodItemEditProps> = ({ 
  item, 
  onChange,
  onSave
}) => {
  // Helper function to handle numeric input and round up carbs
  const handleNumericChange = (field: keyof FoodItem, value: string) => {
    // Process the value for carbs to round up to the nearest whole number
    if (field === 'carbs' && value !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Round up carbs to whole number
        const roundedValue = Math.ceil(numValue).toString();
        onChange(field, roundedValue);
        return;
      }
    }
    
    // For other fields or invalid carb values, pass through
    onChange(field, value);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium block mb-1">Food Name</label>
        <Input 
          value={item.name} 
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>
      
      {item.serving_description && (
        <div>
          <label className="text-sm font-medium block mb-1">Serving</label>
          <Input 
            value={item.serving_description} 
            onChange={(e) => onChange('serving_description', e.target.value)}
          />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium block mb-1">Carbs (g)</label>
          <Input 
            type="number" 
            value={item.carbs} 
            onChange={(e) => handleNumericChange('carbs', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Protein (g)</label>
          <Input 
            type="number" 
            value={item.protein} 
            onChange={(e) => onChange('protein', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Fat (g)</label>
          <Input 
            type="number" 
            value={item.fat} 
            onChange={(e) => onChange('fat', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Calories</label>
          <Input 
            type="number" 
            value={item.calories} 
            onChange={(e) => onChange('calories', e.target.value)}
          />
        </div>
      </div>
      <Button 
        onClick={onSave} 
        size="sm" 
        className="w-full mt-2"
      >
        <Check className="h-4 w-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
};

export default FoodItemEdit;
