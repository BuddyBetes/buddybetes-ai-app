
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { usePDFExport } from '@/hooks/usePDFExport';
import PDFDocument from './PDFDocument';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PDFExport = () => {
  const { exportToPDF, isExporting } = usePDFExport();
  const { toast } = useToast();

  const handleExport = async (dateRange: number) => {
    try {
      const data = await exportToPDF(dateRange);
      if (!data) return;

      // Generate PDF
      const pdfDoc = <PDFDocument data={data} dateRange={dateRange} />;
      const pdfBlob = await pdf(pdfDoc).toBlob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const patientName = `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() || 'Patient';
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `glucose-report-${patientName.replace(/\s+/g, '-')}-${currentDate}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your glucose report has been downloaded.",
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-12"
          disabled={isExporting}
        >
          {isExporting ? (
            <Download className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Generating PDF...' : 'Export to PDF'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Report Period</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport(30)}>
          Last 30 days
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(90)}>
          Last 3 months
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(180)}>
          Last 6 months
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(365)}>
          Last year
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PDFExport;
