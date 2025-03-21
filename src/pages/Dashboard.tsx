
import React, { useState } from 'react';
import Layout from '../components/Layout';
import GlucoseChart from '../components/GlucoseChart';
import { useLogContext } from '../context/LogContext';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useGlucoseInsights } from '@/hooks/useGlucoseInsights';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const { getGlucoseLogsOnly, getLogsForToday, getAverageGlucose } = useLogContext();
  const glucoseLogs = getGlucoseLogsOnly(30); // Only get logs with glucose values
  const { insights, stats, isLoading, refreshInsights } = useGlucoseInsights(timeRange);
  
  const navigate = useNavigate();
  
  // Use only logs with glucose readings for the last reading
  const lastReading = glucoseLogs[0]?.glucoseLevel || 0;
  const isInRange = lastReading >= 70 && lastReading <= 180;
  
  // Get count of logs today for the "Time in Range" card
  const logsToday = getLogsForToday().length;
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const navigateToLogs = () => {
    navigate('/logs');
  };

  const navigateToAssistant = () => {
    navigate('/assistant');
  };

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-5 pb-20">
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div 
            custom={0}
            variants={cardVariants}
            className="col-span-2 p-6 rounded-xl bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Glucose</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    {lastReading}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">mg/dL</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isInRange ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {isInRange ? 'In Range' : 'Out of Range'}
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              Last updated: {glucoseLogs[0]?.timestamp.toLocaleTimeString() || 'No readings'}
            </div>
          </motion.div>

          <motion.div 
            custom={1}
            variants={cardVariants}
            className="p-4 rounded-xl bg-white shadow-sm flex flex-col items-start"
          >
            <div className="p-2 rounded-lg bg-gray-100 mb-2">
              <Activity size={18} className="text-buddy-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Average</h3>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-gray-800">
                {stats?.average || getAverageGlucose()}
              </span>
              <span className="ml-1 text-xs text-gray-500">mg/dL</span>
            </div>
          </motion.div>

          <motion.div 
            custom={2}
            variants={cardVariants}
            className="p-4 rounded-xl bg-white shadow-sm flex flex-col items-start"
          >
            <div className="p-2 rounded-lg bg-gray-100 mb-2">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Logs Today</h3>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-gray-800">
                {logsToday}
              </span>
            </div>
          </motion.div>
        </motion.div>

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
              <TabsTrigger className="flex-1" value="24h">Last 24 Hours</TabsTrigger>
              <TabsTrigger className="flex-1" value="7d">Last 7 Days</TabsTrigger>
              <TabsTrigger className="flex-1" value="30d">Last 30 Days</TabsTrigger>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl bg-white shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">AI Insights</h3>
            <div className="flex space-x-2 mb-4">
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={navigateToAssistant}
              >
                Ask Assistant <ArrowUpRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
          
          <Alert variant="default" className="mb-4 bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
            <AlertDescription className="text-xs text-gray-600">
              These insights are generated by AI based on your glucose logs and may not always be medically accurate.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-buddy-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div key={index} className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
                  <div className="pt-1">
                    <Activity className={`h-5 w-5 ${index % 2 === 0 ? 'text-buddy-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      {insight}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
