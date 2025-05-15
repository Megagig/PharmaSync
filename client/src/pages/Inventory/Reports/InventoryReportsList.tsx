import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';

const InventoryReportsList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This would fetch report data in a real implementation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Reports</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/reports/new')}
          >
            Generate New Report
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
              <h3 className="text-lg font-medium text-gray-900">Comprehensive Inventory Reporting</h3>
              <p className="mt-2 text-sm text-gray-500">
                This feature is under development. Here you will be able to generate and view a wide range of inventory reports, including:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500 list-disc list-inside text-left max-w-md mx-auto">
                <li>Stock valuation reports</li>
                <li>Inventory movement reports</li>
                <li>Expiry reports</li>
                <li>Slow-moving inventory reports</li>
                <li>Stock turnover analysis</li>
                <li>Inventory aging reports</li>
                <li>Location-based inventory reports</li>
                <li>Batch tracking reports</li>
                <li>Profit margin analysis by product</li>
              </ul>
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

export default InventoryReportsList;
