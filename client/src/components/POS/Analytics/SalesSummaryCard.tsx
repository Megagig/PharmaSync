import React from 'react';
import Card from '@/components/common/Card/Card';
import { formatCurrency } from '@/utils/formatters';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface SalesSummaryCardProps {
  title: string;
  amount: number;
  count: number;
  previousAmount?: number;
  previousCount?: number;
  loading?: boolean;
  className?: string;
}

const SalesSummaryCard: React.FC<SalesSummaryCardProps> = ({
  title,
  amount,
  count,
  previousAmount,
  previousCount,
  loading = false,
  className = '',
}) => {
  // Calculate percentage change
  const amountChange = previousAmount !== undefined
    ? ((amount - previousAmount) / previousAmount) * 100
    : 0;
  
  const countChange = previousCount !== undefined
    ? ((count - previousCount) / previousCount) * 100
    : 0;
  
  return (
    <Card className={`sales-summary-card ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold mb-1">{formatCurrency(amount)}</div>
            <div className="text-sm text-gray-500 mb-2">{count} transactions</div>
            
            {previousAmount !== undefined && (
              <div className="flex items-center">
                <span className={`inline-flex items-center ${amountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {amountChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(amountChange).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-2">from previous period</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default SalesSummaryCard;
