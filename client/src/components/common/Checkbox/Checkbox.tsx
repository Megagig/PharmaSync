import React, { forwardRef } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${className}`}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700">{label}</label>
          )}
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
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
