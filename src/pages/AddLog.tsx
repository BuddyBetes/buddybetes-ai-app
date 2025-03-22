
import React from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import LogFormContainer from '@/components/log/LogFormContainer';

const AddLog: React.FC = () => {
  return (
    <Layout title="Add Glucose Log">
      <AppHeader />
      <div className="space-y-6">     
        <LogFormContainer />
      </div>
    </Layout>
  );
};

export default AddLog;
