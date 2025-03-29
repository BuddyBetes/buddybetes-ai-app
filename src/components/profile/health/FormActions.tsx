
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  loading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, loading }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4 mb-10">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
};

export default FormActions;
