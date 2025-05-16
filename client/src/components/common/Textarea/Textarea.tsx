import React, { forwardRef } from 'react';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      fullWidth = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaClasses = `
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
      <div className={`${fullWidth ? 'w-full' : ''} mb-1`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClasses}
          rows={rows}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea;
