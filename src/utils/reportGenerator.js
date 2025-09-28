import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Advanced Report Generator for FRA Dashboard
 * Supports multiple export formats: PDF, Excel, CSV
 */
class ReportGenerator {
  constructor() {
    this.defaultOptions = {
      format: 'pdf', // 'pdf', 'excel', 'csv'
      quality: 2, // Canvas scale for better quality
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      paperSize: 'a4',
      orientation: 'portrait', // 'portrait', 'landscape'
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      filename: `FRA_Report_${new Date().toISOString().slice(0, 10)}`
    };
  }

  /**
   * Generate PDF report from HTML element
   */
  async generatePDFReport(elementId, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      // Show loading state
      this.showLoadingState(true);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Optimize element for PDF generation
      await this.optimizeElementForPDF(element);

      // Generate canvas with high quality
      const canvas = await html2canvas(element, {
        scale: config.quality,
        backgroundColor: config.backgroundColor,
        useCORS: config.useCORS,
        allowTaint: config.allowTaint,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with proper sizing
      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'px',
        format: config.orientation === 'portrait' 
          ? [imgWidth + config.margins.left + config.margins.right, imgHeight + config.margins.top + config.margins.bottom]
          : [imgHeight + config.margins.top + config.margins.bottom, imgWidth + config.margins.left + config.margins.right]
      });

      // Add image to PDF
      pdf.addImage(
        imgData, 
        'PNG', 
        config.margins.left, 
        config.margins.top, 
        imgWidth, 
        imgHeight,
        undefined,
        'FAST'
      );

      // Add metadata
      pdf.setProperties({
        title: 'Forest Rights Act Report',
        subject: 'FRA Performance Analysis',
        author: 'FRA Management System',
        creator: 'FRA Dashboard',
        producer: 'FRA Report Generator'
      });

      // Save the PDF
      pdf.save(`${config.filename}.pdf`);

      this.showLoadingState(false);
      return { success: true, message: 'PDF report generated successfully' };

    } catch (error) {
      this.showLoadingState(false);
      console.error('PDF Generation Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate Excel report from data
   */
  async generateExcelReport(data, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      this.showLoadingState(true);

      // Create new workbook
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = this.prepareSummaryData(data);
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      this.styleWorksheet(summaryWS, 'Summary');
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

      // District Performance Sheet
      if (data.districtPerformance && data.districtPerformance.length > 0) {
        const districtWS = XLSX.utils.json_to_sheet(data.districtPerformance);
        this.styleWorksheet(districtWS, 'Districts');
        XLSX.utils.book_append_sheet(workbook, districtWS, 'District Performance');
      }

      // Monthly Data Sheet
      if (data.monthlyData && data.monthlyData.length > 0) {
        const monthlyWS = XLSX.utils.json_to_sheet(data.monthlyData);
        this.styleWorksheet(monthlyWS, 'Monthly');
        XLSX.utils.book_append_sheet(workbook, monthlyWS, 'Monthly Trends');
      }

      // Tribal Communities Sheet
      if (data.tribalCommunityDistribution && data.tribalCommunityDistribution.length > 0) {
        const tribalWS = XLSX.utils.json_to_sheet(data.tribalCommunityDistribution);
        this.styleWorksheet(tribalWS, 'Tribal');
        XLSX.utils.book_append_sheet(workbook, tribalWS, 'Tribal Communities');
      }

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      saveAs(blob, `${config.filename}.xlsx`);

      this.showLoadingState(false);
      return { success: true, message: 'Excel report generated successfully' };

    } catch (error) {
      this.showLoadingState(false);
      console.error('Excel Generation Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate CSV report from data
   */
  async generateCSVReport(data, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      this.showLoadingState(true);

      // Prepare CSV data based on the sheet type requested
      let csvData = [];
      const sheetType = options.sheetType || 'summary';

      switch (sheetType) {
        case 'districts':
          csvData = data.districtPerformance || [];
          break;
        case 'monthly':
          csvData = data.monthlyData || [];
          break;
        case 'tribal':
          csvData = data.tribalCommunityDistribution || [];
          break;
        default:
          csvData = this.prepareSummaryData(data);
      }

      // Convert to CSV
      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${config.filename}_${sheetType}.csv`);

      this.showLoadingState(false);
      return { success: true, message: 'CSV report generated successfully' };

    } catch (error) {
      this.showLoadingState(false);
      console.error('CSV Generation Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate comprehensive report package (PDF + Excel)
   */
  async generateReportPackage(elementId, data, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      this.showLoadingState(true, 'Generating comprehensive report package...');

      const results = [];

      // Generate PDF
      const pdfResult = await this.generatePDFReport(elementId, {
        ...config,
        filename: `${config.filename}_Report`
      });
      results.push({ type: 'PDF', ...pdfResult });

      // Generate Excel
      const excelResult = await this.generateExcelReport(data, {
        ...config,
        filename: `${config.filename}_Data`
      });
      results.push({ type: 'Excel', ...excelResult });

      // Generate CSV summaries
      const csvResult = await this.generateCSVReport(data, {
        ...config,
        filename: `${config.filename}_Summary`,
        sheetType: 'summary'
      });
      results.push({ type: 'CSV', ...csvResult });

      this.showLoadingState(false);
      return { success: true, results, message: 'Report package generated successfully' };

    } catch (error) {
      this.showLoadingState(false);
      console.error('Report Package Generation Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Prepare summary data for Excel/CSV export
   */
  prepareSummaryData(data) {
    const {
      claimsReceived = {},
      titlesDistributed = {},
      landDistributedAcres = {}
    } = data;

    return [
      {
        Metric: 'Total Claims Received',
        Total: claimsReceived.total || 0,
        Individual_IFR: claimsReceived.individual || 0,
        Community_CFR: claimsReceived.community || 0,
        Unit: 'claims'
      },
      {
        Metric: 'Titles Distributed',
        Total: titlesDistributed.total || 0,
        Individual_IFR: titlesDistributed.individual || 0,
        Community_CFR: titlesDistributed.community || 0,
        Unit: 'titles'
      },
      {
        Metric: 'Land Distributed',
        Total: Math.round(landDistributedAcres.total || 0),
        Individual_IFR: Math.round(landDistributedAcres.individual || 0),
        Community_CFR: Math.round(landDistributedAcres.community || 0),
        Unit: 'acres'
      },
      {
        Metric: 'Processing Efficiency',
        Total: ((titlesDistributed.total || 0) / (claimsReceived.total || 1) * 100).toFixed(2),
        Individual_IFR: ((titlesDistributed.individual || 0) / (claimsReceived.individual || 1) * 100).toFixed(2),
        Community_CFR: ((titlesDistributed.community || 0) / (claimsReceived.community || 1) * 100).toFixed(2),
        Unit: 'percentage'
      }
    ];
  }

  /**
   * Style Excel worksheet
   */
  styleWorksheet(worksheet, sheetType) {
    // Add basic styling - header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
    
    // Set column widths
    const columnWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      columnWidths.push({ width: 15 });
    }
    worksheet['!cols'] = columnWidths;

    // Add autofilter
    worksheet['!autofilter'] = { ref: worksheet['!ref'] };
  }

  /**
   * Optimize element for PDF generation
   */
  async optimizeElementForPDF(element) {
    // Ensure all images are loaded
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    await Promise.all(imagePromises);

    // Wait for charts to render
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Show loading state
   */
  showLoadingState(show, message = 'Generating report...') {
    let loader = document.getElementById('report-loader');
    
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'report-loader';
        loader.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                      background: rgba(0,0,0,0.5); z-index: 10000; display: flex; 
                      align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 8px; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
              <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; 
                          border-top: 4px solid #3b82f6; border-radius: 50%; 
                          animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
              <p style="margin: 0; font-weight: 500; color: #374151;">${message}</p>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(loader);
      }
    } else {
      if (loader) {
        loader.remove();
      }
    }
  }
}

// Export utility functions
export const reportGenerator = new ReportGenerator();

export const generatePDFReport = (elementId, options) => {
  return reportGenerator.generatePDFReport(elementId, options);
};

export const generateExcelReport = (data, options) => {
  return reportGenerator.generateExcelReport(data, options);
};

export const generateCSVReport = (data, options) => {
  return reportGenerator.generateCSVReport(data, options);
};

export const generateReportPackage = (elementId, data, options) => {
  return reportGenerator.generateReportPackage(elementId, data, options);
};

export default ReportGenerator;