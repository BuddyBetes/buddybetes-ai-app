
import React from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIPreferences from '@/components/profile/AIPreferences';
import HealthData from '@/components/profile/HealthData';
import { Button } from '@/components/ui/button';
import { LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { signOut } = useAuth();
  const { subscription, hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28">
        <ProfileHeader />
        
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

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
