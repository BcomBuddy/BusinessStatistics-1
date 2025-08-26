import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const exportToPDF = async (
  title: string,
  data: any,
  chartElement?: HTMLElement
) => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, yPosition);
  yPosition += 20;

  // Add timestamp
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
  yPosition += 20;

  // Add chart if provided
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPosition + imgHeight > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  }

  // Add data table if available
  if (data && Array.isArray(data)) {
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }

    const tableData = data.map((item, index) => [
      index + 1,
      ...Object.values(item)
    ]);

    const tableHeaders = ['#', ...Object.keys(data[0] || {})];

    (pdf as any).autoTable({
      startY: yPosition,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });
  }

  // Add summary statistics if available
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const finalY = (pdf as any).lastAutoTable ? (pdf as any).lastAutoTable.finalY + 10 : yPosition;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Statistical Summary:', 20, finalY);

    let summaryY = finalY + 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'number') {
        pdf.text(`${key}: ${value.toFixed(4)}`, 20, summaryY);
        summaryY += 6;
      }
    });
  }

  // Save the PDF
  pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportChartToPDF = async (
  title: string,
  chartElement: HTMLElement,
  additionalData?: any
) => {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 20);

  // Add chart
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 170;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);

    // Add additional data if provided
    if (additionalData) {
      let yPos = 40 + imgHeight;
      
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Analysis:', 20, yPos);
      
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      Object.entries(additionalData).forEach(([key, value]) => {
        if (typeof value === 'number') {
          pdf.text(`${key}: ${value.toFixed(4)}`, 20, yPos);
          yPos += 6;
        } else if (typeof value === 'string') {
          pdf.text(`${key}: ${value}`, 20, yPos);
          yPos += 6;
        }
      });
    }

    pdf.save(`${title.replace(/\s+/g, '_')}_chart.pdf`);
  } catch (error) {
    console.error('Error exporting chart to PDF:', error);
  }
};