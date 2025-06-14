
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InsightCard from '@/components/insights/InsightCard';

interface InsightsSectionProps {
  allInsights: string[];
  isLoading: boolean;
  refreshInsights: () => void;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({
  allInsights,
  isLoading,
  refreshInsights
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-5 rounded-xl bg-white shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Enhanced AI Insights</h3>
        <div className="mb-4">
          {isLoading ? null : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refreshInsights}
            >
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      <Alert variant="default" className="mb-4 bg-gray-50 border-gray-200">
        <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
        <AlertDescription className="text-xs text-gray-600">
          These insights are AI-generated based on your glucose, meal, and exercise data. Always consult healthcare professionals for medical decisions.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-buddy-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          allInsights.map((insight, index) => (
            <InsightCard 
              key={index} 
              insight={insight} 
              index={index}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default InsightsSection;
