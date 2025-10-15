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

    // Validate route pattern
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/admin')) {
      console.warn('Invalid admin route access attempt:', currentPath);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Verify session validity
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        console.error('Invalid session:', sessionError);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Use the is_admin() database function for server-side RBAC with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 5000)
      );

      const { data, error } = await Promise.race([
        supabase.rpc('is_admin', { _user_id: user.id }),
        timeoutPromise
      ]) as any;

      if (error) throw error;

      // Double-check with server-side verification
      if (data === true) {
        const { data: verification } = await supabase.functions.invoke('verify-admin');
        if (verification && !verification.isAdmin) {
          console.warn('Admin verification failed');
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      }

      setIsAdmin(data === true);
      
      // Log admin access
      if (data === true) {
        await supabase.from('admin_activity_logs').insert({
          admin_user_id: user.id,
          action: 'admin_route_access',
          resource: currentPath,
          metadata: { timestamp: new Date().toISOString() }
        });
      }
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
