import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import AppHeader from '@/components/AppHeader';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthData, setHealthData] = useState({
    gender: 'Female',
    age: '42',
    height: '5\'7"',
    weight: '152',
    diabetesType: 'Type 2'
  });
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Medication Reminder', message: 'Time to take your evening medication', read: false },
    { id: 2, title: 'High Glucose Alert', message: 'Your glucose level was higher than usual after lunch', read: false }
  ]);

  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'bg-gray-100', path: '/settings' },
    { icon: Bell, label: 'Notifications', color: 'bg-blue-100' },
    { icon: Lock, label: 'Privacy', color: 'bg-purple-100', path: '/privacy' },
    { icon: HelpCircle, label: 'Help', color: 'bg-green-100', path: '/help' },
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

  const handleHealthDataChange = (field: string, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const saveHealthData = () => {
    toast({
      title: "Success",
      description: "Your health data has been updated",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMenuItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout>
      <AppHeader />
      <div className="space-y-6 pb-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6 pt-4"
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-500">Health Data</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">Edit</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Health Data</SheetTitle>
                    <SheetDescription>
                      Make changes to your health profile here.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="gender" className="text-right">
                        Gender
                      </label>
                      <Select 
                        value={healthData.gender} 
                        onValueChange={(value) => handleHealthDataChange('gender', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="age" className="text-right">
                        Age
                      </label>
                      <Input
                        id="age"
                        value={healthData.age}
                        onChange={(e) => handleHealthDataChange('age', e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="height" className="text-right">
                        Height
                      </label>
                      <Input
                        id="height"
                        value={healthData.height}
                        onChange={(e) => handleHealthDataChange('height', e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="weight" className="text-right">
                        Weight (lbs)
                      </label>
                      <Input
                        id="weight"
                        value={healthData.weight}
                        onChange={(e) => handleHealthDataChange('weight', e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="diabetesType" className="text-right">
                        Diabetes Type
                      </label>
                      <Select 
                        value={healthData.diabetesType} 
                        onValueChange={(value) => handleHealthDataChange('diabetesType', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select diabetes type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Type 1">Type 1</SelectItem>
                          <SelectItem value="Type 2">Type 2</SelectItem>
                          <SelectItem value="Gestational">Gestational</SelectItem>
                          <SelectItem value="Pre-diabetes">Pre-diabetes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <SheetClose asChild>
                      <Button onClick={saveHealthData}>Save changes</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Gender</div>
                <div className="font-medium">{healthData.gender}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Age</div>
                <div className="font-medium">{healthData.age}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Height</div>
                <div className="font-medium">{healthData.height}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Weight</div>
                <div className="font-medium">{healthData.weight} lbs</div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Diabetes Type</div>
                <div className="font-medium">{healthData.diabetesType}</div>
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
              onClick={() => handleMenuItemClick(item.path)}
            >
              {item.label === 'Notifications' ? (
                <Sheet>
                  <SheetTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                        <item.icon size={16} />
                        {notifications.some(n => !n.read) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader className="mb-4">
                      <SheetTitle>Notifications</SheetTitle>
                      <SheetDescription>
                        Stay updated with your health insights
                      </SheetDescription>
                    </SheetHeader>
                    
                    {notifications.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">{notifications.length} notifications</span>
                          <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            Mark all as read
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-100'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium">{notification.title}</div>
                                <button 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">{notification.message}</div>
                              <div className="text-xs text-gray-500">Today</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="text-gray-400 mb-3">
                          <Bell size={40} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
                        <p className="text-gray-500 mt-2">You're all caught up!</p>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
