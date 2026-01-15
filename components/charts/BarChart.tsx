import React, { useRef, useEffect, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length === 0) return null;
  
  const { width, height } = dimensions;
  const padding = { top: 20, right: 20, bottom: 60, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value));
  const yScale = chartHeight / (maxValue > 0 ? maxValue : 1);
  const xScale = chartWidth / data.length;
  const barWidth = xScale * 0.7;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} width="100%" height="100%">
        {/* Y Axis */}
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {Array.from({ length: 6 }).map((_, i) => {
            const y = chartHeight - (i * chartHeight / 5);
            const value = Math.round(i * maxValue / 5);
            return (
              <g key={i}>
                <line x1={-5} y1={y} x2={chartWidth} y2={y} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeDasharray="2" />
                <text x={-10} y={y + 5} textAnchor="end" fontSize="12" fill="currentColor" className="text-gray-500 dark:text-gray-400">{value}</text>
              </g>
            );
          })}
        </g>
        
        {/* X Axis and Bars */}
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {data.map((d, i) => {
            const barHeight = d.value * yScale;
            const x = i * xScale + (xScale - barWidth) / 2;
            const y = chartHeight - barHeight;
            return (
              <g key={i} className="cursor-pointer" 
                onMouseMove={(e) => {
                  const containerRect = containerRef.current?.getBoundingClientRect();
                  if(containerRect) setTooltip({x: e.clientX - containerRect.left, y: e.clientY - containerRect.top, text: `${d.name}: ${d.value.toFixed(1)} hrs`});
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <rect x={x} y={y} width={barWidth} height={barHeight} fill="currentColor" className="text-blue-500 dark:text-blue-400 transition-opacity duration-200 hover:opacity-80" rx="2" />
                <text x={i * xScale + xScale / 2} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="currentColor" className="text-gray-600 dark:text-gray-300 font-medium truncate">{d.name}</text>
              </g>
            )
          })}
        </g>
      </svg>
      {tooltip && (
        <div className="absolute p-2 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded-md shadow-lg pointer-events-none transition-transform" style={{ top: 0, left: 0, transform: `translate(${tooltip.x + 10}px, ${tooltip.y - 30}px)` }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default BarChart;