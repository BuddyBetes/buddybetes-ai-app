
import React from 'react';
import { motion } from 'framer-motion';
import { NutritionalInfo, GlucoseStats, TrendAnalysis } from '@/types';
import NutritionalCard from './NutritionalCard';
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';

interface MessageBubbleProps {
  text: string;
  type: 'user' | 'assistant';
  nutritionalInfo?: NutritionalInfo;
  stats?: GlucoseStats;
  trendAnalysis?: TrendAnalysis;
  isNew?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  text, 
  type, 
  nutritionalInfo,
  stats,
  trendAnalysis,
  isNew = false
}) => {
  return (
    <div className="space-y-2 w-full">
      <motion.div
        className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
        initial={isNew ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {type === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-[#35cab4] mr-2 flex-shrink-0 self-end flex items-center justify-center">
            <span className="text-xs font-bold text-white">BB</span>
          </div>
        )}
        
        <div
          className={`max-w-[80%] rounded-3xl py-2.5 px-3.5 ${
            type === 'user'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-[#35cab4] text-white'
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
      
      {stats && type === 'assistant' && (
        <div className="ml-10 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-2 text-gray-700 flex items-center">
            <Activity size={14} className="mr-1 text-buddy-500" />
            Glucose Statistics
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Average:</span> {stats.average} mg/dL
            </div>
            <div>
              <span className="text-gray-500">Min/Max:</span> {stats.min}/{stats.max} mg/dL
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Time in Range:</span> {stats.inRangePercent}% (70-140 mg/dL)
            </div>
          </div>
        </div>
      )}
      
      {trendAnalysis && type === 'assistant' && (
        <div className="ml-10 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium mb-2 text-gray-700 flex items-center">
            {trendAnalysis.direction === 'increasing' ? (
              <TrendingUp size={14} className="mr-1 text-orange-500" />
            ) : trendAnalysis.direction === 'decreasing' ? (
              <TrendingDown size={14} className="mr-1 text-green-500" />
            ) : (
              <ArrowRight size={14} className="mr-1 text-blue-500" />
            )}
            Glucose Trend Analysis
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-gray-500">Direction:</span> {trendAnalysis.direction.charAt(0).toUpperCase() + trendAnalysis.direction.slice(1)}
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Change:</span>
              <span>{trendAnalysis.firstHalfAvg} mg/dL</span>
              <ArrowRight size={14} className="mx-1" />
              <span>{trendAnalysis.secondHalfAvg} mg/dL</span>
              <span className="ml-1 text-gray-500">({trendAnalysis.magnitude} mg/dL)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
