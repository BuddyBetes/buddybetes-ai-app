
import React from 'react';
import { Loader2 } from 'lucide-react';
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
  onConfirm: () => Promise<void>;
}

const DeleteLogDialog: React.FC<DeleteLogDialogProps> = ({ 
  isOpen, 
  isDeleting, 
  onClose, 
  onConfirm 
}) => {
  // Handle confirmation safely
  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Parent component will handle closing the dialog
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      // The error will be handled by the parent component
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow dialog to close if we're not in the middle of deleting
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this log entry? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-red-500 hover:bg-red-600" 
            disabled={isDeleting}
          >
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
  );
};

export default DeleteLogDialog;
