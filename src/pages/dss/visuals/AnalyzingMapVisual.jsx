// src/pages/dss/visuals/AnalyzingMapVisual.jsx
import React, { useState, useEffect } from 'react';
import { Map, Zap, Droplets, Trees, Home } from 'lucide-react';

const assets = [
  { icon: <Trees className="w-5 h-5 text-green-600" />, name: 'Forest Cover', value: '68%' },
  { icon: <Droplets className="w-5 h-5 text-blue-600" />, name: 'Water Bodies', value: '12 Found' },
  { icon: <Home className="w-5 h-5 text-yellow-600" />, name: 'Settlements', value: '4 Major' },
  { icon: <Zap className="w-5 h-5 text-red-600" />, name: 'Infrastructure Gaps', value: '2 Identified' },
];

const AnalyzingMapVisual = () => {
  const [revealedAssets, setRevealedAssets] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevealedAssets(prev => (prev < assets.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-gray-800 font-mono border border-gray-200">
      <div className="w-full max-w-md h-64 bg-gray-200/50 rounded-lg relative overflow-hidden border-2 border-green-500/30">
        {/* Mock Map Background */}
        <Map className="absolute w-48 h-48 text-gray-400/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 h-full w-1 bg-green-400 shadow-[0_0_15px_3px_rgba(34,197,94,0.7)] animate-[scan_4s_linear_infinite]"></div>
        
        {/* Asset Points */}
        <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        <div className="absolute top-[50%] left-[60%] w-3 h-3 bg-blue-500 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-[70%] left-[25%] w-3 h-3 bg-yellow-500 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[80%] w-3 h-3 bg-red-500 rounded-full animate-ping animation-delay-3000"></div>
      </div>
      <div className="w-full max-w-md mt-4">
        <h4 className="text-lg font-semibold text-green-700 mb-2">[Identifying Assets...]</h4>
        <ul className="space-y-2">
          {assets.slice(0, revealedAssets).map((asset, index) => (
            <li key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 animate-fadeIn">
              <div className="flex items-center gap-2">
                {asset.icon}
                <span className="text-gray-700">{asset.name}</span>
              </div>
              <span className="font-semibold text-gray-800">{asset.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        @keyframes scan {
          0% { left: -5%; }
          100% { left: 105%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
      `}</style>
    </div>
  );
};

export default AnalyzingMapVisual;