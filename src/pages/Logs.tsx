
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { useLogContext } from '../context/LogContext';
import { GlucoseLog } from '@/types/logs';
import AppHeader from '@/components/AppHeader';
import LogDetailView from '@/components/log/LogDetailView';
import { useAuth } from '@/context/AuthContext';
import LogsLoadingState from '@/components/log/LogsLoadingState';
import LogsEmptyState from '@/components/log/LogsEmptyState';
import LogsByDate from '@/components/log/LogsByDate';
import LogFilters from '@/components/log/filters/LogFilters';
import { useLogFilters } from '@/hooks/useLogFilters';

const Logs = () => {
  const { user } = useAuth();
  const { logs, isLoading } = useLogContext();
  const [selectedLog, setSelectedLog] = useState<GlucoseLog | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  const {
    filters,
    setFilters,
    filteredLogs,
    activeFiltersCount,
    clearAllFilters,
    filterPresets
  } = useLogFilters(logs);

  useEffect(() => {
    console.log('Logs page - Auth state:', user ? 'Authenticated' : 'Not authenticated');
  }, [user]);

  useEffect(() => {
    console.log('Logs page - Loading state:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('Logs page - Logs count:', logs.length);
  }, [logs.length]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for grouping
  };

  // Group filtered logs by date
  const groupedLogs: Record<string, GlucoseLog[]> = {};
  filteredLogs.forEach(log => {
    const dateStr = formatDate(log.timestamp);
    if (!groupedLogs[dateStr]) {
      groupedLogs[dateStr] = [];
    }
    groupedLogs[dateStr].push(log);
  });

  const handleLogClick = (log: GlucoseLog) => {
    setSelectedLog(log);
    setDetailViewOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailViewOpen(false);
    setTimeout(() => {
      setSelectedLog(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <Layout>
        <AppHeader />
        <LogsLoadingState user={user} />
      </Layout>
    );
  }

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28 pt-4">
        <LogFilters
          filters={filters}
          onFiltersChange={setFilters}
          activeFiltersCount={activeFiltersCount}
          onClearAll={clearAllFilters}
          totalLogs={logs.length}
          filteredCount={filteredLogs.length}
          filterPresets={filterPresets}
        />

        {Object.entries(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([dateStr, logsForDate]) => (
            <LogsByDate 
              key={dateStr}
              date={dateStr} 
              logs={logsForDate}
              onLogSelect={handleLogClick} 
            />
          ))
        ) : filteredLogs.length === 0 && logs.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No logs match your filters</h3>
              <p className="text-sm">Try adjusting your filter criteria or clearing all filters.</p>
            </div>
          </div>
        ) : (
          <LogsEmptyState />
        )}
      </div>

      <LogDetailView 
        log={selectedLog}
        isOpen={detailViewOpen}
        onClose={handleCloseDetail}
      />
    </Layout>
  );
};

export default Logs;
