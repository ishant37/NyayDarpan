// Sample FRA Patta data structure
export const sampleFraData = [
  {
    id: "FRA001",
    GRAM_PANCHAYAT: "भोजपुर",
    JANPAD_PANCHAYAT: "मानपुर",
    TEHSIL: "बिछिया",
    DISTRICT: "मंडला",
    SERIAL_NO: "125/2025",
    DATE: "25/05/2019",
    HOLDER_NAME: "बुधनी बाई गोंड",
    FATHER_NAME: "स्व. फूल सिंह गोंड",
    KHASRA_NO: "88/4",
    TOTAL_AREA_SQFT: "2500",
    BOUNDARY_EAST: "सुरेश वर्मा का मकान",
    BOUNDARY_WEST: "स्कूल की बाउंड्री",
    BOUNDARY_NORTH: "ग्राम पंचायत मार्ग",
    BOUNDARY_SOUTH: "नरेश तिवारी का खेत",
    // Additional fields from the new document
    CASTE: "गोंड",
    CATEGORY: "अनुसूचित जनजाति",
    AGE: "52 वर्ष",
    RESIDENCY_DURATION: "40 वर्षों से ग्राम भोजपुर में",
    IDENTIFICATION_NUMBER: "22",
    PANCHAYAT_REGISTERED_NUMBER: "431",
    WARD_NUMBER: "03",
    HOUSE_NUMBER: "42",
    VILLAGE: "भोजपुर",
    POST: "भोजपुर",
    ADDRESS_TEHSIL: "गौहरगंज",
    ADDRESS_DISTRICT: "रायसेन",
    DIMENSIONS_EAST_WEST: "50 फीट",
    DIMENSIONS_NORTH_SOUTH: "50 फीट",
    CONSTRUCTION_YEAR: "2019",
    REGISTER_ENTRY_NUMBER: "22"
  }
];

// FRA Patta data structure interface - Updated with new fields
export const fraDataStructure = {
  // Document Details
  id: "string", // Unique identifier for each patta
  SERIAL_NO: "string", // Document serial number
  DATE: "string", // Format: DD/MM/YYYY - Date of issue
  
  // Administrative Details
  GRAM_PANCHAYAT: "string",
  JANPAD_PANCHAYAT: "string", 
  TEHSIL: "string",
  DISTRICT: "string",
  
  // Owner Details
  HOLDER_NAME: "string",
  FATHER_NAME: "string",
  CASTE: "string",
  CATEGORY: "string", // e.g., अनुसूचित जनजाति
  AGE: "string",
  RESIDENCY_DURATION: "string",
  
  // Property Details
  IDENTIFICATION_NUMBER: "string",
  PANCHAYAT_REGISTERED_NUMBER: "string",
  KHASRA_NO: "string",
  WARD_NUMBER: "string",
  HOUSE_NUMBER: "string",
  
  // Address Details
  VILLAGE: "string",
  POST: "string",
  ADDRESS_TEHSIL: "string", // Address tehsil (might differ from issuing tehsil)
  ADDRESS_DISTRICT: "string", // Address district
  
  // Area and Dimensions
  TOTAL_AREA_SQFT: "string",
  DIMENSIONS_EAST_WEST: "string",
  DIMENSIONS_NORTH_SOUTH: "string",
  
  // Boundaries
  BOUNDARY_EAST: "string",
  BOUNDARY_WEST: "string",
  BOUNDARY_NORTH: "string",
  BOUNDARY_SOUTH: "string",
  
  // Additional Information
  CONSTRUCTION_YEAR: "string",
  REGISTER_ENTRY_NUMBER: "string"
};