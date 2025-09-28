// src/pages/dss/visuals/DefaultVisual.jsx
import React from 'react';
import { Bot } from 'lucide-react';

const DefaultVisual = ({ title = "Processing", icon }) => {
  const IconComponent = icon || <Bot />;

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-6 flex flex-col items-center justify-center text-white font-mono">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pulsing background circles */}
        <div className="absolute w-full h-full bg-blue-500/20 rounded-full animate-ping"></div>
        <div className="absolute w-24 h-24 bg-blue-500/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>

        {/* Icon */}
        <div className="relative text-blue-300">
          {React.cloneElement(IconComponent, { className: "w-16 h-16" })}
        </div>
      </div>
      <h4 className="text-xl font-semibold text-yellow-300 mt-8 tracking-widest">
        [{title}...]
      </h4>
    </div>
  );
};

export default DefaultVisual;