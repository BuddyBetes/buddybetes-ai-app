
import React from 'react';
import { motion } from 'framer-motion';
import { NutritionalInfo } from '@/types';
import NutritionalCard from './NutritionalCard';

interface MessageBubbleProps {
  text: string;
  type: 'user' | 'assistant';
  nutritionalInfo?: NutritionalInfo;
  isNew?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  text, 
  type, 
  nutritionalInfo,
  isNew = false
}) => {
  return (
    <div className="space-y-2">
      <motion.div
        className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}
        initial={isNew ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`max-w-[80%] rounded-xl p-3 ${
            type === 'user'
              ? 'bg-buddy-500 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          {text}
        </div>
      </motion.div>
      
      {nutritionalInfo && (
        <NutritionalCard 
          name={nutritionalInfo.name} 
          details={nutritionalInfo.details} 
        />
      )}
    </div>
  );
};

export default MessageBubble;
