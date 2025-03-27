
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLogContext } from '../context/LogContext';
import { GlucoseLog } from '@/types/logs';
import AppHeader from '@/components/AppHeader';
import LogDetailView from '@/components/log/LogDetailView';
import { useAuth } from '@/context/AuthContext';
import LogsLoadingState from '@/components/log/LogsLoadingState';
import LogsEmptyState from '@/components/log/LogsEmptyState';
import LogsByDate from '@/components/log/LogsByDate';

const Logs = () => {
  const { user } = useAuth();
  const { logs, isLoading } = useLogContext();
  const [selectedLog, setSelectedLog] = useState<GlucoseLog | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

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

  const groupedLogs: Record<string, GlucoseLog[]> = {};
  logs.forEach(log => {
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
        {Object.entries(groupedLogs).length > 0 ? (
          Object.entries(groupedLogs).map(([dateStr, logsForDate]) => (
            <LogsByDate 
              key={dateStr}
              date={dateStr} 
              logs={logsForDate}
              onLogSelect={handleLogClick} 
            />
          ))
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
