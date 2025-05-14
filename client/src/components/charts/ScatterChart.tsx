import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ScatterChartProps {
  data: any[];
  height: number;
  options?: any;
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, height, options = {} }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Prepare data for Chart.js
      const scatterData = data.map((item) => ({
        x: item.x,
        y: item.y,
      }));

      // Generate a random color if not provided
      const color = options.color || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                label: options.label || 'Scatter Dataset',
                data: scatterData,
                backgroundColor: color,
                borderColor: color.replace('0.6', '1'),
                pointRadius: 6,
                pointHoverRadius: 8,
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
                callbacks: {
                  label: function(context) {
                    return `(${context.parsed.x}, ${context.parsed.y})`;
                  }
                }
              },
            },
            scales: {
              y: {
                beginAtZero: options.beginAtZero !== undefined ? options.beginAtZero : false,
                title: {
                  display: !!options.yAxisLabel,
                  text: options.yAxisLabel || '',
                },
              },
              x: {
                beginAtZero: options.beginAtZero !== undefined ? options.beginAtZero : false,
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

export default ScatterChart;
