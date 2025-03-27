
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GlucoseLog } from '@/types/logs';
import LogDisplay from './LogDisplay';

interface LogDetailViewProps {
  log: GlucoseLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const LogDetailView: React.FC<LogDetailViewProps> = ({ log, isOpen, onClose }) => {
  // Only render the component if there's a log to display
  if (!log) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md md:max-w-lg" side="right">
        <SheetHeader className="mb-4">
          <SheetTitle>Log Details</SheetTitle>
        </SheetHeader>
        <div className="log-detail-container">
          <LogDisplay log={log} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LogDetailView;
