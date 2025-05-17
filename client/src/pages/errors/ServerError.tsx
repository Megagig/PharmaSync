import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button/Button';

const ServerError: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-primary-600">500</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Server Error</h2>
          <p className="mt-2 text-sm text-gray-600">
            Something went wrong on our servers. We're working to fix the issue.
          </p>
        </div>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary" className="w-full">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
