import React from 'react';
import { ChartType } from '@/types/report.types';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import DoughnutChart from './DoughnutChart';
import AreaChart from './AreaChart';
import ScatterChart from './ScatterChart';
import RadarChart from './RadarChart';
import DataTable from './DataTable';
import Card from '@/components/common/Card/Card';

interface ChartContainerProps {
  title: string;
  type: ChartType;
  data: any[];
  height?: number;
  width?: string;
  options?: any;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  type,
  data,
  height = 300,
  width = '100%',
  options = {},
  className = '',
}) => {
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    switch (type) {
      case ChartType.BAR:
        return <BarChart data={data} height={height} options={options} />;
      case ChartType.LINE:
        return <LineChart data={data} height={height} options={options} />;
      case ChartType.PIE:
        return <PieChart data={data} height={height} options={options} />;
      case ChartType.DOUGHNUT:
        return <DoughnutChart data={data} height={height} options={options} />;
      case ChartType.AREA:
        return <AreaChart data={data} height={height} options={options} />;
      case ChartType.SCATTER:
        return <ScatterChart data={data} height={height} options={options} />;
      case ChartType.RADAR:
        return <RadarChart data={data} height={height} options={options} />;
      case ChartType.TABLE:
        return <DataTable data={data} />;
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-4" style={{ height: `${height}px`, width }}>
        {renderChart()}
      </div>
    </Card>
  );
};

export default ChartContainer;
