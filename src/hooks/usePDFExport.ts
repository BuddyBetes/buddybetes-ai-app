
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLogContext } from '@/context/LogContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
}

interface HealthData {
  gender: string;
  birthdate: string;
  height: string;
  height_unit: string;
  weight: string;
  weight_unit: string;
  diabetes_type: string;
  glucose_unit: string;
}

export interface PDFExportData {
  profile: ProfileData;
  healthData: HealthData;
  glucoseLogs: any[];
  stats: {
    totalReadings: number;
    averageGlucose: number;
    highReadings: number;
    lowReadings: number;
    normalReadings: number;
  };
}

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { logs } = useLogContext();
  const { toast } = useToast();

  const exportToPDF = async (dateRange: number = 90) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch health data
      const { data: healthData, error: healthError } = await supabase
        .from('health_data')
        .select('gender, birthdate, height, height_unit, weight, weight_unit, diabetes_type, glucose_unit')
        .eq('user_id', user.id)
        .single();

      if (healthError) throw healthError;

      // Filter logs by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      
      const filteredLogs = logs.filter(log => 
        new Date(log.timestamp) >= cutoffDate && log.glucoseLevel !== undefined
      );

      // Calculate statistics
      const glucoseValues = filteredLogs
        .map(log => log.glucoseLevel)
        .filter(val => val !== undefined) as number[];

      const averageGlucose = glucoseValues.length > 0 
        ? Math.round(glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length)
        : 0;

      const highReadings = glucoseValues.filter(val => val > 180).length;
      const lowReadings = glucoseValues.filter(val => val < 70).length;
      const normalReadings = glucoseValues.filter(val => val >= 70 && val <= 180).length;

      const exportData: PDFExportData = {
        profile: profile || { first_name: '', last_name: '', email: user.email || '' },
        healthData: healthData || {
          gender: '',
          birthdate: '',
          height: '',
          height_unit: 'cm',
          weight: '',
          weight_unit: 'kg',
          diabetes_type: '',
          glucose_unit: 'mg/dL'
        },
        glucoseLogs: filteredLogs.slice(0, 100), // Limit to last 100 readings
        stats: {
          totalReadings: glucoseValues.length,
          averageGlucose,
          highReadings,
          lowReadings,
          normalReadings
        }
      };

      return exportData;

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting
  };
};
