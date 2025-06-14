
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFExportData } from '@/hooks/usePDFExport';
import { format } from 'date-fns';

interface PDFDocumentProps {
  data: PDFExportData;
  dateRange: number;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
    color: '#4B5563',
  },
  value: {
    color: '#1F2937',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 8,
  },
});

const PDFDocument: React.FC<PDFDocumentProps> = ({ data, dateRange }) => {
  const { profile, healthData, glucoseLogs, stats } = data;
  
  const patientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Patient';
  const currentDate = format(new Date(), 'MMMM dd, yyyy');
  
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A';
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Glucose Monitoring Report</Text>
          <Text style={styles.subtitle}>Patient: {patientName}</Text>
          <Text style={styles.subtitle}>Generated: {currentDate}</Text>
          <Text style={styles.subtitle}>Report Period: Last {dateRange} days</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{calculateAge(healthData.birthdate)} years</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{healthData.gender || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Height:</Text>
            <Text style={styles.value}>{healthData.height} {healthData.height_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{healthData.weight} {healthData.weight_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diabetes Type:</Text>
            <Text style={styles.value}>{healthData.diabetes_type || 'Not specified'}</Text>
          </View>
        </View>

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glucose Summary ({dateRange} days)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Readings:</Text>
            <Text style={styles.value}>{stats.totalReadings}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Glucose:</Text>
            <Text style={styles.value}>{stats.averageGlucose} {healthData.glucose_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>High Readings (above 180):</Text>
            <Text style={styles.value}>{stats.highReadings} ({stats.totalReadings > 0 ? Math.round((stats.highReadings / stats.totalReadings) * 100) : 0}%)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Normal Readings (70-180):</Text>
            <Text style={styles.value}>{stats.normalReadings} ({stats.totalReadings > 0 ? Math.round((stats.normalReadings / stats.totalReadings) * 100) : 0}%)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Low Readings (below 70):</Text>
            <Text style={styles.value}>{stats.lowReadings} ({stats.totalReadings > 0 ? Math.round((stats.lowReadings / stats.totalReadings) * 100) : 0}%)</Text>
          </View>
        </View>

        {/* Recent Glucose Readings */}
        {glucoseLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Glucose Readings (Last 20)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.label]}>Date/Time</Text>
                <Text style={[styles.tableCell, styles.label]}>Glucose</Text>
                <Text style={[styles.tableCell, styles.label]}>Context</Text>
                <Text style={[styles.tableCell, styles.label]}>Food</Text>
              </View>
              {glucoseLogs.slice(0, 20).map((log, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                  </Text>
                  <Text style={styles.tableCell}>
                    {log.glucoseLevel} {healthData.glucose_unit}
                  </Text>
                  <Text style={styles.tableCell}>
                    {log.mealContext || '-'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {log.food ? log.food.substring(0, 30) + (log.food.length > 30 ? '...' : '') : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          This report is generated for medical consultation purposes. 
          Please consult with your healthcare provider for medical advice.
        </Text>
      </Page>
    </Document>
  );
};

export default PDFDocument;
