import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { allStatesData } from "../data/allStatesData";
import { claimsData as pendingClaimsData } from "../data/pendingClaimsData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  FileText,
  CheckSquare,
  Trees,
  Download,
  Loader,
  Users,
  User,
  Bell,
  PieChart as PieChartIcon,
  BarChartHorizontal,
  Users2,
  Search,
  Sun,
  Moon,
  Settings,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import new report system
import ReportTemplate from "../components/reports/ReportTemplate.jsx";
import ReportExportOptions from "../components/reports/ReportExportOptions.jsx";
import { reportGenerator } from "../utils/reportGenerator.js";

// --- Helper Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-800 flex items-center gap-3 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", className = "", isLoading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} px-4 py-2 ${className}`} disabled={isLoading} {...props}>
      {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

const SummaryCard = ({ title, icon, total, ifr, cfr, unit }) => (
    <Card>
        <CardHeader><CardTitle>{icon}<span>{title}</span></CardTitle></CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-gray-900">
                {total.toLocaleString()}
                <span className="text-xl font-medium text-gray-500 ml-2">{unit}</span>
            </p>
            <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-600"><User className="w-4 h-4 mr-2 text-blue-500" />Individual (IFR)</span>
                    <span className="font-semibold text-gray-800">{ifr.toLocaleString()} {unit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-gray-600"><Users className="w-4 h-4 mr-2 text-green-500" />Community (CFR)</span>
                    <span className="font-semibold text-gray-800">{cfr.toLocaleString()} {unit}</span>
                </div>
            </div>
        </CardContent>
    </Card>
);

const DashboardHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 min-w-0">
            {/* Can add a logo or title here if needed */}
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="w-full max-w-lg lg:max-w-md">
  <label htmlFor="search" className="sr-only">Search</label>
  <div className="relative">
    {/* Search Icon */}
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </div>

    {/* Input */}
    <input
      id="search"
      name="search"
      type="search"
      placeholder="Search Claims, Documents, Villages..."
      className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-12 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-900 transition duration-200"
    />

    {/* Clear Button */}
    <button
      type="button"
      className="absolute inset-y-0 right-2 flex items-center pr-2 text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  </div>
</div>

          </div>
          <div className="flex items-center gap-2 ml-4">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <Sun className="w-5 h-5"/>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors relative">
                <Bell className="w-5 h-5"/>
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </button>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <img className="h-8 w-8 rounded-full object-cover" src="https://avatars.githubusercontent.com/u/143737164?v=4" alt="User" />
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Main Dashboard Component ---

const getInitialStateData = (stateKey) => {
  const data = allStatesData[stateKey] || {};
  return { ...data, districts: data.districts || [], monthlyData: data.monthlyData || [], districtPerformance: data.districtPerformance || [], tribalCommunityDistribution: data.tribalCommunityDistribution || [] };
};

export default function Dashboard() {
  const [selectedState, setSelectedState] = useState("madhya-pradesh");
  const [dashboardData, setDashboardData] = useState(() => getInitialStateData(selectedState));
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const pendingClaimsCount = pendingClaimsData.length;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setDashboardData(getInitialStateData(selectedState));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedState]);

  // Close export options when clicking outside (removed since we have modal with backdrop)
  useEffect(() => {
    // Handle escape key to close modal
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showReportOptions) {
        setShowReportOptions(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showReportOptions]);

  const handleExportPDF = () => {
    setIsExporting(true);
    const dashboardElement = document.getElementById("dashboard-content");
    html2canvas(dashboardElement, { scale: 2, useCORS: true, backgroundColor: "#f9fafb" })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`FRA_Dashboard_${selectedState}_${new Date().toISOString().slice(0, 10)}.pdf`);
        setIsExporting(false);
      })
      .catch((err) => {
        console.error("Failed to export PDF", err);
        setIsExporting(false);
        alert("Sorry, there was an error exporting the report.");
      });
  };

  // New advanced export handler
  const handleAdvancedExport = async (options) => {
    setIsExporting(true);
    
    try {
      const reportData = {
        ...dashboardData,
        donutData,
        claimTypeData,
        selectedState
      };

      let result;
      switch (options.format) {
        case 'pdf':
          result = await reportGenerator.generatePDFReport('report-template', options);
          break;
        case 'excel':
          result = await reportGenerator.generateExcelReport(reportData, options);
          break;
        case 'csv':
          result = await reportGenerator.generateCSVReport(reportData, options);
          break;
        case 'package':
          result = await reportGenerator.generateReportPackage('report-template', reportData, options);
          break;
        default:
          throw new Error('Invalid format selected');
      }

      if (result.success) {
        // Show success message
        alert(result.message);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setShowReportOptions(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-900"></div></div>;
  }

  const { claimsReceived, titlesDistributed, landDistributedAcres, districtPerformance, tribalCommunityDistribution } = dashboardData;
  const totalClaims = claimsReceived?.total || 0;
  const approvedClaims = titlesDistributed?.total || 0;
  const pendingForChart = totalClaims - approvedClaims; 

  const donutData = [{ name: "Approved", value: approvedClaims, color: "#22c55e" }, { name: "Pending/Rejected", value: pendingForChart, color: "#f59e0b" }];
  const claimTypeData = [{ name: 'IFR', value: claimsReceived?.individual || 0, color: '#3b82f6' }, { name: 'CFR', value: claimsReceived?.community || 0, color: '#16a34a' }];

  const handleStateChange = (event) => setSelectedState(event.target.value);

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader />
      <main id="dashboard-content" className="p-4 sm:p-6 lg:p-8">
        {pendingClaimsCount > 0 && (
          <Link to="/pending-claims" className="block mb-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg shadow-md hover:bg-yellow-200 transition-colors flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="w-6 h-6 mr-3 animate-pulse" />
                <div>
                  <p className="font-bold">{pendingClaimsCount} Pending Claims Require Action</p>
                  <p className="text-sm">Click here to review and process the claims.</p>
                </div>
              </div>
              <span className="text-sm font-semibold">View Claims &rarr;</span>
            </div>
          </Link>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
         <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
  {/* Emblem */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
    alt="National Emblem of India"
    className="h-16 w-auto"
  />

  {/* Text Section */}
  <div>
    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
      Forest Rights Act Dashboard
    </h1>
    <p className="mt-1 text-sm text-gray-600 italic">
      Comprehensive overview for{" "}
      <span className="font-medium text-gray-800">
        {selectedState.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>.
    </p>
  </div>
</div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <select value={selectedState} onChange={handleStateChange} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option value="madhya-pradesh">Madhya Pradesh</option>
              <option value="odisha">Odisha</option>
              <option value="telangana">Telangana</option>
              
            </select>
            
            {/* Export Options */}
            <div className="relative export-options-container">
              <Button 
                variant="outline" 
                onClick={() => setShowReportOptions(!showReportOptions)}
                className="flex items-center bg-gradient-to-r from-red-500 to-indigo-600 text-black border-3px solid red"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Export Studio
                <span className={`ml-2 transition-transform duration-300 ${showReportOptions ? 'rotate-180' : ''}`}>⚡</span>
              </Button>
            </div>

            <Button variant="outline" onClick={handleExportPDF} isLoading={isExporting} className="hover:shadow-md transition-all">
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Quick PDF"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SummaryCard title="Total Claims Received" icon={<FileText className="w-6 h-6 text-gray-400"/>} total={claimsReceived?.total || 0} ifr={claimsReceived?.individual || 0} cfr={claimsReceived?.community || 0} unit="claims"/>
          <SummaryCard title="Titles Disposed" icon={<CheckSquare className="w-6 h-6 text-gray-400"/>} total={titlesDistributed?.total || 0} ifr={titlesDistributed?.individual || 0} cfr={titlesDistributed?.community || 0} unit="titles"/>
          <SummaryCard title="Forest Land Distributed" icon={<Trees className="w-6 h-6 text-gray-400"/>} total={Math.round(landDistributedAcres?.total || 0)} ifr={Math.round(landDistributedAcres?.individual || 0)} cfr={Math.round(landDistributedAcres?.community || 0)} unit="acres"/>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Claims Status Distribution</CardTitle><CardDescription>Current status of all submitted claims</CardDescription></CardHeader><CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" dataKey="value" paddingAngle={5}>{donutData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color}/>))}</Pie><Tooltip contentStyle={{backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.75rem"}} /></PieChart></ResponsiveContainer>
              <div className="flex justify-center items-center gap-4 text-xs text-gray-600 -mt-4">{donutData.map((item) => (<div key={item.name} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span><span>{item.name} ({item.value})</span></div>))}</div>
          </CardContent></Card>
          <Card className="lg:col-span-3"><CardHeader><CardTitle>Monthly Claims Processing</CardTitle><CardDescription>Processing trend over the last 12 months</CardDescription></CardHeader><CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={dashboardData.monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} /><YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.75rem"}}/><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} name="Approved" dot={false} /><Line type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} name="Pending" dot={false} />
              </LineChart></ResponsiveContainer>
          </CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card>
                <CardHeader><CardTitle><PieChartIcon className="w-5 h-5 text-gray-400"/>Claim Type Distribution</CardTitle></CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={claimTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {claimTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.75rem"}}/>
                            <Legend iconType="circle" iconSize={8}/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle><BarChartHorizontal className="w-5 h-5 text-gray-400"/>District-wise Performance</CardTitle><CardDescription>Top districts by titles disposed</CardDescription></CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtPerformance} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "0.75rem"}}/>
                            <Bar dataKey="titlesDistributed" name="Titles Disposed" fill="#8884d8" barSize={20}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle><Users2 className="w-5 h-5 text-gray-400"/>Tribal Community Distribution</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4 divide-y divide-gray-100">
                        {tribalCommunityDistribution.slice(0, 5).map(community => (
                            <div key={community.name} className="flex justify-between items-center text-sm pt-3 first:pt-0">
                                <span className="font-medium text-gray-700">{community.name}</span>
                                <span className="font-semibold text-gray-900">{community.percentage}%</span>
                            </div>
                        ))}
                         <Button variant="outline" className="w-full !mt-6 text-xs">See More</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>

      {/* Export Studio Modal */}
      {showReportOptions && (
        <ReportExportOptions
          onExport={handleAdvancedExport}
          isExporting={isExporting}
          availableFormats={['pdf', 'excel', 'csv', 'package']}
          onClose={() => setShowReportOptions(false)}
        />
      )}

      {/* Hidden Report Template for Advanced Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ReportTemplate
          reportData={{
            ...dashboardData,
            donutData,
            claimTypeData
          }}
          stateName={selectedState.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          dateRange="Last 12 Months"
          reportTitle="Forest Rights Act - Comprehensive Report"
          reportSubtitle={`Performance Analysis for ${selectedState.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        />
      </div>
    </div>
  );
}

