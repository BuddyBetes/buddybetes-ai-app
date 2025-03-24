
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLogContext } from '../context/LogContext';
import { GlucoseLog } from '@/types/logs';
import AppHeader from '@/components/AppHeader';
import LogDetailView from '@/components/log/LogDetailView';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import LogsLoadingState from '@/components/log/LogsLoadingState';
import LogsEmptyState from '@/components/log/LogsEmptyState';
import LogsByDate from '@/components/log/LogsByDate';
import DeleteLogDialog from '@/components/log/DeleteLogDialog';

const Logs = () => {
  const { user } = useAuth();
  const { logs, isLoading, updateLog, deleteLog } = useLogContext();
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<GlucoseLog | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Log the authentication and loading state for debugging
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
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group logs by date
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
  };

  const handleEditLog = (log: GlucoseLog) => {
    updateLog(log)
      .then(() => {
        setDetailViewOpen(false);
      })
      .catch((error) => {
        console.error('Error updating log:', error);
      });
  };

  const handleDeleteConfirm = (logId: string) => {
    setLogToDelete(logId);
    setDeleteDialogOpen(true);
    setDetailViewOpen(false);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteLog(logToDelete);
      toast({
        title: "Log deleted",
        description: "The log has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error",
        description: "Failed to delete the log",
        variant: "destructive",
      });
    } finally {
      // Reset all deletion-related state
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  const cancelDelete = () => {
    // Only allow cancellation if not currently deleting
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
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
        {Object.entries(groupedLogs).map(([dateStr, logsForDate], dateIndex) => (
          <LogsByDate 
            key={dateStr}
            dateStr={dateStr} 
            logs={logsForDate} 
            dateIndex={dateIndex} 
            onLogClick={handleLogClick} 
          />
        ))}
        
        {Object.keys(groupedLogs).length === 0 && <LogsEmptyState />}
      </div>

      <LogDetailView 
        log={selectedLog}
        isOpen={detailViewOpen}
        onClose={handleCloseDetail}
        onEdit={handleEditLog}
        onDelete={handleDeleteConfirm}
      />

      <DeleteLogDialog 
        isOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default Logs;
