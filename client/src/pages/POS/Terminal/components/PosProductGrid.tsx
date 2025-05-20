import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/productSlice';
import Card from '@/components/common/Card/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage/ErrorMessage';
import { formatCurrency } from '@/utils/formatters';

interface PosProductGridProps {
  onSelectProduct: (product: any) => void;
}

const PosProductGrid: React.FC<PosProductGridProps> = ({ onSelectProduct }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, error } = useSelector(
    (state: RootState) => state.products
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ search: searchTerm, limit: 50 }));
  }, [dispatch, searchTerm]);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchProducts({ search: searchTerm, limit: 50 }))}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product._id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => onSelectProduct(product)}
          >
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {product.category?.name || 'Uncategorized'}
              </p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Stock: {product.quantity}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      )}
    </div>
  );
};

export default PosProductGrid;
