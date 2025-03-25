
import React from 'react';
import { PasswordResetProvider } from '@/context/passwordReset/PasswordResetContext';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';

const ResetPassword = () => {
  return (
    <PasswordResetProvider>
      <ResetPasswordContainer />
    </PasswordResetProvider>
  );
};

export default ResetPassword;
