import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';

const ExpiryTrackingList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This would fetch expiry data in a real implementation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Expiry Tracking</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/adjust')}
          >
            Adjust Inventory
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">Expiry Date Tracking & Batch Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                This feature is under development. Here you will be able to track expiry dates of all products,
                receive alerts for products nearing expiration, and manage product batches.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                The system will help you implement FEFO (First Expired, First Out) inventory management
                to minimize product waste.
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/inventory')}
                >
                  Return to Inventory Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExpiryTrackingList;
