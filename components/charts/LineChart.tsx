import React, { useRef, useEffect, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface LineChartProps {
  data: ChartData[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (svgRef.current?.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }
    return () => resizeObserver.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const { width, height } = dimensions;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const yScale = chartHeight / (maxValue > 0 ? maxValue : 1);
  const xScale = chartWidth / (data.length - 1);

  const points = data.map((d, i) => `${i * xScale},${chartHeight - d.value * yScale}`).join(' ');

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} width="100%" height="100%">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Y Axis */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = chartHeight - (i * chartHeight / 4);
            const value = Math.round(i * maxValue / 4);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={chartWidth} y2={y} stroke="#e2e8f0" />
                <text x={-10} y={y + 4} textAnchor="end" fontSize="12" fill="#64748b">{value}</text>
              </g>
            );
          })}

          {/* X Axis */}
          {data.map((d, i) => (
            <text key={i} x={i * xScale} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="#475569">{d.name}</text>
          ))}
          
          {/* Line */}
          <polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="3" />

          {/* Points */}
          {data.map((d, i) => (
            <g key={i}>
                <circle cx={i * xScale} cy={chartHeight - d.value * yScale} r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <text x={i * xScale} y={chartHeight - d.value * yScale - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#4f46e5">
                    {d.value.toFixed(0)}
                </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;
