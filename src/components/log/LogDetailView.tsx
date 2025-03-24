
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLogContext } from '@/context/LogContext';
import { Loader2 } from 'lucide-react';

interface LogDetailViewProps {
  log: GlucoseLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const LogDetailView: React.FC<LogDetailViewProps> = ({ log, isOpen, onClose }) => {
  const { deleteLog, fetchLogs } = useLogContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    if (log) {
      setLogToDelete(log.id);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!logToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteLog(logToDelete);
      setIsDeleteDialogOpen(false);
      onClose();
      fetchLogs(); // Refresh logs after deletion
    } catch (error) {
      console.error('Error deleting log:', error);
    } finally {
      setIsDeleting(false);
      setLogToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLogToDelete(null);
  };

  if (!log) return null;

  const formatDate = (date: Date) => {
    return format(date, 'PPP');
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getStatusColor = (glucoseLevel: number | undefined) => {
    if (!glucoseLevel) return 'text-gray-600';
    if (glucoseLevel < 70) return 'text-red-600';
    if (glucoseLevel > 180) return 'text-orange-600';
    return 'text-green-600';
  };

  const getMealContextLabel = (mealContext?: 'before' | 'after' | 'fasting') => {
    switch (mealContext) {
      case 'before': return 'Before Meal';
      case 'after': return 'After Meal';
      case 'fasting': return 'Fasting';
      default: return '';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="p-0 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Log Details</h2>
              <button 
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-6">
              <div className="border-b pb-4">
                <div className="text-gray-500 text-sm mb-1">
                  {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
                </div>
                
                {log.glucoseLevel !== undefined ? (
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold ${getStatusColor(log.glucoseLevel)}`}>
                      {log.glucoseLevel}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">mg/dL</span>
                  </div>
                ) : (
                  <div className="text-xl font-medium">Food Entry</div>
                )}
                
                {log.mealContext && (
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {getMealContextLabel(log.mealContext)}
                    </span>
                  </div>
                )}
              </div>
              
              {log.food && (
                <div>
                  <h3 className="font-medium mb-2">Food</h3>
                  <p className="text-gray-700">{log.food}</p>
                </div>
              )}
              
              {log.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-700">{log.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-auto border-t p-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick} 
                className="w-full"
              >
                Delete Log
              </Button>
            </div>
          </motion.div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogDetailView;
