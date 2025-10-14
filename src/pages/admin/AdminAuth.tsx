import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Check if user is already authenticated and admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase.rpc('is_admin', {
            _user_id: user.id,
          });

          if (!error && data) {
            // User is already authenticated as admin, redirect to dashboard
            navigate('/admin/dashboard', { replace: true });
          } else {
            // User is authenticated but not admin
            setIsCheckingAuth(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user data returned');
      }

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', {
        _user_id: data.user.id,
      });

      if (adminError) throw adminError;

      if (!isAdmin) {
        // Sign out the non-admin user
        await supabase.auth.signOut();
        
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to admin portal',
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin sign in error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in to access the BuddyBetes admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@buddybetes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Admin Portal'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/signin')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Go to main app sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
