import React, { useState, useRef } from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: ChartData[];
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = -90; // Start from the top

  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;
    
    const circumference = 2 * Math.PI * 40; // 2 * pi * r
    const arcLength = (angle / 360) * circumference;
    
    const result = {
      angle,
      startAngle,
      arcLength,
      circumference,
      color: COLORS[index % COLORS.length],
      name: item.name,
      value: item.value
    };
    startAngle = endAngle;
    return result;
  });

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
        {slices.map((slice, index) => (
          <circle
            key={index}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={slice.color}
            strokeWidth="20"
            strokeDasharray={`${slice.arcLength} ${slice.circumference - slice.arcLength}`}
            strokeDashoffset={-slices.slice(0, index).reduce((acc, s) => acc + s.arcLength, 0)}
            className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
            onMouseMove={(e) => {
              const percentage = ((slice.value / total) * 100).toFixed(1);
              const containerRect = containerRef.current?.getBoundingClientRect();
              if(containerRect) setTooltip({x: e.clientX - containerRect.left, y: e.clientY - containerRect.top, text: `${slice.name}: ${slice.value} (${percentage}%)`});
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>
      <div className="mt-4 w-full px-4 space-y-2 overflow-y-auto">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
            </div>
            <span className="font-medium text-gray-800 dark:text-gray-100">{item.value}</span>
          </div>
        ))}
      </div>
       {tooltip && (
        <div className="absolute p-2 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded-md shadow-lg pointer-events-none" style={{ top: 0, left: 0, transform: `translate(${tooltip.x + 10}px, ${tooltip.y - 30}px)` }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default PieChart;