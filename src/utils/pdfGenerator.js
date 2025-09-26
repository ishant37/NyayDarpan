import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Get settings from localStorage (fallback for settings context)
const getSettings = () => {
  const savedSettings = localStorage.getItem('fraPattaSettings');
  return savedSettings ? JSON.parse(savedSettings) : {
    pdfQuality: 'high',
    pdfPageSize: 'a4',
    compressionLevel: 85,
    watermark: true
  };
};

// Generate and download PDF from HTML element with dynamic settings
export const generatePDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const settings = getSettings();
    
    // Quality mapping
    const qualityMap = {
      low: { scale: 1, quality: 0.6 },
      medium: { scale: 1.5, quality: 0.8 },
      high: { scale: 2, quality: 0.92 },
      ultra: { scale: 3, quality: 0.98 }
    };

    // Page size mapping (width x height in mm)
    const pageSizeMap = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      letter: { width: 216, height: 279 }
    };

    const quality = qualityMap[settings.pdfQuality] || qualityMap.high;
    const pageSize = pageSizeMap[settings.pdfPageSize] || pageSizeMap.a4;

    // Configure html2canvas options based on settings
    const canvas = await html2canvas(element, {
      scale: quality.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false // Disable console logs
    });

    const imgData = canvas.toDataURL('image/png', quality.quality);
    
    // Calculate PDF dimensions
    const imgWidth = pageSize.width;
    const pageHeight = pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF instance with dynamic page size
    const pdf = new jsPDF('portrait', 'mm', [pageSize.width, pageSize.height]);
    
    // Add metadata
    pdf.setProperties({
      title: `FRA Patta - ${filename}`,
      subject: 'Forest Rights Act Individual Title',
      author: 'Ministry of Environment, Forest and Climate Change',
      creator: 'FRA Patta Generator v1.0.0'
    });
    
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add watermark if enabled
    if (settings.watermark) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setGState(pdf.GState({ opacity: 0.1 }));
        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(40);
        pdf.text('GOVERNMENT OF INDIA', pageSize.width / 2, pageSize.height / 2, {
          angle: 45,
          align: 'center'
        });
      }
    }

    // Apply compression
    if (settings.compressionLevel < 100) {
      // Note: jsPDF compression is limited, but we can adjust image quality
      const compressionRatio = settings.compressionLevel / 100;
      // Reprocess image with compression
      const compressedImgData = canvas.toDataURL('image/jpeg', compressionRatio);
      // Recreate PDF with compressed image (simplified for demo)
    }

    // Save the PDF with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename = filename.includes('.pdf') ? filename : `${filename}_${timestamp}.pdf`;
    
    pdf.save(finalFilename);
    
    return {
      success: true,
      filename: finalFilename,
      size: pdf.output('blob').size,
      pages: pdf.getNumberOfPages(),
      quality: settings.pdfQuality,
      pageSize: settings.pdfPageSize
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate filename for FRA patta PDF

export const generatePDFFilename = (fraData) => {
  const sanitizedName = fraData.HOLDER_NAME.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
  const sanitizedId = fraData.id.replace(/[^a-zA-Z0-9]/g, '_');
  return `FRA_Patta_${sanitizedId}_${sanitizedName}.pdf`;
};

// Batch PDF generation for multiple FRA records
export const generateBatchPDF = async (fraDataArray, onProgress) => {
  const results = [];
  
  for (let i = 0; i < fraDataArray.length; i++) {
    const data = fraDataArray[i];
    
    try {
      // Update progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: fraDataArray.length,
          currentItem: data.HOLDER_NAME
        });
      }

      const filename = generatePDFFilename(data);
      const result = await generatePDF('fra-patta-template', filename);
      
      results.push({
        id: data.id,
        filename,
        ...result
      });

      // Small delay between generations to prevent browser overload
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({
        id: data.id,
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }

  return results;
};