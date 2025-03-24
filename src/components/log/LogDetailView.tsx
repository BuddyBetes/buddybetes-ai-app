
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Loader2 } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLogContext } from '@/context/LogContext';

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

  // Format notes with proper line breaks and spacing
  const formatNotes = (notes?: string) => {
    if (!notes) return null;
    
    // Replace line breaks with proper HTML line breaks
    const formattedNotes = notes.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < notes.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return formattedNotes;
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
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-lg">Log Details</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-auto p-4 space-y-6">
              {/* Date and Time Section */}
              <div className="text-center py-3 bg-gray-50 rounded-md">
                <div className="text-gray-500 text-sm">
                  {formatDate(log.timestamp)}
                </div>
                <div className="text-gray-600 font-medium">
                  {formatTime(log.timestamp)}
                </div>
              </div>
              
              {/* Glucose Level Section */}
              <div className="flex flex-col items-center border-b pb-4">
                {log.glucoseLevel !== undefined ? (
                  <>
                    <div className="text-sm text-gray-500 mb-1">Glucose Level</div>
                    <div className="flex items-baseline">
                      <span className={`text-4xl font-bold ${getStatusColor(log.glucoseLevel)}`}>
                        {log.glucoseLevel}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">mg/dL</span>
                    </div>
                    
                    {/* Status Indicator */}
                    {log.glucoseLevel && (
                      <div className="mt-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                        {log.glucoseLevel < 70 ? 'Low' : log.glucoseLevel > 180 ? 'High' : 'Normal'}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-medium">Food Entry</div>
                )}
              </div>
              
              {/* Meal Context Section */}
              {log.mealContext && (
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-gray-700">Meal Context</h3>
                  <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {getMealContextLabel(log.mealContext)}
                  </div>
                </div>
              )}
              
              {/* Food Section */}
              {log.food && (
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2 text-gray-700">Food</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{log.food}</p>
                </div>
              )}
              
              {/* Notes Section with improved formatting */}
              {log.notes && (
                <div>
                  <h3 className="font-medium mb-2 text-gray-700">Notes</h3>
                  <div className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                    {formatNotes(log.notes)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto border-t p-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick} 
                className="w-full flex items-center justify-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
