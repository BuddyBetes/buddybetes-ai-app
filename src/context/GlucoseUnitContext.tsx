
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
    if (storedUnit && (storedUnit === 'mg/dL' || storedUnit === 'mmol/L')) {
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
      const { data, error } = await supabase
        .from('health_data')
        .select('glucose_unit')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Check if the error is related to missing column
        if (error.message.includes('column') && error.message.includes('not exist')) {
          console.error('glucose_unit column does not exist yet');
          return; // Gracefully handle missing column
        }
        console.error('Error fetching glucose unit preference:', error);
      } else if (data && data.glucose_unit) {
        const unit = data.glucose_unit as GlucoseUnit;
        if (unit === 'mg/dL' || unit === 'mmol/L') {
          setGlucoseUnitState(unit);
          localStorage.setItem('glucoseUnit', unit);
        }
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
      // Update the database
      const { error } = await supabase
        .from('health_data')
        .update({ glucose_unit: unit })
        .eq('user_id', user.id);

      if (error) {
        // Check if the error is related to missing column
        if (error.message.includes('column') && error.message.includes('not exist')) {
          console.error('glucose_unit column does not exist yet');
          // Still update the local state
          localStorage.setItem('glucoseUnit', unit);
          setGlucoseUnitState(unit);
          return;
        }
        console.error('Error updating glucose unit preference:', error);
      } else {
        // Update localStorage and state
        localStorage.setItem('glucoseUnit', unit);
        setGlucoseUnitState(unit);
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
