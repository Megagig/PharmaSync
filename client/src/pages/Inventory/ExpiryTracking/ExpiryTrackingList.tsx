import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { ProductType } from '@/types/product';
import api from '@/services/api';

interface ExpiryItem {
  id: string;
  name: string;
  type: 'product' | 'medication';
  productType?: string;
  category?: string;
  strength?: string;
  dosageForm?: string;
  batchNumber: string;
  quantity: number;
  location?: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

const ExpiryTrackingList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [expiryItems, setExpiryItems] = useState<ExpiryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productType, setProductType] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('90');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);

  const fetchExpiryItems = async () => {
    setIsLoading(true);
    try {
      // Get expiry data from the inventory endpoint
      const params = new URLSearchParams();
      params.append('days', expiryFilter);
      if (productType) params.append('productType', productType);

      const response = await api.get(
        `/inventory/expiring?${params.toString()}`
      );
      let items = response.data.data;

      // Apply search filter
      if (searchTerm) {
        items = items.filter(
          (item: ExpiryItem) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.strength &&
              item.strength.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.dosageForm &&
              item.dosageForm.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Sort by days until expiry (ascending)
      items.sort(
        (a: ExpiryItem, b: ExpiryItem) => a.daysUntilExpiry - b.daysUntilExpiry
      );

      setExpiryItems(items);
      setTotalPages(Math.ceil(items.length / 10));
    } catch (error) {
      console.error('Error fetching expiry data:', error);
      showToast('Error fetching expiry data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations/active');
      setLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchExpiryItems();
  }, [productType, expiryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExpiryItems();
  };

  const handleAdjustStock = (item: ExpiryItem) => {
    if (item.type === 'product') {
      navigate(`/inventory/products/${item.id}/inventory`);
    } else {
      navigate('/inventory/adjust', { state: { medicationId: item.id } });
    }
  };

  const getExpiryStatusBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) {
      return <Badge color="red">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge color="red">Expires in {daysUntilExpiry} days</Badge>;
    } else if (daysUntilExpiry <= 60) {
      return <Badge color="yellow">Expires in {daysUntilExpiry} days</Badge>;
    } else {
      return <Badge color="green">Expires in {daysUntilExpiry} days</Badge>;
    }
  };

  const getProductTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc._id === locationId);
    return location ? location.name : locationId;
  };

  // Pagination
  const paginatedItems = expiryItems.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Expiry Tracking
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/adjust')}
          >
            Adjust Inventory
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="flex-1">
              <Input
                placeholder="Search by name, batch number, or strength"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="All Types"
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
            <div className="w-full md:w-48">
              <Select
                placeholder="Expiry Period"
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                options={[
                  { value: '30', label: 'Next 30 Days' },
                  { value: '60', label: 'Next 60 Days' },
                  { value: '90', label: 'Next 90 Days' },
                  { value: '180', label: 'Next 6 Months' },
                  { value: '365', label: 'Next 12 Months' },
                ]}
              />
            </div>
            <div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : paginatedItems.length > 0 ? (
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
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item, index) => (
                    <tr key={`${item.id}-${item.batchNumber}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.type === 'medication' ? (
                          <div className="text-sm text-gray-500">
                            {item.strength} {item.dosageForm}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {item.productType &&
                              getProductTypeLabel(item.productType)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.batchNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.location
                            ? getLocationName(item.location)
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getExpiryStatusBadge(item.daysUntilExpiry)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="text"
                            onClick={() => handleAdjustStock(item)}
                          >
                            Adjust Stock
                          </Button>
                          {item.type === 'product' && (
                            <Button
                              variant="text"
                              onClick={() =>
                                navigate(`/inventory/products/${item.id}`)
                              }
                            >
                              View Product
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">
                No expiring items found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                No items are expiring within the selected time period, or try
                adjusting your search criteria.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpiryTrackingList;
