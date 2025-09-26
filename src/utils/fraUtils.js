import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID for FRA patta
export const generateFraId = () => {
  return `FRA${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
};

// Generate QR code with verification data
export const generateQRCode = async (fraData) => {
  try {
    // Create verification data object
    const verificationData = {
      id: fraData.id,
      holderName: fraData.HOLDER_NAME,
      fatherName: fraData.FATHER_NAME,
      khasraNo: fraData.KHASRA_NO,
      date: fraData.DATE,
      district: fraData.DISTRICT,
      verifyUrl: `https://fra-verification.gov.in/verify/${fraData.id}` // Example verification URL
    };

    // Convert to JSON string
    const qrData = JSON.stringify(verificationData);
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Validate FRA data structure
export const validateFraData = (data) => {
  const requiredFields = [
    'GRAM_PANCHAYAT',
    'JANPAD_PANCHAYAT', 
    'TEHSIL',
    'DISTRICT',
    'DATE',
    'HOLDER_NAME',
    'FATHER_NAME',
    'KHASRA_NO',
    'TOTAL_AREA_SQFT',
    'BOUNDARY_EAST',
    'BOUNDARY_WEST',
    'BOUNDARY_NORTH',
    'BOUNDARY_SOUTH'
  ];

  const errors = [];

  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  // Validate date format (DD/MM/YYYY)
  if (data.DATE) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(data.DATE)) {
      errors.push('DATE must be in DD/MM/YYYY format');
    }
  }

  // Validate area is a number
  if (data.TOTAL_AREA_SQFT && isNaN(data.TOTAL_AREA_SQFT)) {
    errors.push('TOTAL_AREA_SQFT must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};