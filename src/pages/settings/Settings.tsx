
import React from 'react';
import Layout from '../../components/Layout';
import AppHeader from '@/components/AppHeader';
import { ArrowLeft, Moon, Sun, Laptop, Globe, VolumeX, Volume2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlucoseUnit } from '@/context/GlucoseUnitContext';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { glucoseUnit, setGlucoseUnit } = useGlucoseUnit();
  const { toast } = useToast();
  
  const handleGlucoseUnitChange = async (unit: string) => {
    try {
      await setGlucoseUnit(unit as 'mg/dL' | 'mmol/L');
      toast({
        title: "Unit updated",
        description: `Glucose unit is now set to ${unit}`,
      });
    } catch (error) {
      console.error('Error updating glucose unit:', error);
      toast({
        title: "Update failed",
        description: "Failed to update glucose unit",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout title="Settings">
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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Appearance</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sun size={20} className="text-yellow-500" />
                  <span>Theme</span>
                </div>
                <Select defaultValue="system">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun size={14} className="mr-2 text-yellow-500" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon size={14} className="mr-2 text-purple-500" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Laptop size={14} className="mr-2 text-gray-500" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe size={20} className="text-blue-500" />
                  <span>Language</span>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Notifications</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell size={20} className="text-indigo-500" />
                  <div>
                    <span className="block">Push Notifications</span>
                    <span className="text-xs text-gray-500">Receive alerts on your device</span>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 size={20} className="text-green-500" />
                  <div>
                    <span className="block">Sound Effects</span>
                    <span className="text-xs text-gray-500">Play sounds for alerts</span>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Units & Measurements</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Glucose Unit</span>
                <Select 
                  value={glucoseUnit}
                  onValueChange={handleGlucoseUnitChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                    <SelectItem value="mmol/L">mmol/L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Weight Unit</span>
                <Select defaultValue="kg">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
