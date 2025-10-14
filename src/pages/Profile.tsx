
import React, { useState } from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIPreferences from '@/components/profile/AIPreferences';
import HealthData from '@/components/profile/HealthData';
import PDFExport from '@/components/profile/PDFExport';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { signOut } = useAuth();
  const { subscription, hasActiveSubscription } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/signin');
    } catch (error) {
      navigate('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28">
        <ProfileHeader />
        
        {/* Admin Dashboard Access */}
        {adminLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : isAdmin ? (
          <button
            onClick={() => navigate('/admin')}
            className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 hover:scale-[1.02] transition-transform active:scale-[0.98] touch-manipulation min-h-[60px] sm:min-h-[80px]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-sm sm:text-base text-blue-900">Admin Dashboard</h3>
                  <p className="text-xs sm:text-sm text-blue-700 hidden xs:block sm:block">
                    Manage events, users, and system settings
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            </div>
          </button>
        ) : null}
        
        {/* Subscription Status */}
        {!hasActiveSubscription && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-900">Upgrade to Premium</h3>
                  <p className="text-sm text-purple-700">
                    {subscription?.status === 'pending' 
                      ? 'Payment verification in progress' 
                      : 'Unlock AI insights and advanced features'}
                  </p>
                </div>
              </div>
              {subscription?.status === 'pending' ? (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending
                </Badge>
              ) : (
                <Button 
                  onClick={() => navigate('/subscription')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        )}

        {hasActiveSubscription && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Premium Active</h3>
                <p className="text-sm text-green-700">
                  You have access to all premium features
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <AIPreferences />
          <HealthData />
        </div>

        {/* Export to PDF Button */}
        <PDFExport />

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 text-white"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
