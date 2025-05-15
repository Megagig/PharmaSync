import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';

const LocationList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This would fetch locations data in a real implementation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Locations</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/locations/new')}
          >
            Add New Location
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
              <h3 className="text-lg font-medium text-gray-900">Multi-location Inventory Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                This feature is under development. Here you will be able to manage inventory across multiple locations,
                track stock levels at each location, and manage inventory transfers between locations.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                You'll be able to set up different storage locations within your pharmacy (main store, dispensing area, 
                refrigerated storage, etc.) or manage inventory across multiple branches.
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

export default LocationList;
