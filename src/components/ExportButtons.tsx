import React from 'react';
import { Download, FileText, Image } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToPDF, exportChartToPDF } from '../utils/pdfExport';

interface ExportButtonsProps {
  data?: any;
  chartRef?: React.RefObject<HTMLDivElement>;
  title: string;
  additionalData?: any;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  data, 
  chartRef, 
  title, 
  additionalData 
}) => {
  const exportToExcel = () => {
    if (!data) return;

    const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportPDF = async () => {
    const chartElement = chartRef?.current;
    if (chartElement) {
      await exportChartToPDF(title, chartElement, additionalData);
    } else if (data) {
      await exportToPDF(title, data);
    }
  };

  const downloadChart = async () => {
    if (!chartRef?.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  return (
    <div className="flex space-x-2">
      {data && (
        <button
          onClick={exportToExcel}
          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <FileText className="h-4 w-4" />
          <span>Excel</span>
        </button>
      )}
      
      <button
        onClick={exportPDF}
        className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
      >
        <Download className="h-4 w-4" />
        <span>PDF</span>
      </button>

      {chartRef && (
        <button
          onClick={downloadChart}
          className="flex items-center space-x-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Image className="h-4 w-4" />
          <span>PNG</span>
        </button>
      )}
    </div>
  );
};

export default ExportButtons;