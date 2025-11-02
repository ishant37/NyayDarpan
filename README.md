# NyayDarpan

### AI-Powered FRA Atlas & Decision Support System

[](https://sih.gov.in/) [](https://react.dev/) [](https://vitejs.dev/) [](https://mui.com/) [](https://leafletjs.com/)

**NyayDarpan** is the frontend prototype for an **AI-powered Forest Rights Act (FRA) Atlas and WebGIS-based Decision Support System (DSS)**. It is designed to digitize, monitor, and streamline the entire workflow of managing FRA claims for the states of Madhya Pradesh, Tripura, Odisha, and Telangana.

This system converts scattered legacy records into a verifiable database, provides a multi-layered geospatial atlas for monitoring, and includes an AI-driven DSS to help officials make informed decisions and converge welfare schemes.

## Key Features

Based on the project files, this prototype includes:

  * **Secure Authentication:** A complete, secure login system (`LoginModal.jsx`, `AuthWrapper.jsx`) with session persistence and different roles for officials.
  * **Comprehensive Dashboard:** A central hub (`Dashboard.jsx`) showing key statistics (claims received, titles disposed, land distributed) using data from `allStatesData.js`. It features interactive charts from **Recharts** for:
      * Claims Status Distribution (Pie Chart)
      * Monthly Claims Processing (Line Chart)
      * District-wise Performance (Bar Chart)
      * Tribal Community Distribution
  * **Advanced Geospatial Atlas:** A powerful multi-map module (`Map.jsx`) that allows switching between three different map types:
      * **Cadastrial Map (`CadastrialMap.jsx`):** Visualizes official district boundaries, plots (using Balaghat data), and FRA claim statistics.
      * **Asset Map (`AssestMap.jsx`):** An enhanced satellite view for asset and infrastructure analysis, including a **3D Plot Viewer** (`plot3dview.jsx`) for terrain visualization.
      * **Topographical Map (`TopoGraphicalMap.jsx`):** A detailed WebGIS platform showing village-level GeoJSON data, land classification (Forest, Potential FRA, Reservoir), and interactive plot details.
  * **Document Digitization & e-Patta Generation:**
      * **Document Scanner (`ScanDoc.jsx`):** Simulates scanning a physical Patta document (`claim_photo.jpeg`), extracts its data (from `fraData.js`), and links it to a "Bhu-Aadhaar" (`aadhar_card.avif`).
      * **Digital Patta Generator (`FraPattaTemplate.jsx`, `pdfGenerator.js`):** Dynamically generates a professional, verifiable e-Patta certificate as a PDF, complete with official seal (`seal.jpg`), signature (`signature.png`), and a scannable QR code (`fraUtils.js`).
  * **AI Decision Support System (DSS):** A complete module (`DecisionSupportSystem.jsx`) to guide officials:
      * **DSS Agent Runner (`DSSAgentRunner.jsx`):** Simulates an AI agent analyzing a region with rich visuals (`AnalyzingMapVisual.jsx`, `FetchingDataVisual.jsx`).
      * \*\*DSS Results (`DSSResultsDisplay.jsx`):\*\*Presents a list of recommended government schemes (from `dssData.js`) based on the analysis.
      * **Impact Heatmap (`EnhancedHeatmapModal.jsx`):** A modal that visualizes high-impact hotspots for a selected scheme or displays the user's specific scanned property on the map.
  * **Full Claim Lifecycle Management:**
      * **Apply for Claim (`ApplyClaim.jsx`):** A complete form for submitting new Individual or Community Forest Rights claims.
      * **Pending Claims (`PendingClaims.jsx`):** A list of all claims awaiting action (from `pendingClaimsData.js`).
      * **Claim Approval Workflow (`ClaimDetail.jsx`):** A detailed, step-by-step interface for officials to review evidence, upload documents, and approve a claim through various stages (Gram Sabha, FRC, SDLC, DLC).
  * **Dynamic Reporting & Settings:**
      * **Export Studio (`ReportExportOptions.jsx`):** A powerful modal to generate and export official reports from the dashboard data as **PDF, Excel, and CSV** files (`reportGenerator.js`).
      * **Settings Panel (`Settings.jsx`):** Allows users to configure PDF quality, page size, watermarks, and simulated email notifications (`notificationService.js`).

## Technology Stack

This prototype is a pure frontend application built with **React** and **Vite**, using mock data to simulate a full backend.

  * **Core:** React 19, Vite, React Router DOM
  * **UI Framework:** Material-UI (MUI), Lucide-React
  * **Styling:** Tailwind CSS, Emotion
  * **Mapping:** Leaflet, React-Leaflet
  * **Data Visualization:** Recharts, Plotly.js, Chart.js
  * **3D Visualization:** Three.js, React Three Fiber, Drei
  * **Utilities:** jsPDF, html2canvas (for PDF generation), QRcode, File-Saver, Zustand

## Getting Started

### 1\. Clone the Repository

```bash
git clone https://github.com/ishant37/nyaydarpan.git
cd nyaydarpan
```

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or your next available port).

### 4\. Test Credentials

A working login system is implemented. Use these credentials from the project documentation to access the dashboard:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `ishant` | `Password@123` |
| **Officer** | `admin` | `Password@456` |

## Project Structure

```
/
├── public/                  # Static assets (favicon)
├── src/
│   ├── assets/              # Images, seals, signatures, mock data photos
│   ├── components/          # Reusable components (Navbar, Layout, Reports)
│   ├── data/                # Mock data (claims, dashboard stats, geojson)
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Top-level page components (routes)
│   │   ├── dss/             # Decision Support System components
│   │   └── Maps/            # All map components (Cadastrial, Asset, Topo)
│   ├── utils/               # Helper functions (pdfGenerator, reportGenerator, etc.)
│   ├── App.jsx              # Main app component with router setup
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles & Tailwind imports
│
├── .gitignore
├── index.html               # Vite HTML entry point
├── package.json             # Project dependencies
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Deployment

This project is configured for seamless deployment on **Vercel**.

1.  Push your code to a Git repository.
2.  Import the project into your Vercel dashboard.
3.  Vercel will automatically detect it as a **Vite** project.
4.  Use the default build command (`npm run build`) and output directory (`dist`).
5.  Click **Deploy**.
