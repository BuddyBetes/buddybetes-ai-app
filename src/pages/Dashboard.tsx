
import React from 'react';
import Layout from '../components/Layout';
import GlucoseChart from '../components/GlucoseChart';
import { useLogContext } from '../context/LogContext';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const Dashboard = () => {
  const { logs, getRecentLogs, getAverageGlucose } = useLogContext();
  const recentLogs = getRecentLogs(5);
  const averageGlucose = getAverageGlucose();
  
  const lastReading = recentLogs[0]?.glucoseLevel || 0;
  const isInRange = lastReading >= 70 && lastReading <= 180;
  
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

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28">
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
              Last updated: {recentLogs[0]?.timestamp.toLocaleTimeString()}
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
              <span className="text-xl font-bold text-gray-800">{averageGlucose}</span>
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
            <span className="text-xl font-bold text-gray-800">{logs.length}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Glucose Trend</h3>
            <button className="text-buddy-600 text-sm font-medium flex items-center">
              View All <ArrowUpRight size={14} className="ml-1" />
            </button>
          </div>
          <GlucoseChart data={recentLogs} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl bg-white shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">AI Insights</h3>
          <div className="space-y-4">
            <div className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
              <div className="pt-1">
                <Activity className="h-5 w-5 text-buddy-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Your glucose has been mostly stable today. Nice job maintaining balanced levels!
                </p>
              </div>
            </div>
            <div className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
              <div className="pt-1">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Consider having a small protein-rich snack before bed to prevent overnight drops.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
