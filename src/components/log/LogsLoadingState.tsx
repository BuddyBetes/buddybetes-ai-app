
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  user: any;
}

const LogsLoadingState: React.FC<LoadingStateProps> = ({ user }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <Loader2 className="h-8 w-8 animate-spin text-buddy-500" />
      <p className="mt-4 text-gray-500">Loading your glucose logs...</p>
      <p className="mt-2 text-xs text-gray-400">
        {user ? 'Fetching logs from your account' : 'Waiting for authentication...'}
      </p>
    </div>
  );
};

export default LogsLoadingState;
