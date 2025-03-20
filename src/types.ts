
export interface NutritionalInfo {
  name: string;
  calories: string;
  carbs: string;
  details: string;
}

export interface Message {
  text: string;
  type: 'user' | 'assistant';
  nutritionalInfo?: NutritionalInfo;
  timestamp: number;
  isNew?: boolean;
}
