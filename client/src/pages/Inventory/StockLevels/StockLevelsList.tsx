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

interface StockItem {
  id: string;
  name: string;
  sku?: string;
  type: 'product' | 'medication';
  productType?: string;
  category?: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  dosageForm?: string;
  totalStock: number;
  minimumStockLevel: number;
  reorderPoint: number;
  reorderQuantity?: number;
}

const StockLevelsList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productType, setProductType] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStockLevels = async () => {
    setIsLoading(true);
    try {
      // Get low stock alerts from the inventory endpoint
      const params = new URLSearchParams();
      if (productType) params.append('productType', productType);

      const response = await api.get(
        `/inventory/low-stock?${params.toString()}`
      );
      let items = response.data.data;

      // If we're not filtering for low stock only, get all products too
      if (stockFilter !== 'low') {
        const productsResponse = await api.get('/products');
        const products = productsResponse.data.data.products;

        // Merge with existing items, avoiding duplicates
        const existingIds = new Set(items.map((item: StockItem) => item.id));
        const additionalProducts = products.filter(
          (product: any) => !existingIds.has(product._id)
        );

        items = [
          ...items,
          ...additionalProducts.map((product: any) => ({
            id: product._id,
            name: product.name,
            sku: product.sku,
            type: 'product',
            productType: product.type,
            category: product.category,
            totalStock: product.totalStock,
            minimumStockLevel: product.minimumStockLevel,
            reorderPoint: product.reorderPoint,
            reorderQuantity: product.reorderQuantity,
          })),
        ];
      }

      // Apply search filter
      if (searchTerm) {
        items = items.filter(
          (item: StockItem) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku &&
              item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.genericName &&
              item.genericName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (item.brandName &&
              item.brandName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply stock level filter
      if (stockFilter === 'low') {
        items = items.filter(
          (item: StockItem) => item.totalStock <= item.reorderPoint
        );
      } else if (stockFilter === 'out') {
        items = items.filter((item: StockItem) => item.totalStock <= 0);
      } else if (stockFilter === 'normal') {
        items = items.filter(
          (item: StockItem) =>
            item.totalStock > item.reorderPoint && item.totalStock > 0
        );
      }

      // Sort by stock status (out of stock first, then low stock, then normal)
      items.sort((a: StockItem, b: StockItem) => {
        if (a.totalStock <= 0 && b.totalStock > 0) return -1;
        if (a.totalStock > 0 && b.totalStock <= 0) return 1;
        if (a.totalStock <= a.reorderPoint && b.totalStock > b.reorderPoint)
          return -1;
        if (a.totalStock > a.reorderPoint && b.totalStock <= b.reorderPoint)
          return 1;
        return a.name.localeCompare(b.name);
      });

      setStockItems(items);
      setTotalPages(Math.ceil(items.length / 10));
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      showToast('Error fetching stock levels', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLevels();
  }, [productType, stockFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStockLevels();
  };

  const handleAdjustStock = (item: StockItem) => {
    if (item.type === 'product') {
      navigate(`/inventory/products/${item.id}/inventory`);
    } else {
      navigate('/inventory/adjust', { state: { medicationId: item.id } });
    }
  };

  const getStockStatusBadge = (item: StockItem) => {
    if (item.totalStock <= 0) {
      return <Badge color="red">Out of Stock</Badge>;
    } else if (item.totalStock <= item.reorderPoint) {
      return <Badge color="yellow">Low Stock</Badge>;
    } else {
      return <Badge color="green">In Stock</Badge>;
    }
  };

  const getProductTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Pagination
  const paginatedItems = stockItems.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Stock Levels</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/adjust')}
          >
            Adjust Stock
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
                placeholder="Search by name, SKU, or brand"
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
                placeholder="Stock Status"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Stock' },
                  { value: 'low', label: 'Low Stock' },
                  { value: 'out', label: 'Out of Stock' },
                  { value: 'normal', label: 'Normal Stock' },
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr key={item.id}>
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
                            {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.type === 'product'
                            ? getProductTypeLabel(item.productType || '')
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
                        {getStockStatusBadge(item)}
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
                              Edit
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
                No items found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
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

export default StockLevelsList;
