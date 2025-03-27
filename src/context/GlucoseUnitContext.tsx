
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { GlucoseUnit } from '@/types/global';

type GlucoseUnitContextType = {
  glucoseUnit: GlucoseUnit;
  setGlucoseUnit: (unit: GlucoseUnit) => Promise<void>;
};

const GlucoseUnitContext = createContext<GlucoseUnitContextType | undefined>(undefined);

export const useGlucoseUnit = () => {
  const context = useContext(GlucoseUnitContext);
  if (!context) {
    throw new Error('useGlucoseUnit must be used within a GlucoseUnitProvider');
  }
  return context;
};

interface GlucoseUnitProviderProps {
  children: ReactNode;
}

export const GlucoseUnitProvider: React.FC<GlucoseUnitProviderProps> = ({ children }) => {
  const [glucoseUnit, setGlucoseUnitState] = useState<GlucoseUnit>('mg/dL');
  const { user } = useAuth();

  useEffect(() => {
    // Load the user's glucose unit preference from localStorage first for quick UI render
    const storedUnit = localStorage.getItem('glucoseUnit') as GlucoseUnit;
    if (storedUnit) {
      setGlucoseUnitState(storedUnit);
    }

    // If the user is authenticated, fetch their preference from database
    if (user) {
      fetchGlucoseUnit();
    }
  }, [user?.id]);

  const fetchGlucoseUnit = async () => {
    if (!user) return;

    try {
      // Check if the glucose_unit column exists
      const { data: columns } = await supabase
        .from('health_data')
        .select()
        .limit(1);
      
      // If the column exists, fetch it
      if (columns && Object.keys(columns[0] || {}).includes('glucose_unit')) {
        const { data, error } = await supabase
          .from('health_data')
          .select('glucose_unit')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching glucose unit preference:', error);
        } else if (data && data.glucose_unit) {
          const unit = data.glucose_unit as GlucoseUnit;
          setGlucoseUnitState(unit);
          localStorage.setItem('glucoseUnit', unit);
        }
      } else {
        console.log('glucose_unit column does not exist yet');
      }
    } catch (error) {
      console.error('Error fetching glucose unit preference:', error);
    }
  };

  const setGlucoseUnit = async (unit: GlucoseUnit) => {
    if (!user) {
      // If user is not authenticated, just store in localStorage
      localStorage.setItem('glucoseUnit', unit);
      setGlucoseUnitState(unit);
      return;
    }

    try {
      // Check if the glucose_unit column exists
      const { data: columns } = await supabase
        .from('health_data')
        .select()
        .limit(1);
      
      // If the column exists, update it
      if (columns && Object.keys(columns[0] || {}).includes('glucose_unit')) {
        // Update the database
        const { error } = await supabase
          .from('health_data')
          .update({ glucose_unit: unit })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating glucose unit preference:', error);
        } else {
          // Update localStorage and state
          localStorage.setItem('glucoseUnit', unit);
          setGlucoseUnitState(unit);
        }
      } else {
        // Just update localStorage and state for now
        localStorage.setItem('glucoseUnit', unit);
        setGlucoseUnitState(unit);
        console.log('glucose_unit column does not exist yet, only updating local state');
      }
    } catch (error) {
      console.error('Error updating glucose unit preference:', error);
    }
  };

  return (
    <GlucoseUnitContext.Provider value={{ glucoseUnit, setGlucoseUnit }}>
      {children}
    </GlucoseUnitContext.Provider>
  );
};
