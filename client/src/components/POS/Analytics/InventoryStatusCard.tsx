import React from 'react';
import Card from '@/components/common/Card/Card';
import { formatCurrency } from '@/utils/formatters';
import { FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

interface InventoryStatusCardProps {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  loading?: boolean;
  className?: string;
}

const InventoryStatusCard: React.FC<InventoryStatusCardProps> = ({
  totalProducts,
  totalStock,
  totalValue,
  lowStockCount,
  expiringCount,
  loading = false,
  className = '',
}) => {
  return (
    <Card className={`inventory-status-card ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Inventory Status</h3>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Products</div>
                <div className="text-xl font-bold">{totalProducts}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Stock</div>
                <div className="text-xl font-bold">{totalStock}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Inventory Value</div>
              <div className="text-xl font-bold">{formatCurrency(totalValue)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Low Stock</div>
                  <div className="text-lg font-bold">{lowStockCount}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="text-red-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">Expiring Soon</div>
                  <div className="text-lg font-bold">{expiringCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InventoryStatusCard;
