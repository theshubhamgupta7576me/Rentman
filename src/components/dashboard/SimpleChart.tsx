import React from 'react';

interface ChartData {
  month: string;
  rent: number;
  electricity: number;
}

interface SimpleChartProps {
  data: ChartData[];
  type: 'rent' | 'electricity';
}

export function SimpleChart({ data, type }: SimpleChartProps) {
  // Add null check to prevent error
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => type === 'rent' ? d.rent : d.electricity));
  const color = type === 'rent' ? 'bg-blue-500' : 'bg-orange-500';

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const value = type === 'rent' ? item.rent : item.electricity;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex items-center">
            <div className="w-16 text-xs text-gray-600 text-right mr-3">
              {item.month}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className={`${color} h-6 rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-medium text-white">
                  ₹{value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}