
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { GlucoseLog } from '@/types/logs';
import { Info, Edit, Trash2, AlertCircle, Utensils, Calendar, Clock, Tag } from 'lucide-react';

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

  const getBgStatusColor = (glucoseLevel: number | undefined) => {
    if (!glucoseLevel) return 'bg-gray-100';
    if (glucoseLevel < 70) return 'bg-red-50';
    if (glucoseLevel > 180) return 'bg-orange-50';
    return 'bg-green-50';
  };

  const getMealContextLabel = (mealContext?: 'before' | 'after' | 'fasting') => {
    switch (mealContext) {
      case 'before': return 'Before Meal';
      case 'after': return 'After Meal';
      case 'fasting': return 'Fasting';
      default: return 'Not specified';
    }
  };

  const getMealContextColor = (mealContext?: 'before' | 'after' | 'fasting') => {
    switch (mealContext) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'after': return 'bg-violet-100 text-violet-800';
      case 'fasting': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <DialogContent className="sm:max-w-md rounded-xl p-0 gap-0 overflow-hidden">
        <div className={`p-6 ${getBgStatusColor(log.glucoseLevel)}`}>
          <DialogHeader className="mb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Log Details</DialogTitle>
              {log.glucoseLevel !== undefined && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(log.glucoseLevel)} bg-white/80`}>
                  {getStatusLabel(log.glucoseLevel)}
                </span>
              )}
            </div>
            <DialogDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatDate(log.timestamp)}</span>
            </DialogDescription>
            <DialogDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{formatTime(log.timestamp)}</span>
            </DialogDescription>
          </DialogHeader>
          
          {log.glucoseLevel !== undefined ? (
            <div className="mt-4 mb-2">
              <div className="flex items-baseline">
                <span className={`text-4xl font-bold ${getStatusColor(log.glucoseLevel)}`}>
                  {log.glucoseLevel}
                </span>
                <span className="ml-2 text-gray-500">mg/dL</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-4 mb-2">
              <Utensils className="h-6 w-6 text-buddy-500" />
              <span className="text-xl font-semibold">Food Entry</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {log.mealContext && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Tag className="h-4 w-4" />
                <span>Meal Context</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMealContextColor(log.mealContext)}`}>
                {getMealContextLabel(log.mealContext)}
              </span>
            </div>
          )}

          {log.food && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Utensils className="h-4 w-4" />
                <span>Food</span>
              </div>
              <p className="text-gray-900">{log.food}</p>
            </div>
          )}

          {log.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Info className="h-4 w-4" />
                <span>Notes</span>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{log.notes}</p>
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

        <Separator />

        <DialogFooter className="p-4">
          <div className="flex w-full gap-3">
            {onDelete && (
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {onEdit && (
              <Button variant="default" onClick={handleEdit} className="flex-1 bg-buddy-500 hover:bg-buddy-600">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailView;
