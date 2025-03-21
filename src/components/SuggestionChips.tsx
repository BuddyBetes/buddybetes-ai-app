
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SuggestionChipsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const suggestions = [
  "Analyze my glucose trends",
  "How's my glucose today?",
  "What should I eat for lunch?",
  "Effect of exercise on blood sugar?",
  "Why is my glucose high at night?",
  "Tips for lower glucose",
  "Explain my pattern",
];

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="overflow-x-auto flex space-x-2 scrollbar-hide -mx-1 px-1">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap rounded-full border-gray-200 hover:bg-gray-50 text-gray-700 px-4"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default SuggestionChips;
