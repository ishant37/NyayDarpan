// src/pages/dss/DSSResultsDisplay.jsx
import React, { useState } from 'react';
import { communitySchemes } from '../../data/dssData';
import EnhancedHeatmapModal from './EnhancedHeatmapModal';
import { CheckCircle, TrendingUp, BarChart, Users, DollarSign, Target, MapPin } from 'lucide-react';

const priorityConfig = {
  High: {
    color: 'border-red-500/50 bg-red-50 text-red-700',
    icon: <TrendingUp className="w-5 h-5" />,
    textColor: 'text-red-600',
  },
  Medium: {
    color: 'border-yellow-500/50 bg-yellow-50 text-yellow-700',
    icon: <BarChart className="w-5 h-5" />,
    textColor: 'text-yellow-600',
  },
  Low: {
    color: 'border-green-500/50 bg-green-50 text-green-700',
    icon: <CheckCircle className="w-5 h-5" />,
    textColor: 'text-green-600',
  },
};

const SchemeCard = ({ scheme, onSelect }) => {
  const config = priorityConfig[scheme.priority] || priorityConfig.Low;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all hover:shadow-xl hover:border-blue-400/50 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{scheme.name}</h3>
            <p className="text-sm text-gray-500">{scheme.ministry}</p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
            {config.icon}
            <span>{scheme.priority} Priority</span>
          </div>
        </div>

        <p className="text-gray-600 mb-5 text-sm">{scheme.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Affected Households</p>
              <p className="font-bold text-gray-800">{scheme.affectedHouseholds}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            <DollarSign className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Estimated Budget</p>
              <p className="font-bold text-gray-800">{scheme.estimatedBudget}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-500" />
            Evidence for Recommendation
          </h4>
          <ul className="space-y-2 list-disc list-inside text-gray-600 text-sm">
            {scheme.evidence.map((point, index) => <li key={index}>{point}</li>)}
          </ul>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50/70 border-t rounded-b-xl">
        <button
          onClick={() => onSelect(scheme)}
          className="w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-blue-100 hover:text-blue-800"
        >
          <MapPin className="w-4 h-4" />
          View Impact Hotspot Map
        </button>
      </div>
    </div>
  );
};

const DSSResultsDisplay = ({ state, district }) => {
  const [selectedScheme, setSelectedScheme] = useState(null);

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme);
  };

  const handleCloseModal = () => {
    setSelectedScheme(null);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">DSS Recommendations</h2>
          <p className="text-lg text-gray-600 mt-2">
            AI-Generated Scheme Recommendations for <span className="font-semibold text-green-700">{district}, {state}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {communitySchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} onSelect={handleSelectScheme} />
          ))}
        </div>
      </div>

      {selectedScheme && (
        <EnhancedHeatmapModal 
          scheme={selectedScheme} 
          onClose={handleCloseModal} 
          isOpen={!!selectedScheme}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default DSSResultsDisplay;