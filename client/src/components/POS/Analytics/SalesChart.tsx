import React from 'react';
import Card from '@/components/common/Card/Card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { formatCurrency } from '@/utils/formatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: {
    label: string;
    totalSales: number;
    count: number;
    averageSale?: number;
  }[];
  title?: string;
  loading?: boolean;
  className?: string;
}

const SalesChart: React.FC<SalesChartProps> = ({
  data,
  title = 'Sales Trend',
  loading = false,
  className = '',
}) => {
  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Sales',
        data: data.map(item => item.totalSales),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Transactions',
        data: data.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales Amount',
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          },
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Transaction Count',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += formatCurrency(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <Card className={`sales-chart ${className}`}>
      <div className="p-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesChart;
