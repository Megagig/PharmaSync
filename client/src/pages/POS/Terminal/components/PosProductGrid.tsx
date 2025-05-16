import { useState, useEffect } from 'react';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

interface PosProductGridProps {
  onSelectProduct: (product: any) => void;
}

const PosProductGrid = ({ onSelectProduct }: PosProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, searchTerm, sortBy, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/products', {
        params: {
          page: currentPage,
          limit: 12,
          category: selectedCategory,
          search: searchTerm,
          sortBy,
          isActive: true,
        },
      });

      console.log('Product API response:', response.data);

      // Handle different response formats
      if (response.data && response.data.data) {
        let productsArray = [];
        let pagesCount = 1;

        if (Array.isArray(response.data.data)) {
          // Direct array of products
          productsArray = response.data.data;
        } else if (
          response.data.data.products &&
          Array.isArray(response.data.data.products)
        ) {
          // Products nested in data.products
          productsArray = response.data.data.products;

          // Get pagination info if available
          if (response.data.data.meta && response.data.data.meta.totalPages) {
            pagesCount = response.data.data.meta.totalPages;
          } else if (response.data.data.meta && response.data.data.meta.pages) {
            pagesCount = response.data.data.meta.pages;
          }
        } else {
          // If data.data is an object but not in expected format, try to find arrays
          const possibleArrays = Object.values(response.data.data).filter(
            (val) => Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Use the first array found
            productsArray = possibleArrays[0] as any[];
            console.log('Found products array in response:', possibleArrays[0]);
          } else {
            console.error('Unexpected product data format:', response.data);
          }
        }

        // Process products to ensure they have the required fields
        const processedProducts = productsArray.map((product) => {
          // Make sure each product has the required fields
          return {
            ...product,
            _id: product._id || '',
            name: product.name || 'Unknown Product',
            sku: product.sku || 'No SKU',
            defaultPrice: product.defaultPrice || 0,
            totalStock: product.totalStock || 0,
            images: product.images || [],
          };
        });

        console.log('Processed products:', processedProducts);
        setProducts(processedProducts);
        setTotalPages(pagesCount);
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array in response
        const processedProducts = response.data.map((product) => ({
          ...product,
          _id: product._id || '',
          name: product.name || 'Unknown Product',
          sku: product.sku || 'No SKU',
          defaultPrice: product.defaultPrice || 0,
          totalStock: product.totalStock || 0,
          images: product.images || [],
        }));

        setProducts(processedProducts);
        setTotalPages(1);
      } else {
        console.error('Invalid API response format:', response.data);
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      setError(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // This would be replaced with an actual API call to get categories
      // For now, we'll use a mock list
      setCategories([
        'MEDICATION',
        'SUPPLEMENT',
        'COSMETIC',
        'DEVICE',
        'CONSUMABLE',
        'OTHER',
      ]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('name');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="defaultPrice">Sort by Price</option>
          <option value="createdAt">Sort by Date Added</option>
        </Select>

        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !Array.isArray(products) ? (
        <div className="text-center py-8 text-gray-500">
          <p>Error loading products</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card
                key={product._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  console.log('Selected product from grid:', product);
                  if (!product._id) {
                    console.error('Product is missing _id:', product);
                    return;
                  }
                  onSelectProduct({
                    ...product,
                    _id: product._id,
                    name: product.name || 'Unknown Product',
                    sku: product.sku || 'No SKU',
                    defaultPrice: product.defaultPrice || 0,
                    totalStock: product.totalStock || 0,
                  });
                }}
              >
                <div className="p-4">
                  <div className="h-32 flex items-center justify-center mb-2">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent double triggering with card click
                          console.log(
                            'Selected product from image click:',
                            product
                          );
                          if (!product._id) {
                            console.error('Product is missing _id:', product);
                            return;
                          }
                          onSelectProduct({
                            ...product,
                            _id: product._id,
                            name: product.name || 'Unknown Product',
                            sku: product.sku || 'No SKU',
                            defaultPrice: product.defaultPrice || 0,
                            totalStock: product.totalStock || 0,
                          });
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent double triggering with card click
                          console.log(
                            'Selected product from placeholder click:',
                            product
                          );
                          if (!product._id) {
                            console.error('Product is missing _id:', product);
                            return;
                          }
                          onSelectProduct({
                            ...product,
                            _id: product._id,
                            name: product.name || 'Unknown Product',
                            sku: product.sku || 'No SKU',
                            defaultPrice: product.defaultPrice || 0,
                            totalStock: product.totalStock || 0,
                          });
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 h-10">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600">{product.sku}</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(product.defaultPrice)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Stock: {product.totalStock || 0}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PosProductGrid;
