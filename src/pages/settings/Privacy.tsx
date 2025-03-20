
import React from 'react';
import Layout from '../../components/Layout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, Shield, Lock, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

const Privacy = () => {
  const navigate = useNavigate();
  
  return (
    <Layout title="Privacy">
      <AppHeader />
      <div className="pt-4 pb-28">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Privacy & Security</h1>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Data Privacy</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-green-500" />
                  <div>
                    <span className="block">Analytics Sharing</span>
                    <span className="text-xs text-gray-500">Share anonymous usage data to help improve the app</span>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye size={20} className="text-red-500" />
                  <div>
                    <span className="block">Personalized Content</span>
                    <span className="text-xs text-gray-500">Receive tailored recommendations based on your data</span>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock size={20} className="text-blue-500" />
                  <span>Change Password</span>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download size={20} className="text-purple-500" />
                  <span>Download My Data</span>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <Button 
                variant="destructive" 
                className="w-full"
              >
                Delete My Account
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This action permanently removes all your data and cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 p-4">
            <p className="mb-2">
              Your privacy is important to us. We only collect data necessary to provide you with the best diabetes management experience.
            </p>
            <p>
              View our <span className="text-blue-500 underline">Privacy Policy</span> and <span className="text-blue-500 underline">Terms of Service</span> for more information.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
