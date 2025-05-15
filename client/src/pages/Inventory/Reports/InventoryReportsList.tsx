import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import { useToast } from '@/hooks/useToast';
import { ProductType } from '@/types/product';
import api from '@/services/api';

enum ReportType {
  STOCK_VALUATION = 'stock_valuation',
  EXPIRY = 'expiry',
  LOW_STOCK = 'low_stock',
  INVENTORY_MOVEMENT = 'inventory_movement',
  LOCATION_INVENTORY = 'location_inventory',
}

interface ReportConfig {
  title: string;
  description: string;
  parameters: {
    productType?: boolean;
    dateRange?: boolean;
    location?: boolean;
    expiryDays?: boolean;
    stockThreshold?: boolean;
  };
  endpoint: string;
}

const reportConfigs: Record<ReportType, ReportConfig> = {
  [ReportType.STOCK_VALUATION]: {
    title: 'Stock Valuation Report',
    description:
      'View the current value of your inventory by product and location',
    parameters: {
      productType: true,
      location: true,
    },
    endpoint: '/inventory/valuation',
  },
  [ReportType.EXPIRY]: {
    title: 'Expiry Report',
    description: 'Track products that are expiring soon to minimize waste',
    parameters: {
      productType: true,
      expiryDays: true,
    },
    endpoint: '/inventory/expiring',
  },
  [ReportType.LOW_STOCK]: {
    title: 'Low Stock Report',
    description: 'Identify products that need to be reordered',
    parameters: {
      productType: true,
      stockThreshold: true,
    },
    endpoint: '/inventory/low-stock',
  },
  [ReportType.INVENTORY_MOVEMENT]: {
    title: 'Inventory Movement Report',
    description:
      'Track inventory changes over time (purchases, sales, transfers, etc.)',
    parameters: {
      productType: true,
      dateRange: true,
    },
    endpoint: '/inventory/movements',
  },
  [ReportType.LOCATION_INVENTORY]: {
    title: 'Location Inventory Report',
    description: 'View inventory levels by location',
    parameters: {
      productType: true,
      location: true,
    },
    endpoint: '/inventory/by-location',
  },
};

