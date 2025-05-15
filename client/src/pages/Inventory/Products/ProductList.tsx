import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Spinner from '@/components/common/Spinner/Spinner';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { Product, ProductType } from '@/types/product';
import api from '@/services/api';

const ProductList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productType, setProductType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (productType) params.append('type', productType);
      params.append('page', currentPage.toString());

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data.products);
      setTotalPages(response.data.data.meta.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error fetching products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, productType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        showToast('Product deleted successfully', 'success');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product', 'error');
      }
    }
  };

  const getProductTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStockStatusBadge = (product: Product) => {
    const stockLevel = product.totalStock;

    if (stockLevel <= 0) {
      return <Badge color="red">Out of Stock</Badge>;
    } else if (stockLevel <= product.reorderPoint) {
      return <Badge color="yellow">Low Stock</Badge>;
    } else if (
      product.maximumStockLevel &&
      stockLevel >= product.maximumStockLevel
    ) {
      return <Badge color="blue">Overstocked</Badge>;
    } else {
      return <Badge color="green">In Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/products/new')}
          >
            Add New Product
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
                placeholder="Search by name, SKU, or barcode"
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
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      SKU
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
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
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
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className={!product.isActive ? 'bg-gray-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.brand && (
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getProductTypeLabel(product.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₦{product.defaultPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.totalStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockStatusBadge(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(`/inventory/products/${product._id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(
                                `/inventory/products/${product._id}/inventory`
                              )
                            }
                          >
                            Inventory
                          </Button>
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(
                                `/inventory/products/${product._id}/history`
                              )
                            }
                          >
                            History
                          </Button>
                          <Button
                            variant="text"
                            color="danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </Button>
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
                No products found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search or create a new product.
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

export default ProductList;
