import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  className = '',
  onClose,
}) => {
  const getAlertStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-400';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-400';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-400';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-400';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-md p-4 border ${getAlertStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : type === 'error'
                    ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    : type === 'warning'
                    ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                    : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
