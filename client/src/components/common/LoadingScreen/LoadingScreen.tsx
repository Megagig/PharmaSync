import React from 'react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  fullScreen = true,
  className = '',
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        {message && <p className="mt-4 text-gray-700 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingScreen;
