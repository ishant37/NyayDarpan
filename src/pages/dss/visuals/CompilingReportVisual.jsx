// src/pages/dss/visuals/CompilingReportVisual.jsx
import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const CompilingReportVisual = ({ isComplete = false }) => {
  return (
    <div className="w-full h-full bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center text-gray-800 font-mono border border-gray-200 overflow-hidden">
      <div className="relative w-64 h-64">
        {/* Central Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {isComplete ? (
            <CheckCircle className="w-24 h-24 text-green-500 animate-pulse" />
          ) : (
            <FileText className="w-24 h-24 text-blue-500 animate-pulse" />
          )}
        </div>

        {/* Orbiting Elements */}
        {!isComplete && (
          <>
            <div className="absolute w-full h-full animate-spin-slow">
              <div className="absolute top-[10%] left-[45%] w-8 h-8 bg-green-500/20 rounded-md text-xs flex items-center justify-center text-green-800 font-bold">
                IMG
              </div>
            </div>
            <div className="absolute w-full h-full animate-spin-medium">
              <div className="absolute top-[45%] left-[10%] w-8 h-8 bg-yellow-500/20 rounded-full text-xs flex items-center justify-center text-yellow-800 font-bold">
                CSV
              </div>
            </div>
            <div className="absolute w-full h-full animate-spin-fast">
              <div className="absolute bottom-[15%] right-[20%] w-8 h-8 bg-red-500/20 rounded-sm text-xs flex items-center justify-center text-red-800 font-bold">
                PDF
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 text-center">
        <h4 className="text-lg font-semibold text-gray-700">
          {isComplete ? '[Report Generated]' : '[Compiling Datapoints...]'}
        </h4>
        <p className="text-gray-500">
          {isComplete
            ? 'Final recommendations are ready.'
            : 'Aggregating and cross-referencing all data sources.'}
        </p>
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-medium {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-medium { animation: spin-medium 15s linear infinite; }
        .animate-spin-fast { animation: spin-fast 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default CompilingReportVisual;