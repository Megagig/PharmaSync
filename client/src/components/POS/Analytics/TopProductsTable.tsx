import React from 'react';
import Card from '@/components/common/Card/Card';
import { formatCurrency } from '@/utils/formatters';

interface TopProduct {
  _id: string;
  productName: string;
  productSku: string;
  totalQuantity: number;
  totalSales: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
  title?: string;
  loading?: boolean;
  className?: string;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  title = 'Top Selling Products',
  loading = false,
  className = '',
}) => {
  return (
    <Card className={`top-products-table ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName || 'Unknown Product'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.productSku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.totalSales)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TopProductsTable;
