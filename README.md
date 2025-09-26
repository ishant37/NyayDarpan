# FRA Patta Generator

A React application for generating PDF documents from JSON data for Forest Rights Act (FRA) Patta certificates.

## Features

- ✅ **Sample Data**: Pre-loaded sample FRA patta data for quick testing
- ✅ **Custom JSON Input**: Input your own JSON data in the required format
- ✅ **PDF Generation**: High-quality PDF generation using jsPDF and html2canvas
- ✅ **QR Code Integration**: Each patta includes a QR code for verification
- ✅ **Data Validation**: Input validation to ensure all required fields are present
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Hindi Language Support**: Proper rendering of Devanagari script

## Installation

1. Navigate to the project directory:
```bash
cd "d:\React\JSON to Pdf\fra-patta-generator"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## Usage

### Using Sample Data
1. Click on the "Sample Data" tab
2. Select one of the pre-loaded FRA patta records
3. Preview the generated document
4. Click "Download PDF" to generate and download the certificate

### Using Custom JSON Data
1. Click on the "Custom JSON" tab
2. Paste your JSON data in the required format (see below)
3. Click "Load JSON Data" to validate and load the data
4. Preview the generated document
5. Click "Download PDF" to generate and download the certificate

## JSON Data Format

The application expects JSON data in the following format:

```json
{
  "id": "FRA001", // Auto-generated if not provided
  "GRAM_PANCHAYAT": "खामखेड़ा़",
  "JANPAD_PANCHAYAT": "आष्टा.",
  "TEHSIL": "अष्ा",
  "DISTRICT": "सीहोर",
  "SERIAL_NO": null, // Optional field
  "DATE": "28/08/2015", // Format: DD/MM/YYYY
  "HOLDER_NAME": "मोहन सिह़",
  "FATHER_NAME": "सोहन सिंह",
  "KHASRA_NO": "152/1",
  "TOTAL_AREA_SQFT": "2400",
  "BOUNDARY_EAST": "मुख्य रड़क",
  "BOUNDARY_WEST": "रामलाल का खेत",
  "BOUNDARY_NORTH": "पंचायत भवन",
  "BOUNDARY_SOUTH": "खाली भूमि"
}
```

### Required Fields
All fields except `SERIAL_NO` are required. The application will validate your input and show errors if any required fields are missing.

## QR Code Verification

Each generated PDF includes a QR code that contains:
- Patta ID
- Holder name
- Father's name
- Khasra number
- Date
- District
- Verification URL (example: `https://fra-verification.gov.in/verify/{id}`)

## Technologies Used

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling framework
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **qrcode** - QR code generation
- **uuid** - Unique identifier generation

## Build for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
