
import React from 'react';

const PasswordResetSuccess = () => {
  return (
    <div className="text-center py-6">
      <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
        <p className="font-medium">Password reset successful!</p>
        <p className="text-sm mt-1">You will be redirected to the login page in a few seconds...</p>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
