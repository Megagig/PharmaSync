import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchReturns } from '@/store/slices/returnsSlice';
import { ReturnStatus, RefundStatus } from '@/types/return.types';
import Card from '@/components/common/Card/Card';
import Badge from '@/components/common/Badge/Badge';
import Button from '@/components/common/Button/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';

const RecentReturns: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { returns, isLoading } = useSelector((state: RootState) => state.returns);

  useEffect(() => {
    dispatch(fetchReturns({ limit: 5 }) as any);
  }, [dispatch]);

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case ReturnStatus.COMPLETED:
        return <Badge color="success">Completed</Badge>;
      case ReturnStatus.APPROVED:
        return <Badge color="info">Approved</Badge>;
      case ReturnStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case ReturnStatus.REJECTED:
        return <Badge color="danger">Rejected</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  const getRefundStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case RefundStatus.PROCESSED:
        return <Badge color="success">Processed</Badge>;
      case RefundStatus.PENDING:
        return <Badge color="warning">Pending</Badge>;
      case RefundStatus.CANCELLED:
        return <Badge color="danger">Cancelled</Badge>;
      default:
        return <Badge color="default">{status}</Badge>;
    }
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Returns & Refunds
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/returns')}
          >
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : returns.length === 0 ? (
          <p className="text-gray-500">No returns found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((returnItem) => (
                  <tr 
                    key={returnItem._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/returns/${returnItem._id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-600">
                        {returnItem.returnNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(returnItem.returnDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof returnItem.customer === 'object'
                          ? `${returnItem.customer.firstName} ${returnItem.customer.lastName}`
                          : 'Unknown Customer'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(returnItem.total)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(returnItem.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getRefundStatusBadge(returnItem.refundStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentReturns;