const InventoryReportsList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>(
    ''
  );
  const [productType, setProductType] = useState('');
  const [location, setLocation] = useState('');
  const [expiryDays, setExpiryDays] = useState('90');
  const [stockThreshold, setStockThreshold] = useState('10');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        setLocations(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const generateReport = async () => {
    if (!selectedReportType) {
      showToast('Please select a report type', 'error');
      return;
    }

    setIsGeneratingReport(true);
    setReportData(null);

    try {
      const config = reportConfigs[selectedReportType as ReportType];
      const params = new URLSearchParams();

      if (config.parameters.productType && productType) {
        params.append('productType', productType);
      }

      if (config.parameters.location && location) {
        params.append('location', location);
      }

      if (config.parameters.expiryDays && expiryDays) {
        params.append('days', expiryDays);
      }

      if (config.parameters.stockThreshold && stockThreshold) {
        params.append('threshold', stockThreshold);
      }

      if (config.parameters.dateRange) {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const response = await api.get(`${config.endpoint}?${params.toString()}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error generating report:', error);
      showToast('Error generating report', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getProductTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : locationId;
  };

  const renderReportParameters = () => {
    if (!selectedReportType) return null;

    const config = reportConfigs[selectedReportType as ReportType];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {config.parameters.productType && (
          <div>
            <Select
              label="Product Type"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...Object.values(ProductType).map((type) => ({
                  value: type,
                  label: getProductTypeLabel(type),
                })),
              ]}
            />
          </div>
        )}

        {config.parameters.location && (
          <div>
            <Select
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={[
                { value: '', label: 'All Locations' },
                ...locations.map((loc) => ({
                  value: loc._id,
                  label: loc.name,
                })),
              ]}
            />
          </div>
        )}

        {config.parameters.expiryDays && (
          <div>
            <Select
              label="Expiry Period"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              options={[
                { value: '30', label: 'Next 30 Days' },
                { value: '60', label: 'Next 60 Days' },
                { value: '90', label: 'Next 90 Days' },
                { value: '180', label: 'Next 6 Months' },
                { value: '365', label: 'Next 12 Months' },
              ]}
            />
          </div>
        )}

        {config.parameters.stockThreshold && (
          <div>
            <Input
              label="Stock Threshold"
              type="number"
              min="0"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(e.target.value)}
            />
          </div>
        )}

        {config.parameters.dateRange && (
          <>
            <div>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="md:col-span-2 mt-2">
          <Button
            variant="primary"
            onClick={generateReport}
            isLoading={isGeneratingReport}
            className="w-full md:w-auto"
          >
            Generate Report
          </Button>
        </div>
      </div>
    );
  };

  const renderStockValuationReport = (data: any) => {
    if (!data || !data.items || data.items.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">No data available for this report.</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Total Inventory Value: ₦{data.totalValue.toFixed(2)}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((item: any, index: number) => (
                <tr key={item.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.type === 'product' && item.productType
                        ? getProductTypeLabel(item.productType)
                        : 'Medication'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.totalStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₦{item.value.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderExpiryReport = (data: any) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">
            No expiring items found for the selected period.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Batch
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expiry Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Days Until Expiry
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item: any, index: number) => (
                <tr key={`${item.id}-${item.batchNumber}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.batchNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.location ? getLocationName(item.location) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        item.daysUntilExpiry <= 0
                          ? 'text-red-600'
                          : item.daysUntilExpiry <= 30
                          ? 'text-red-500'
                          : item.daysUntilExpiry <= 60
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.daysUntilExpiry <= 0
                        ? 'Expired'
                        : `${item.daysUntilExpiry} days`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLowStockReport = (data: any) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">No low stock items found.</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Current Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Min Level
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Reorder Point
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item: any, index: number) => (
                <tr key={item.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.type === 'product' && item.productType
                        ? getProductTypeLabel(item.productType)
                        : 'Medication'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.totalStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.minimumStockLevel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.reorderPoint}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        item.totalStock <= 0
                          ? 'text-red-600'
                          : item.totalStock <= item.reorderPoint
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.totalStock <= 0
                        ? 'Out of Stock'
                        : item.totalStock <= item.reorderPoint
                        ? 'Low Stock'
                        : 'In Stock'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    if (!reportData) return null;

    switch (selectedReportType) {
      case ReportType.STOCK_VALUATION:
        return renderStockValuationReport(reportData);
      case ReportType.EXPIRY:
        return renderExpiryReport(reportData);
      case ReportType.LOW_STOCK:
        return renderLowStockReport(reportData);
      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-500">Report type not implemented yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Inventory Reports
        </h1>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Generate Report
          </h2>

          <div>
            <Select
              label="Report Type"
              value={selectedReportType}
              onChange={(e) =>
                setSelectedReportType(e.target.value as ReportType)
              }
              options={[
                { value: '', label: 'Select a report type' },
                ...Object.entries(reportConfigs).map(([key, config]) => ({
                  value: key,
                  label: config.title,
                })),
              ]}
            />
            {selectedReportType && (
              <p className="mt-1 text-sm text-gray-500">
                {reportConfigs[selectedReportType as ReportType].description}
              </p>
            )}
          </div>

          {renderReportParameters()}
        </div>
      </Card>

      {reportData && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {selectedReportType
                ? reportConfigs[selectedReportType as ReportType].title
                : 'Report Results'}
            </h2>
            {renderReport()}
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                Print Report
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!reportData && !isGeneratingReport && (
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">
                Available Reports
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Select a report type above to generate detailed inventory
                reports.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-500 list-disc list-inside text-left max-w-md mx-auto">
                <li>Stock valuation reports</li>
                <li>Expiry reports</li>
                <li>Low stock reports</li>
                <li>Inventory movement reports</li>
                <li>Location-based inventory reports</li>
                <li>Batch tracking reports</li>
                <li>Profit margin analysis by product</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryReportsList;
