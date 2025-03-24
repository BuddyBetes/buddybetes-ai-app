
import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface DeleteLogDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteLogDialog: React.FC<DeleteLogDialogProps> = ({ 
  isOpen, 
  isDeleting, 
  onClose, 
  onConfirm 
}) => {
  // Simple dialog that only cares about being open/closed
  // and executing actions when buttons are clicked
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Log Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this log entry? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-500 hover:bg-red-600" 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLogDialog;
