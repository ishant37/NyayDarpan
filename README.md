-----

# NyayDarpan - Legal Case Management System

**NyayDarpan** is a modern, AI-powered legal case and land rights management system. It is built using a high-performance stack including **React**, **Vite**, **Tailwind CSS**, and **Appwrite** for the backend.

The system is designed to digitize and streamline the entire workflow of managing legal claims, particularly for land rights under the Forest Rights Act (FRA), from application to final "Patta" generation.

-----

## 🌟 Key Features

  * **Role-Based Access Control (RBAC):** Secure login system for different user roles, including Claimants, Admin, District Level Committees (DLC), and State Level Monitoring Committees (SLMC).
  * **Comprehensive Dashboard:** A central hub showing key statistics, claim statuses, pending tasks, and data visualizations.
  * **Claim Management:** Full lifecycle management for claims, including new claim applications, tracking pending claims, and viewing detailed claim information.
  * **AI Decision Support System (DSS):** An AI-powered agent that analyzes claim data to provide recommendations, check for inconsistencies, and score claim viability.
  * **Advanced Geospatial Analysis:** A powerful mapping module with multiple layers for visualizing land data:
      * **Cadastrial Map:** For viewing official land parcel boundaries.
      * **Asset Map:** To overlay community assets and infrastructure.
      * **Topographical Map:** For understanding land elevation and terrain.
      * **3D Plot View:** A 3D visualization of specific land plots.
  * **Digital Patta Generation:** Automatically generate and export official FRA Patta (land title) documents as PDFs.
  * **Document Scanning & OCR:** A utility to scan and digitize physical documents related to a claim.
  * **Real-time Email Notifications:** Automated email alerts for claim status updates (Submitted, Approved, Rejected) using Appwrite Functions and React Email.
  * **Dynamic Reporting:** Generate and export reports on claim data.

-----

## 💻 Technology Stack

  * **Frontend:** React 18, Vite, Tailwind CSS
  * **Backend (BaaS):** Appwrite (Handles Auth, Database, Storage, and Functions)
  * **Routing:** React Router DOM
  * **Mapping:** Leaflet, React-Leaflet, @react-google-maps/api
  * **Charting:** Chart.js, Recharts
  * **PDF Generation:** jsPDF, html2canvas
  * **UI/Utils:** Shadcn/ui (components), React Icons, Tailwind Merge, React Hot Toast
  * **Deployment:** Vercel

-----

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18 or higher)
  * npm or yarn
  * An active **Appwrite Cloud** or self-hosted Appwrite instance.

### 1\. Clone the Repository

```bash
git clone https://github.com/ishant37/nyaydarpan.git
cd nyaydarpan
```

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Environment Setup

Create a `.env` file in the root of the project and add your Appwrite credentials:

```env
# Appwrite Configuration
VITE_APPWRITE_URL="https"//your-appwrite-endpoint.com/v1
VITE_APPWRITE_PROJECT_ID="your-project-id"
VITE_APPWRITE_DATABASE_ID="your-database-id"
VITE_APPWRITE_CLAIMS_COLLECTION_ID="your-claims-collection-id"
VITE_APPWRITE_PROPERTIES_COLLECTION_ID="your-properties-collection-id"
VITE_APPWRITE_USERS_COLLECTION_ID="your-users-collection-id"
VITE_APPWRITE_STORAGE_ID="your-storage-bucket-id"

# Appwrite Function IDs (for email notifications)
VITE_APPWRITE_EMAIL_FUNCTION_ID="your-email-function-id"
```

### 4\. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

-----

## 📁 Project Structure

```
/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # Reusable components (Navbar, Cards, etc.)
│   │   ├── cards/
│   │   ├── reports/
│   │   └── ui/              # Shadcn UI components
│   ├── data/                # Mock data, GeoJSON files
│   ├── lib/                 # Utility libraries (e.g., cn)
│   ├── pages/               # Top-level page components (routes)
│   │   ├── dss/             # Decision Support System components
│   │   └── Maps/            # All map-related page components
│   ├── utils/               # Helper functions (pdf, auth, etc.)
│   ├── App.jsx              # Main app component with router setup
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles & Tailwind imports
│
├── .gitignore               # Files to ignore in Git
├── index.html               # Vite HTML entry point
├── package.json             # Project dependencies
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

-----

## 📦 Deployment

This project is configured for seamless deployment on **Vercel**.

1.  Push your code to a Git repository (GitHub, GitLab, etc.).
2.  Import the project into your Vercel dashboard.
3.  Vercel will automatically detect the **Vite** framework.
4.  **Important:** Add your `.env` variables (from Step 3) to the Vercel project's "Environment Variables" settings.
5.  Click **Deploy**.

For more detailed instructions, see the `VERCEL_DEPLOYMENT_GUIDE.md` file.
