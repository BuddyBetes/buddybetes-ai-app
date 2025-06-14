
import React from 'react';
import { FileText } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';

interface NotesSectionProps {
  log: GlucoseLog;
}

const NotesSection: React.FC<NotesSectionProps> = ({ log }) => {
  const hasNotes = !!log.notes;

  if (!hasNotes) {
    return null;
  }

  return (
    <div className="w-full mt-3">
      <div className="notes-info p-2 bg-gray-50 rounded-md">
        <div className="flex items-start">
          <FileText className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm">{log.notes}</span>
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
