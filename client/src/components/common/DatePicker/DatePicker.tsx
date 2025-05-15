import React from 'react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  placeholder = 'Select date',
  error,
  helperText,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputClasses = `
    block w-full px-3 py-2 
    border ${error ? 'border-red-500' : 'border-gray-300'} 
    rounded-md shadow-sm 
    placeholder-gray-400 
    focus:outline-none 
    focus:ring-primary-500 
    focus:border-primary-500 
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClasses}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default DatePicker;
