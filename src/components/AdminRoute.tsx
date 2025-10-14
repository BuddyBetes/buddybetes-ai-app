import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Use the is_admin() database function for server-side RBAC
      const { data, error } = await supabase.rpc('is_admin', {
        _user_id: user.id,
      });

      if (error) throw error;

      setIsAdmin(data === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking admin status
  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin" replace />;
  }

  // Immediately redirect non-admin users without rendering children
  if (isAdmin === false) {
    toast({
      title: 'Access Denied',
      description: 'You do not have admin privileges',
      variant: 'destructive',
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Only render children if user is confirmed admin
  return <>{children}</>;
};
