import React from 'react';
import DatePicker from '../DatePicker/DatePicker';

interface DateRangePickerProps {
  label?: string;
  startDate: string;
  endDate: string;
  onDateChange: (dateRange: { startDate: string; endDate: string } | null) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label = 'Date Range',
  startDate,
  endDate,
  onDateChange,
  required = false,
  disabled = false,
  className = '',
}) => {
  const handleStartDateChange = (date: string) => {
    onDateChange({ startDate: date, endDate });
  };

  const handleEndDateChange = (date: string) => {
    onDateChange({ startDate, endDate: date });
  };

  const handleClear = () => {
    onDateChange(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <DatePicker
            label=""
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Start Date"
            disabled={disabled}
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex-1">
          <DatePicker
            label=""
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="End Date"
            disabled={disabled}
            min={startDate}
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700"
            disabled={disabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
