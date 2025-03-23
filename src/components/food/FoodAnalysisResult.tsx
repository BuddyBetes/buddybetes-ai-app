
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoodItem } from './types';
import FoodItemCard from './FoodItemCard';
import FoodItemEdit from './FoodItemEdit';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import NoFoodState from './NoFoodState';

interface FoodAnalysisResultProps {
  isLoading: boolean;
  error?: string;
  foodItems: FoodItem[];
  onSave: (items: FoodItem[]) => void;
  onCancel: () => void;
}

const FoodAnalysisResult: React.FC<FoodAnalysisResultProps> = ({
  isLoading,
  error,
  foodItems,
  onSave,
  onCancel
}) => {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editedItems, setEditedItems] = useState<FoodItem[]>(foodItems);

  const handleEdit = (index: number) => {
    setEditingItem(index);
  };

  const handleSaveEdit = () => {
    setEditingItem(null);
  };

  const handleItemChange = (index: number, field: keyof FoodItem, value: string) => {
    const newItems = [...editedItems];
    
    if (field === 'name') {
      newItems[index][field] = value;
    } else {
      // Convert to number for numeric fields
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        newItems[index][field] = numValue;
      }
    }
    
    setEditedItems(newItems);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onCancel} />;
  }

  // Handle the case when no food items were detected
  if (!foodItems || foodItems.length === 0) {
    return <NoFoodState onRetry={onCancel} />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Food Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {editedItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              {editingItem === index ? (
                <FoodItemEdit 
                  item={item}
                  onChange={(field, value) => handleItemChange(index, field, value)}
                  onSave={handleSaveEdit}
                />
              ) : (
                <FoodItemCard 
                  item={item} 
                  onEdit={() => handleEdit(index)} 
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(editedItems)} className="bg-buddy-500 hover:bg-buddy-600">
          Log Food
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FoodAnalysisResult;
