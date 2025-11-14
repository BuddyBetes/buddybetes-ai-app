
import { Session, User } from '@supabase/supabase-js';

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  isPasswordRecovery: boolean;
}
