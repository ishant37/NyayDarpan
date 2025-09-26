import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export function DonutChart({ data, centerLabel, centerValue }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">{centerValue || total}</div>
        <div className="text-sm text-gray-600">{centerLabel || 'Total'}</div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}