// src/pages/dss/DSSAgentRunner.jsx
import React, { useState, useEffect, useRef } from 'react';
import DSSResultsDisplay from './DSSResultsDisplay';
import { allStatesData } from '../../data/allStatesData';
import { ArrowLeft, Bot, CheckCircle, Zap, Loader } from 'lucide-react';

import DefaultVisual from './visuals/DefaultVisual';
import AnalyzingMapVisual from './visuals/AnalyzingMapVisual';
import FetchingDataVisual from './visuals/FetchingDataVisual';
import CompilingReportVisual from './visuals/CompilingReportVisual';

const agentSteps = [
    { text: 'Initializing DSS Agent...', duration: 1000, visual: <DefaultVisual title="Initializing" icon={<Bot />} /> },
    { text: 'Accessing National Informatics Centre (NIC) database...', duration: 1500, visual: <FetchingDataVisual source="NIC GeoPortal" /> },
    { text: 'Analyzing tap water penetration data...', duration: 3000, visual: <FetchingDataVisual source="Jal Jeevan Mission API" /> },
    { text: 'Cross-referencing groundwater levels...', duration: 2000, visual: <FetchingDataVisual source="Central Ground Water Board" /> },
    { text: 'Processing satellite imagery for assets...', duration: 4000, visual: <AnalyzingMapVisual /> },
    { text: 'Analyzing soil quality data...', duration: 2500, visual: <FetchingDataVisual source="National Bureau of Soil Survey" /> },
    { text: 'Fetching socio-economic indicators from SECC-2011 data...', duration: 2000, visual: <FetchingDataVisual source="SECC-2011" /> },
    { text: 'Evaluating PM Gati Shakti infrastructure layers...', duration: 1500, visual: <AnalyzingMapVisual /> },
    { text: 'Compiling vulnerability report...', duration: 3000, visual: <CompilingReportVisual /> },
    { text: 'Identifying eligible Central Sector Schemes...', duration: 1500, visual: <DefaultVisual title="Filtering Schemes" icon={<Zap />} /> },
    { text: 'Prioritizing schemes based on impact analysis...', duration: 2000, visual: <CompilingReportVisual /> },
    { text: 'Generating final recommendations...', duration: 1000, visual: <DefaultVisual title="Finalizing" icon={<CheckCircle />} /> },
];

const FinalizingScreen = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <h3 className="text-2xl font-bold text-gray-800">Finalizing Report</h3>
        <p className="text-gray-600">Please wait a moment while we compile the recommendations...</p>
    </div>
);


const DSSAgentRunner = ({ schemeType, onBack }) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (selectedState) {
      const stateKey = selectedState.toLowerCase().replace(' ', '-');
      const stateData = allStatesData[stateKey];
      setDistricts(stateData ? stateData.districts.map(d => d.name) : []);
      setSelectedDistrict('');
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  useEffect(() => {
    if (isRunning && currentStepIndex < agentSteps.length) {
      const currentStep = agentSteps[currentStepIndex];
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, currentStep.duration);

      return () => clearTimeout(timer);
    } else if (isRunning && currentStepIndex >= agentSteps.length) {
      setIsRunning(false);
      setIsFinalizing(true); // Start finalizing screen
      setTimeout(() => {
          setIsFinalizing(false);
          setShowResults(true);
      }, 2500); // Show finalizing screen for 2.5 seconds
    }
  }, [isRunning, currentStepIndex]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  const handleRunAgent = () => {
    setIsRunning(true);
    setShowResults(false);
    setCurrentStepIndex(0);
  };

  const states = Object.keys(allStatesData).map(key =>
    key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  );

  if (showResults) {
    return <DSSResultsDisplay state={selectedState} district={selectedDistrict} />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Scheme Selection
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">DSS Agent Runner</h2>
          <p className="text-gray-600">Select location to run analysis for {schemeType} Schemes.</p>
        </div>

        <div className="p-6">
          {!isRunning && !isFinalizing && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select State</option>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
                <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!selectedState}>
                  <option value="">Select District</option>
                  {districts.map(district => <option key={district} value={district}>{district}</option>)}
                </select>
              </div>

              <button onClick={handleRunAgent} disabled={!selectedState || !selectedDistrict} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Bot className="w-5 h-5" />
                Run DSS Agent
              </button>
            </>
          )}

          {(isRunning || isFinalizing) && (
            isFinalizing ? <FinalizingScreen /> :
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Left Panel: Log */}
              <div className="lg:col-span-1 bg-gray-800 text-white rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto" ref={logContainerRef}>
                <p className="text-yellow-300 mb-4">$ dss-agent --run --type={schemeType}</p>
                {agentSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 mb-2">
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <div className={`w-4 h-4 flex-shrink-0 mt-1 ${index === currentStepIndex ? 'animate-pulse' : ''}`}> &gt; </div>
                    )}
                    <span className={index === currentStepIndex ? 'text-yellow-300' : index < currentStepIndex ? 'text-gray-400' : 'text-gray-600'}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Panel: Visual */}
              <div className="lg:col-span-2 h-96 rounded-lg bg-gray-50">
                {currentStepIndex < agentSteps.length
                  ? agentSteps[currentStepIndex].visual
                  : <CompilingReportVisual isComplete={true} />
                }
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default DSSAgentRunner;