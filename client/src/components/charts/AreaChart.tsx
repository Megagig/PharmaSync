import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface AreaChartProps {
  data: any[];
  height: number;
  options?: any;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, height, options = {} }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Prepare data for Chart.js
      const labels = data.map((item) => item.date || item.label);
      const values = data.map((item) => item.value);

      // Generate a random color if not provided
      const color = options.color || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: options.label || 'Value',
                data: values,
                borderColor: color.replace('0.6', '1'),
                backgroundColor: color,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: options.showLegend !== undefined ? options.showLegend : true,
                position: 'top',
              },
              tooltip: {
                enabled: true,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: !!options.yAxisLabel,
                  text: options.yAxisLabel || '',
                },
              },
              x: {
                title: {
                  display: !!options.xAxisLabel,
                  text: options.xAxisLabel || '',
                },
              },
            },
            ...options,
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, height]);

  return <canvas ref={chartRef} height={height} />;
};

export default AreaChart;
