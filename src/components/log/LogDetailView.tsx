
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GlucoseLog } from '@/types/logs';
import { Info, Edit, Trash2, AlertCircle } from 'lucide-react';

interface LogDetailViewProps {
  log: GlucoseLog | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (log: GlucoseLog) => void;
  onDelete?: (logId: string) => void;
}

const LogDetailView: React.FC<LogDetailViewProps> = ({ 
  log, 
  isOpen, 
  onClose,
  onEdit,
  onDelete
}) => {
  if (!log) return null;

  // Format date and time for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusLabel = (glucoseLevel: number | undefined) => {
    if (!glucoseLevel) return 'No reading';
    if (glucoseLevel < 70) return 'Low';
    if (glucoseLevel > 180) return 'High';
    return 'Normal';
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
      default: return 'Not specified';
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(log);
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (onDelete) {
      onDelete(log.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-xl">Glucose Log Details</span>
          </DialogTitle>
          <DialogDescription>
            {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {log.glucoseLevel !== undefined ? (
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Glucose Level</p>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${getStatusColor(log.glucoseLevel)}`}>
                    {log.glucoseLevel} <span className="text-sm font-normal">mg/dL</span>
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.glucoseLevel)} bg-opacity-10 ${getStatusColor(log.glucoseLevel).replace('text', 'bg')}`}>
                {getStatusLabel(log.glucoseLevel)}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Entry Type</p>
                <div className="flex items-center">
                  <span className="text-xl font-medium">Food Entry</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {log.mealContext && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Meal Context</p>
              <p>{getMealContextLabel(log.mealContext)}</p>
            </div>
          )}

          {log.food && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Food</p>
              <p>{log.food}</p>
            </div>
          )}

          {log.notes && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="text-sm">{log.notes}</p>
            </div>
          )}

          {!log.notes && !log.food && !log.mealContext && log.glucoseLevel === undefined && (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No additional details</h3>
                <p className="mt-1 text-sm text-gray-500">This log entry doesn't have any additional information.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            {onDelete && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="default" size="sm">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailView;
