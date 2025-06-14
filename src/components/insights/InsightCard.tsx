
import React from 'react';
import { Activity, Utensils, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface InsightCardProps {
  insight: string;
  index: number;
  category?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index, category }) => {
  // Determine category and icon based on insight content
  const getInsightCategory = (text: string): { category: string; icon: React.ReactNode; iconColor: string; badgeStyle: string } => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('meal') || lowerText.includes('food') || lowerText.includes('eat') || 
        lowerText.includes('breakfast') || lowerText.includes('lunch') || lowerText.includes('dinner') ||
        lowerText.includes('carb') || lowerText.includes('sugar') || lowerText.includes('rice') ||
        lowerText.includes('pagkain') || lowerText.includes('kain')) {
      return {
        category: 'Diet',
        icon: <Utensils className="h-4 w-4" />,
        iconColor: 'bg-orange-500 text-white',
        badgeStyle: 'bg-orange-50 text-orange-700 border border-orange-200'
      };
    }
    
    if (lowerText.includes('exercise') || lowerText.includes('walk') || lowerText.includes('activity') ||
        lowerText.includes('gym') || lowerText.includes('run') || lowerText.includes('physical') ||
        lowerText.includes('ehersisyo') || lowerText.includes('lakad')) {
      return {
        category: 'Exercise',
        icon: <Activity className="h-4 w-4" />,
        iconColor: 'bg-green-500 text-white',
        badgeStyle: 'bg-green-50 text-green-700 border border-green-200'
      };
    }
    
    if (lowerText.includes('morning') || lowerText.includes('evening') || lowerText.includes('time') ||
        lowerText.includes('bedtime') || lowerText.includes('schedule') || lowerText.includes('timing') ||
        lowerText.includes('umaga') || lowerText.includes('gabi') || lowerText.includes('oras')) {
      return {
        category: 'Timing',
        icon: <Clock className="h-4 w-4" />,
        iconColor: 'bg-blue-500 text-white',
        badgeStyle: 'bg-blue-50 text-blue-700 border border-blue-200'
      };
    }
    
    if (lowerText.includes('trend') || lowerText.includes('pattern') || lowerText.includes('improving') ||
        lowerText.includes('stable') || lowerText.includes('consistent') || lowerText.includes('average') ||
        lowerText.includes('range') || lowerText.includes('control')) {
      return {
        category: 'Trends',
        icon: <TrendingUp className="h-4 w-4" />,
        iconColor: 'bg-purple-500 text-white',
        badgeStyle: 'bg-purple-50 text-purple-700 border border-purple-200'
      };
    }
    
    return {
      category: 'General',
      icon: <AlertCircle className="h-4 w-4" />,
      iconColor: 'bg-buddy-500 text-white',
      badgeStyle: 'bg-buddy-50 text-buddy-700 border border-buddy-200'
    };
  };

  const { category: detectedCategory, icon, iconColor, badgeStyle } = getInsightCategory(insight);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-start space-x-3">
        {/* Icon container - separate from badge styling */}
        <div className={`p-2.5 rounded-full flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category badge - separate styling */}
          <div className="mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle}`}>
              {detectedCategory}
            </span>
          </div>
          
          {/* Insight text */}
          <p className="text-sm text-gray-800 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
