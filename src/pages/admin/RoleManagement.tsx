import AdminLayout from '@/components/admin/AdminLayout';
import UserRoleTable from '@/components/admin/UserRoleTable';
import AdminRoleManager from '@/components/admin/AdminRoleManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const RoleManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Grant Admin Access</CardTitle>
            </div>
            <CardDescription>
              Grant admin privileges to a user by their email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRoleManager />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View all users and manage their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRoleTable />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RoleManagement;
