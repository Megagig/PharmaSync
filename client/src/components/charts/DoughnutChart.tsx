import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface DoughnutChartProps {
  data: any[];
  height: number;
  options?: any;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, height, options = {} }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Prepare data for Chart.js
      const labels = data.map((item) => item.label);
      const values = data.map((item) => item.value);

      // Generate random colors if not provided
      const backgroundColors = data.map((item) => 
        item.color || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
      );

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                borderWidth: 1,
                cutout: options.cutout || '70%',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: options.showLegend !== undefined ? options.showLegend : true,
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw;
                    const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
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

export default DoughnutChart;
