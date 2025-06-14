
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlucoseChart from '../GlucoseChart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlucoseLog } from '@/context/LogContext';

interface GlucoseChartSectionProps {
  glucoseLogs: GlucoseLog[];
}

const GlucoseChartSection: React.FC<GlucoseChartSectionProps> = ({ glucoseLogs }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const navigate = useNavigate();
  
  const navigateToLogs = () => {
    navigate('/logs');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Glucose Trend</h3>
        <button 
          className="text-buddy-600 text-sm font-medium flex items-center"
          onClick={navigateToLogs}
        >
          View All <ArrowUpRight size={14} className="ml-1" />
        </button>
      </div>
      
      <Tabs 
        defaultValue="7d" 
        value={timeRange}
        onValueChange={(value) => setTimeRange(value as '24h' | '7d' | '30d')}
        className="w-full"
      >
        <TabsList className="w-full bg-gray-100 mb-1">
          <TabsTrigger className="flex-1 text-xs md:text-sm" value="24h">Last 24 Hours</TabsTrigger>
          <TabsTrigger className="flex-1 text-xs md:text-sm" value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger className="flex-1 text-xs md:text-sm" value="30d">Last 30 Days</TabsTrigger>
        </TabsList>
        
        <TabsContent value="24h" className="mt-0 pt-2">
          <GlucoseChart data={glucoseLogs} showControls={false} />
        </TabsContent>
        <TabsContent value="7d" className="mt-0 pt-2">
          <GlucoseChart data={glucoseLogs} showControls={false} />
        </TabsContent>
        <TabsContent value="30d" className="mt-0 pt-2">
          <GlucoseChart data={glucoseLogs} showControls={false} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default GlucoseChartSection;
