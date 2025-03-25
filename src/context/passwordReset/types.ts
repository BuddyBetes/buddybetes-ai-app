
import { Dispatch, SetStateAction } from 'react';

export interface ResetLocationState {
  fromReset?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
  recoveryToken?: boolean | null;
}

export interface PasswordResetContextProps {
  mode: 'request' | 'reset';
  resetComplete: boolean;
  isValidResetLink: boolean;
  isCheckingLink: boolean;
  handleResetComplete: () => void;
}
