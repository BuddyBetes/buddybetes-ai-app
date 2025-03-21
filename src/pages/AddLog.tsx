
import React, { useState } from 'react';
import Layout from '../components/Layout';
import AppHeader from '@/components/AppHeader';
import QuickActionButtons from '@/components/log/QuickActionButtons';
import LogFormContainer from '@/components/log/LogFormContainer';
import CameraModal from '@/components/log/CameraModal';

const AddLog: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [scanMode, setScanMode] = useState<'food' | 'meter'>('food');
  
  const handleScanFood = () => {
    setScanMode('food');
    setShowCamera(true);
  };

  const handleScanMeter = () => {
    setScanMode('meter');
    setShowCamera(true);
  };

  return (
    <Layout title="Add Glucose Log">
      <AppHeader />
      <div className="space-y-6">     
        <LogFormContainer />
      </div>

      <CameraModal
        open={showCamera}
        onOpenChange={setShowCamera}
        scanMode={scanMode}
      />
    </Layout>
  );
};

export default AddLog;
