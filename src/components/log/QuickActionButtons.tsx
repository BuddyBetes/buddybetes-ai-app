
import React from 'react';
import { Plus, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReminderButton from './ReminderButton';

const QuickActionButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 py-2">
      <Button 
        onClick={() => navigate('/add-log')}
        size="sm" 
        className="flex items-center gap-1.5"
      >
        <Plus size={16} />
        <span>New Log</span>
      </Button>
      
      <ReminderButton />
      
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1.5 ml-auto"
        onClick={() => navigate('/dashboard')}
      >
        <BarChart2 size={16} />
        <span>Dashboard</span>
      </Button>
    </div>
  );
};

export default QuickActionButtons;
