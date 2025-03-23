
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
            onChange={(e) => onChange('carbs', e.target.value)}
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
