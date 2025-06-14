
import React from 'react';
import { Activity, Utensils, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface InsightCardProps {
  insight: string;
  index: number;
  category?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index, category }) => {
  // Determine category and icon based on insight content
  const getInsightCategory = (text: string): { category: string; icon: React.ReactNode; color: string } => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('eat') || 
        lowerText.includes('breakfast') || lowerText.includes('lunch') || lowerText.includes('dinner') ||
        lowerText.includes('carb') || lowerText.includes('sugar') || lowerText.includes('rice') ||
        lowerText.includes('pagkain') || lowerText.includes('kain')) {
      return {
        category: 'Diet',
        icon: <Utensils className="h-4 w-4" />,
        color: 'text-orange-600 bg-orange-100'
      };
    }
    
    if (lowerText.includes('exercise') || lowerText.includes('walk') || lowerText.includes('activity') ||
        lowerText.includes('gym') || lowerText.includes('run') || lowerText.includes('physical') ||
        lowerText.includes('ehersisyo') || lowerText.includes('lakad')) {
      return {
        category: 'Exercise',
        icon: <Activity className="h-4 w-4" />,
        color: 'text-green-600 bg-green-100'
      };
    }
    
    if (lowerText.includes('morning') || lowerText.includes('evening') || lowerText.includes('time') ||
        lowerText.includes('bedtime') || lowerText.includes('schedule') || lowerText.includes('timing') ||
        lowerText.includes('umaga') || lowerText.includes('gabi') || lowerText.includes('oras')) {
      return {
        category: 'Timing',
        icon: <Clock className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-100'
      };
    }
    
    if (lowerText.includes('trend') || lowerText.includes('pattern') || lowerText.includes('improving') ||
        lowerText.includes('stable') || lowerText.includes('consistent') || lowerText.includes('average') ||
        lowerText.includes('range') || lowerText.includes('control')) {
      return {
        category: 'Trends',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-100'
      };
    }
    
    return {
      category: 'General',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-buddy-600 bg-buddy-100'
    };
  };

  const { category: detectedCategory, icon, color } = getInsightCategory(insight);

  return (
    <div className="flex space-x-3 bg-gray-50 p-4 rounded-lg border-l-4 border-gray-200 hover:border-buddy-300 transition-colors">
      <div className={`p-2 rounded-full ${color} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
            {detectedCategory}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {insight}
        </p>
      </div>
    </div>
  );
};

export default InsightCard;
