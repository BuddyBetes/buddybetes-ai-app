
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { FoodItem } from './types';

interface FoodItemCardProps {
  item: FoodItem;
  onEdit: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onEdit }) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{item.name}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-amber-50">
          {item.carbs}g carbs
        </Badge>
        <Badge variant="outline" className="bg-blue-50">
          {item.protein}g protein
        </Badge>
        <Badge variant="outline" className="bg-red-50">
          {item.fat}g fat
        </Badge>
        <Badge variant="outline" className="bg-gray-100">
          {item.calories} cal
        </Badge>
      </div>
    </div>
  );
};

export default FoodItemCard;
