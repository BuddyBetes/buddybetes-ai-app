
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Loader2, Clock, Apple, StickyNote } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLogContext } from '@/context/LogContext';
import { Badge } from '@/components/ui/badge';

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
    return format(date, 'MMMM do, yyyy');
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

  const getStatusBgColor = (glucoseLevel: number | undefined) => {
    if (!glucoseLevel) return 'bg-gray-100';
    if (glucoseLevel < 70) return 'bg-red-100';
    if (glucoseLevel > 180) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const getMealContextColor = (mealContext?: 'before' | 'after' | 'fasting') => {
    switch (mealContext) {
      case 'before': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'after': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'fasting': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
            <SheetHeader className="px-4 py-4 border-b sticky top-0 bg-white z-10">
              <SheetTitle className="text-xl font-bold text-center">Log Details</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-auto p-5 space-y-8">
              {/* Date and Time Section */}
              <div className="text-center py-4 bg-gray-50 rounded-xl shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="text-gray-600 text-sm font-medium">
                    {formatDate(log.timestamp)}
                  </div>
                </div>
                <div className="text-gray-800 font-bold text-2xl">
                  {formatTime(log.timestamp)}
                </div>
              </div>
              
              {/* Glucose Level Section */}
              {log.glucoseLevel !== undefined ? (
                <div className="flex flex-col items-center border-b pb-6">
                  <div className="text-sm text-gray-500 mb-2 font-medium">Glucose Level</div>
                  <div className="flex items-baseline">
                    <span className={`text-5xl font-bold ${getStatusColor(log.glucoseLevel)}`}>
                      {log.glucoseLevel}
                    </span>
                    <span className="text-lg text-gray-500 ml-2">mg/dL</span>
                  </div>
                  
                  {/* Status Indicator */}
                  {log.glucoseLevel && (
                    <div className={`mt-3 px-4 py-1.5 rounded-full text-sm font-medium ${getStatusBgColor(log.glucoseLevel)} ${getStatusColor(log.glucoseLevel)}`}>
                      {log.glucoseLevel < 70 ? 'Low' : log.glucoseLevel > 180 ? 'High' : 'Normal'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center border-b pb-6">
                  <Badge variant="outline" className="px-4 py-2 text-lg font-medium">
                    Food Entry
                  </Badge>
                </div>
              )}
              
              {/* Meal Context Section */}
              {log.mealContext && (
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-1 bg-buddy-500 rounded-full"></div>
                    <h3 className="font-semibold text-lg text-gray-800">Meal Context</h3>
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getMealContextColor(log.mealContext)}`}>
                    {getMealContextLabel(log.mealContext)}
                  </div>
                </div>
              )}
              
              {/* Food Section */}
              {log.food && (
                <div className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-1 bg-buddy-500 rounded-full"></div>
                    <h3 className="font-semibold text-lg text-gray-800">Food</h3>
                  </div>
                  <div className="flex items-center">
                    <Apple className="h-5 w-5 text-buddy-500 mr-2" />
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 w-full">
                      {log.food}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Notes Section with improved formatting */}
              {log.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-1 bg-buddy-500 rounded-full"></div>
                    <h3 className="font-semibold text-lg text-gray-800">Notes</h3>
                  </div>
                  <div className="flex items-start">
                    <StickyNote className="h-5 w-5 text-buddy-500 mr-2 mt-1" />
                    <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 w-full whitespace-pre-line">
                      {formatNotes(log.notes)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto border-t p-4 sticky bottom-0 bg-white">
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick} 
                className="w-full flex items-center justify-center py-6 text-base"
              >
                <Trash2 className="mr-2 h-5 w-5" />
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
