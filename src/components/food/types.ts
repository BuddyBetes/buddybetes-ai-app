
export interface FoodItem {
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  // FatSecret specific fields
  food_id?: string | number;
  serving_id?: string | number;
  serving_description?: string;
}
