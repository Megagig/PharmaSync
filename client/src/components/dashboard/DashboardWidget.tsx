import React from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ChartType } from '@/types/report.types';
import ChartContainer from '@/components/charts/ChartContainer';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  chartType?: ChartType;
  chartData?: any[];
  chartHeight?: number;
  chartOptions?: any;
  children?: React.ReactNode;
  onViewMore?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  chartType,
  chartData,
  chartHeight = 300,
  chartOptions,
  children,
  onViewMore,
  isLoading = false,
  error = null,
}) => {
  return (
    <Card>
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {onViewMore && (
          <Button variant="text" onClick={onViewMore}>
            View More
          </Button>
        )}
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500 text-center">
              <svg
                className="h-12 w-12 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        ) : chartType && chartData ? (
          <ChartContainer
            title=""
            type={chartType}
            data={chartData}
            height={chartHeight}
            options={chartOptions}
            className="border-0 shadow-none"
          />
        ) : (
          children
        )}
      </div>
    </Card>
  );
};

export default DashboardWidget;
