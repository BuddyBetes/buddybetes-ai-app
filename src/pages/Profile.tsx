
import React from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AIPreferences from '@/components/profile/AIPreferences';
import HealthData from '@/components/profile/HealthData';

const Profile = () => {
  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28">
        <ProfileHeader />
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <AIPreferences />
          <HealthData />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
