
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Shield } from 'lucide-react';

const AdminRoleManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const grantAdminRole = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, find the user by email in the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: "User not found",
          description: "No user found with that email address",
          variant: "destructive",
        });
        return;
      }

      // Grant admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: profile.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      toast({
        title: "Admin role granted",
        description: `${email} now has admin privileges`,
      });

      setEmail('');
    } catch (error) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Grant Admin Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="admin-email">User Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email..."
            className="mt-1"
          />
        </div>
        
        <Button 
          onClick={grantAdminRole}
          disabled={isLoading}
          className="w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isLoading ? 'Granting...' : 'Grant Admin Role'}
        </Button>
        
        <p className="text-xs text-gray-500">
          This will give the user access to the admin dashboard to manage payment receipts.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminRoleManager;
