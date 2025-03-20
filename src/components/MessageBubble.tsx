
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
        {type === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-[#FFD872] mr-2 flex-shrink-0 self-end"></div>
        )}
        
        <div
          className={`max-w-[80%] rounded-3xl py-3 px-4 ${
            type === 'user'
              ? 'bg-[#35cab4] text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {text}
        </div>
        
        {type === 'user' && (
          <div className="w-8 h-8 rounded-full bg-gray-200 ml-2 flex-shrink-0 self-end overflow-hidden">
            <img src="/placeholder.svg" alt="User" className="w-full h-full object-cover" />
          </div>
        )}
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
