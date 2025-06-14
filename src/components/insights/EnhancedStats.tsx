
import React from 'react';
import { Activity, Target, TrendingUp, Utensils } from 'lucide-react';

interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRangePercent: number;
  totalReadings?: number;
  mealsLogged?: number;
  exerciseEntries?: number;
}

interface EnhancedStatsProps {
  stats: GlucoseStats;
  glucoseUnit: string;
}

const EnhancedStats: React.FC<EnhancedStatsProps> = ({ stats, glucoseUnit }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-white p-3 rounded-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-1">
          <Activity className="h-4 w-4 text-buddy-600" />
          <span className="text-xs font-medium text-gray-600">Avg Glucose</span>
        </div>
        <div className="text-lg font-bold text-gray-800">
          {stats.average} <span className="text-xs text-gray-500">{glucoseUnit}</span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-1">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-gray-600">In Range</span>
        </div>
        <div className="text-lg font-bold text-gray-800">
          {stats.inRangePercent}%
        </div>
      </div>

      {stats.mealsLogged !== undefined && (
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <Utensils className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">Meals Logged</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {stats.mealsLogged}
          </div>
        </div>
      )}

      <div className="bg-white p-3 rounded-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-1">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-gray-600">Total Readings</span>
        </div>
        <div className="text-lg font-bold text-gray-800">
          {stats.totalReadings || stats.inRangePercent ? Math.round((stats.inRangePercent / 100) * (stats.totalReadings || 100)) : 0}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStats;
