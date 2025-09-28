import React from 'react';
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
  Bar
} from 'recharts';
import { FileText, CheckSquare, Trees, User, Users, Calendar, MapPin, TrendingUp } from 'lucide-react';

const ReportTemplate = ({ 
  reportData, 
  reportTitle = "Forest Rights Act - Comprehensive Report",
  reportSubtitle = "State Performance Analysis & Statistics",
  stateName = "Selected State",
  dateRange = "Last 12 Months",
  generatedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}) => {
  const {
    claimsReceived = {},
    titlesDistributed = {},
    landDistributedAcres = {},
    monthlyData = [],
    districtPerformance = [],
    tribalCommunityDistribution = [],
    donutData = [],
    claimTypeData = []
  } = reportData || {};

  // Chart colors
  const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#16a34a', '#8b5cf6', '#f97316', '#06b6d4'];

  return (
    <div id="report-template" className="bg-white text-gray-900 max-w-6xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Report Header */}
      <div className="border-b-4 border-green-600 pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
              <Trees className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{reportTitle}</h1>
              <p className="text-lg text-gray-600">{reportSubtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">Generated on</p>
              <p className="font-semibold text-gray-900">{generatedDate}</p>
            </div>
          </div>
        </div>
        
        {/* Report Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Coverage Area</p>
              <p className="font-semibold text-blue-900">{stateName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-green-600 uppercase font-semibold">Report Period</p>
              <p className="font-semibold text-green-900">{dateRange}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600 uppercase font-semibold">Report Type</p>
              <p className="font-semibold text-purple-900">Comprehensive Analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-3 text-green-600" />
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Claims Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-blue-600 text-sm font-medium">CLAIMS RECEIVED</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-blue-900">
                {(claimsReceived.total || 0).toLocaleString()}
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Individual (IFR):</span>
                  <span className="font-semibold">{(claimsReceived.individual || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Community (CFR):</span>
                  <span className="font-semibold">{(claimsReceived.community || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Titles Distributed Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <CheckSquare className="w-8 h-8 text-green-600" />
              <span className="text-green-600 text-sm font-medium">TITLES DISTRIBUTED</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-green-900">
                {(titlesDistributed.total || 0).toLocaleString()}
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700">Individual (IFR):</span>
                  <span className="font-semibold">{(titlesDistributed.individual || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Community (CFR):</span>
                  <span className="font-semibold">{(titlesDistributed.community || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Land Distributed Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <Trees className="w-8 h-8 text-amber-600" />
              <span className="text-amber-600 text-sm font-medium">LAND DISTRIBUTED</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-amber-900">
                {Math.round(landDistributedAcres.total || 0).toLocaleString()}
                <span className="text-lg ml-1">acres</span>
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-700">Individual (IFR):</span>
                  <span className="font-semibold">{Math.round(landDistributedAcres.individual || 0).toLocaleString()} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Community (CFR):</span>
                  <span className="font-semibold">{Math.round(landDistributedAcres.community || 0).toLocaleString()} acres</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis Charts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
          Performance Analysis
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trends */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Processing Trends</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="approved" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    name="Approved"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Claims Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims Status Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* District Performance */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Districts</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={districtPerformance.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={80} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="titlesDistributed" fill="#8b5cf6" name="Titles Distributed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Claim Type Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Type Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={claimTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {claimTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tribal Community Analysis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-3 text-green-600" />
          Tribal Community Analysis
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tribalCommunityDistribution.slice(0, 8).map((community, index) => (
              <div key={community.name} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{community.name}</p>
                <p className="text-2xl font-bold text-green-600">{community.percentage}%</p>
                <p className="text-sm text-gray-600">{community.claims || 'N/A'} claims</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Performance Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">District-wise Detailed Performance</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">District</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Claims Received</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Titles Distributed</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Success Rate</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Land (Acres)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {districtPerformance.slice(0, 10).map((district, index) => (
                <tr key={district.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{district.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{(district.claimsReceived || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{(district.titlesDistributed || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (district.successRate || 0) >= 80 ? 'bg-green-100 text-green-800' :
                      (district.successRate || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(district.successRate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{Math.round(district.landDistributed || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Insights</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Total processing efficiency: {((titlesDistributed.total || 0) / (claimsReceived.total || 1) * 100).toFixed(1)}%</li>
              <li>• Average land per title: {((landDistributedAcres.total || 0) / (titlesDistributed.total || 1)).toFixed(2)} acres</li>
              <li>• Community vs Individual ratio: {((claimsReceived.community || 0) / (claimsReceived.individual || 1) * 100).toFixed(1)}%</li>
              <li>• Top performing district: {districtPerformance[0]?.name || 'N/A'}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Information</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Generated:</strong> {generatedDate}</p>
              <p><strong>Coverage:</strong> {stateName}</p>
              <p><strong>Data Period:</strong> {dateRange}</p>
              <p><strong>Report Version:</strong> 1.0</p>
              <p className="text-xs text-gray-500 mt-4">
                This report is generated automatically from the Forest Rights Act Management System.
                For questions or clarifications, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplate;