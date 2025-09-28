// src/pages/dss/visuals/FetchingDataVisual.jsx
import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

const FetchingDataVisual = ({ source = "Jal Jeevan Mission API" }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatus('Fetching Datasets...');
      setProgress(30);
    }, 500);
    const timer2 = setTimeout(() => {
      setStatus('Parsing Records...');
      setProgress(75);
    }, 1500);
    const timer3 = setTimeout(() => {
      setStatus('Data Acquired.');
      setProgress(100);
    }, 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-gray-800 font-mono border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <Database className="w-12 h-12 text-blue-500" />
        <div>
          <h4 className="text-xl font-semibold text-gray-700">Data Ingestion Module</h4>
          <p className="text-gray-500">Source: {source}</p>
        </div>
      </div>
      
      {/* Animated Graph */}
      <div className="w-full max-w-md h-32 flex items-end gap-2 p-2">
          {[40, 60, 30, 80, 50, 70, 90, 45].map((h, i) => (
              <div key={i} className="w-full bg-blue-500/20 rounded-t-sm animate-pulse" style={{ height: `${progress > 0 ? h : 0}%`, transition: 'height 0.5s ease-in-out', animationDelay: `${i * 100}ms` }}></div>
          ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-6">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">{status}</span>
            <span className="text-sm font-semibold text-green-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>
    </div>
  );
};

export default FetchingDataVisual;