
import React from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIPreferences from '@/components/profile/AIPreferences';
import HealthData from '@/components/profile/HealthData';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { signOut } = useAuth();
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
