
import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const Profile = () => {
  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'bg-gray-100' },
    { icon: Bell, label: 'Notifications', color: 'bg-blue-100' },
    { icon: Lock, label: 'Privacy', color: 'bg-purple-100' },
    { icon: HelpCircle, label: 'Help', color: 'bg-green-100' },
    { icon: LogOut, label: 'Logout', color: 'bg-red-100' },
  ];
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  return (
    <Layout title="Profile">
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="bg-buddy-100 text-buddy-800 text-2xl">
              <User size={40} />
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold">Jane Cooper</h2>
          <p className="text-gray-500">jane.cooper@example.com</p>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div 
            custom={0}
            variants={itemVariants}
            className="p-4 border-b border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-4">AI Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-buddy-100 flex items-center justify-center">
                    <span className="text-buddy-600 text-xs">🇺🇸</span>
                  </div>
                  <span className="text-sm font-medium">English (US)</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-buddy-100 flex items-center justify-center">
                    <span className="text-buddy-600 text-xs">📝</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Insights & Tips</span>
                    <p className="text-xs text-gray-500">Get AI suggestions based on your data</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-buddy-100 flex items-center justify-center">
                    <span className="text-buddy-600 text-xs">🔊</span>
                  </div>
                  <span className="text-sm font-medium">Voice assistant</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            custom={1}
            variants={itemVariants}
            className="p-4"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-4">Health Data</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Gender</div>
                <div className="font-medium">Female</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Age</div>
                <div className="font-medium">42</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Height</div>
                <div className="font-medium">5'7"</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Weight</div>
                <div className="font-medium">152 lbs</div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Diabetes Type</div>
                <div className="font-medium">Type 2</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              custom={index}
              variants={itemVariants}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon size={16} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
