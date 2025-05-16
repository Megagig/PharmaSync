import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      fullWidth = false,
      options = [],
      placeholder,
      ...props
    },
    ref
  ) => {
    const selectClasses = `
      block w-full px-3 py-2
      border ${error ? 'border-red-500' : 'border-gray-300'}
      rounded-md shadow-sm
      focus:outline-none
      focus:ring-primary-500
      focus:border-primary-500
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-1`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options && options.length > 0 ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : props.children ? (
            props.children
          ) : (
            <option value="" disabled>
              No options available
            </option>
          )}
        </select>
        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
