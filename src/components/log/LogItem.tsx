
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import { GlucoseLog } from '@/context/LogContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLogContext } from '@/context/LogContext';
import LogDetailView from './LogDetailView';
import { useToast } from '@/hooks/use-toast';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { convertGlucoseValue } from '@/utils/glucoseUtils';
import LogDisplay from './LogDisplay';

interface LogItemProps {
  log: GlucoseLog;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteLog } = useLogContext();
  const { toast } = useToast();
  const { glucoseUnit } = useGlucoseUnit();

  const handleOpenDetail = () => {
    setIsDetailOpen(true);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLog(log.id);
      toast({
        title: "Log deleted",
        description: "Your log entry has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error",
        description: "Failed to delete log entry.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div 
        className="p-4 rounded-lg bg-white shadow-sm mb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleOpenDetail}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <LogDisplay log={log} />
          </div>
          
          <div className="flex flex-col items-end ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs text-gray-500 mt-2">{formatTime(log.timestamp)}</span>
          </div>
        </div>
      </div>

      <LogDetailView 
        log={log} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this log entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogItem;
