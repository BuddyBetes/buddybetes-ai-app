
import React from 'react';
import { FileText, Dumbbell, Pill } from 'lucide-react';
import { GlucoseLog } from '@/types/logs';

interface NotesSectionProps {
  log: GlucoseLog;
}

const NotesSection: React.FC<NotesSectionProps> = ({ log }) => {
  const hasExercise = !!log.exercise;
  const hasMedication = !!log.medication;
  const hasNotes = !!log.notes;

  if (!hasExercise && !hasMedication && !hasNotes) {
    return null;
  }

  return (
    <div className="w-full mt-3 space-y-2">
      {hasExercise && (
        <div className="exercise-info p-2 bg-purple-50 rounded-md">
          <div className="flex items-start">
            <Dumbbell className="h-4 w-4 mr-2 text-purple-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{log.exercise}</span>
          </div>
        </div>
      )}
      
      {hasMedication && (
        <div className="medication-info p-2 bg-amber-50 rounded-md">
          <div className="flex items-start">
            <Pill className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{log.medication}</span>
          </div>
        </div>
      )}
      
      {hasNotes && (
        <div className="notes-info p-2 bg-gray-50 rounded-md">
          <div className="flex items-start">
            <FileText className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{log.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
