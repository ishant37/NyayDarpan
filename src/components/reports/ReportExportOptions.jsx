import React, { useState } from 'react';
import { Calendar, Download, FileText, Filter, Settings, ShieldCheck, HardDriveDownload, X } from 'lucide-react';

// --- Official Government Theme for Report Exports ---

const ReportExportOptions = ({ 
  onExport, 
  isExporting = false, 
  availableFormats = ['pdf', 'excel', 'csv', 'package'],
  onClose 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    includeCharts: true,
    includeDistrictData: true,
    includeMonthlyTrends: true,
    includeTribalData: true,
    orientation: 'portrait',
    quality: 'high'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- Official Themed Options ---
  const formatOptions = [
    { 
      value: 'pdf', 
      label: 'PDF Document', 
      description: 'Official, print-ready report',
      icon: <FileText className="w-6 h-6 text-red-700" />,
      theme: {
        border: 'border-red-200',
        bg: 'bg-red-50',
        selectedBorder: 'border-red-600',
        selectedBg: 'bg-red-100',
      }
    },
    { 
      value: 'excel', 
      label: 'Excel Spreadsheet', 
      description: 'For detailed data analysis',
      icon: <img src="https://img.icons8.com/color/48/microsoft-excel-2019--v1.png" alt="Excel Icon" className="w-8 h-8" />, // Using a standard Excel icon
      theme: {
        border: 'border-green-200',
        bg: 'bg-green-50',
        selectedBorder: 'border-green-700',
        selectedBg: 'bg-green-100',
      }
    },
    { 
      value: 'csv', 
      label: 'CSV Data File', 
      description: 'For raw data import/export',
      icon: <HardDriveDownload className="w-6 h-6 text-blue-700" />,
      theme: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        selectedBorder: 'border-blue-700',
        selectedBg: 'bg-blue-100',
      }
    },
    { 
      value: 'package', 
      label: 'Complete Package (.zip)', 
      description: 'All formats and data',
      icon: <img src="https://img.icons8.com/plasticine/100/folder-invoices.png" alt="Package Icon" className="w-8 h-8"/>,
      theme: {
        border: 'border-gray-300',
        bg: 'bg-gray-100',
        selectedBorder: 'border-gray-800',
        selectedBg: 'bg-gray-200',
      }
    }
  ];

  const handleExport = () => {
    const exportOptions = {
      format: selectedFormat,
      dateRange,
      filters,
      filename: `FRA_Report_${dateRange.startDate}_to_${dateRange.endDate}`
    };
    onExport(exportOptions);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative font-sans">
      {/* Backdrop Blur Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      
      {/* Main Export Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-300">
          
          {/* Official Header */}
          <div className="relative px-6 py-4 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                alt="National Emblem of India" 
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Generate Official Report
                </h3>
                <p className="text-sm text-gray-600">Forest Rights Act (FRA) Data Portal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Format Selection */}
            <div>
              <label className="text-base font-semibold text-gray-700 mb-3 block">1. Select Export Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formatOptions.filter(f => availableFormats.includes(f.value)).map((format) => (
                  <label key={format.value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-md transition-all duration-200 flex items-center space-x-3 ${
                      selectedFormat === format.value
                        ? `${format.theme.selectedBorder} ${format.theme.selectedBg} shadow-md`
                        : `${format.theme.border} ${format.theme.bg} hover:border-gray-400`
                    }`}>
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">{format.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{format.label}</div>
                        <div className="text-gray-600 text-xs">{format.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <label className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                2. Select Report Period
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Content Filters */}
            <div>
              <label className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-green-700" />
                3. Include in Report
              </label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { key: 'includeCharts', label: 'Charts & Graphs' },
                  { key: 'includeDistrictData', label: 'District-wise Analysis' },
                  { key: 'includeMonthlyTrends', label: 'Monthly Trends' },
                  { key: 'includeTribalData', label: 'Tribal Community Data' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[option.key]}
                      onChange={(e) => handleFilterChange(option.key, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer & Export Button */}
          <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 mt-auto flex items-center justify-between">
            <div className="flex items-center text-sm text-green-800">
              <ShieldCheck className="w-5 h-5 mr-2" />
              <span>Official Government Report</span>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-md transition-all duration-200 shadow-md ${
                isExporting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  <span>Download Report</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportExportOptions;
