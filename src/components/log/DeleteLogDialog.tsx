
import React, { useEffect } from 'react';
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
  // Debug logging to track dialog state changes
  useEffect(() => {
    console.log("DeleteLogDialog state:", { isOpen, isDeleting });
  }, [isOpen, isDeleting]);

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
      key={isOpen.toString()} // Force re-render when open state changes
      onOpenChange={(open) => {
        console.log('Dialog open change triggered:', open, 'while deleting:', isDeleting);
        
        // Allow closing if not deleting
        if (!isDeleting) {
          if (!open) onClose();
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
