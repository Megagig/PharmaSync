import React, { useState } from 'react';
import Button from '@/components/common/Button/Button';
import { formatDateToISO } from '@/utils/date.utils';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export type DateRangePreset = 'all' | '7days' | '30days' | '90days' | '6months' | '1year' | 'custom';

interface ReportDateFilterProps {
  onFilterChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

const ReportDateFilter: React.FC<ReportDateFilterProps> = ({ onFilterChange, initialRange }) => {
  const [dateRange, setDateRange] = useState<DateRange>(
    initialRange || {
      startDate: null,
      endDate: null,
    }
  );
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = today;
    
    switch (preset) {
      case '7days':
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;
      case '30days':
        startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        break;
      case '90days':
        startDate = new Date();
        startDate.setDate(today.getDate() - 90);
        break;
      case '6months':
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1year':
        startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        // Don't change the dates, just expand the custom date picker
        setIsExpanded(true);
        return;
      case 'all':
      default:
        startDate = null;
        endDate = null;
        break;
    }
    
    const newRange = { startDate, endDate };
    setDateRange(newRange);
    onFilterChange(newRange);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : null;
    const newRange = { ...dateRange, [field]: date };
    setDateRange(newRange);
  };

  const applyCustomRange = () => {
    onFilterChange(dateRange);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-medium text-gray-900">Report Date Range</h2>
          <p className="text-sm text-gray-500">
            {selectedPreset === 'all' 
              ? 'Showing all-time data' 
              : selectedPreset === 'custom' && dateRange.startDate && dateRange.endDate
                ? `Showing data from ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`
                : selectedPreset === '7days'
                  ? 'Showing data for the last 7 days'
                  : selectedPreset === '30days'
                    ? 'Showing data for the last 30 days'
                    : selectedPreset === '90days'
                      ? 'Showing data for the last 90 days'
                      : selectedPreset === '6months'
                        ? 'Showing data for the last 6 months'
                        : 'Showing data for the last year'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedPreset === 'all' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('all')}
          >
            All Time
          </Button>
          <Button 
            variant={selectedPreset === '7days' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('7days')}
          >
            Last 7 Days
          </Button>
          <Button 
            variant={selectedPreset === '30days' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('30days')}
          >
            Last 30 Days
          </Button>
          <Button 
            variant={selectedPreset === '90days' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('90days')}
          >
            Last 90 Days
          </Button>
          <Button 
            variant={selectedPreset === '1year' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('1year')}
          >
            Last Year
          </Button>
          <Button 
            variant={selectedPreset === 'custom' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handlePresetChange('custom')}
          >
            Custom
          </Button>
        </div>
      </div>
      
      {selectedPreset === 'custom' && isExpanded && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate ? formatDateToISO(dateRange.startDate) : ''}
                onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate ? formatDateToISO(dateRange.endDate) : ''}
                onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={applyCustomRange}
              disabled={!dateRange.startDate || !dateRange.endDate}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDateFilter;
