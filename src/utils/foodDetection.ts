
/**
 * Detects if the input contains a food-related query
 * and extracts potential food items.
 */
export const detectFoodQuery = (input: string): string | null => {
  const foodKeywords = [
    'food', 'eat', 'eating', 'meal', 'snack', 'breakfast', 'lunch', 'dinner',
    'fruit', 'vegetable', 'carbs', 'protein', 'fat', 'diet', 'nutrition',
    'apple', 'banana', 'rice', 'pasta', 'bread', 'meat', 'chicken', 'beef',
    'pork', 'fish', 'dairy', 'cheese', 'yogurt', 'milk'
  ];
  
  const words = input.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    if (foodKeywords.includes(word)) {
      // Extract potential food items
      const foodRegex = /(?:can I eat|about|is|are|have|eating|food|nutrition info on|carbs in|calories in|about)\s+([a-zA-Z\s]+)(?:\?|$)/i;
      const match = input.match(foodRegex);
      if (match && match[1]) {
        return match[1].trim();
      }
      return null;
    }
  }
  
  return null;
};
