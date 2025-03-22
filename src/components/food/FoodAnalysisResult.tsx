
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

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
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-buddy-500 animate-spin mb-4" />
            <p className="text-center text-gray-600">Analyzing your food image...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-center text-red-500 mb-4">{error}</p>
            <Button onClick={onCancel} variant="outline">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
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
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Food Name</label>
                    <Input 
                      value={item.name} 
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium block mb-1">Carbs (g)</label>
                      <Input 
                        type="number" 
                        value={item.carbs} 
                        onChange={(e) => handleItemChange(index, 'carbs', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Protein (g)</label>
                      <Input 
                        type="number" 
                        value={item.protein} 
                        onChange={(e) => handleItemChange(index, 'protein', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Fat (g)</label>
                      <Input 
                        type="number" 
                        value={item.fat} 
                        onChange={(e) => handleItemChange(index, 'fat', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Calories</label>
                      <Input 
                        type="number" 
                        value={item.calories} 
                        onChange={(e) => handleItemChange(index, 'calories', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSaveEdit} 
                    size="sm" 
                    className="w-full mt-2"
                  >
                    <Check className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleEdit(index)}
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
