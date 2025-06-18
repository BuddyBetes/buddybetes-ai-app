
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, CheckCircle } from 'lucide-react';
import DateFilter from './DateFilter';

interface MetricsHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  onRefresh: () => void;
  loading: boolean;
  hasBackfilled: boolean;
  dailyActiveUsersLength: number;
  getDateRangeMessage: () => string;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  onRefresh,
  loading,
  hasBackfilled,
  dailyActiveUsersLength
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        {hasBackfilled && dailyActiveUsersLength === 0 && (
          <p className="text-sm text-blue-600 mt-1 flex items-center">
            <Database className="h-4 w-4 mr-1" />
            Backfill completed - data from June 1, 2025 onwards
          </p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <DateFilter 
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          minDate={minDate}
          maxDate={maxDate}
        />
        <Button onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
