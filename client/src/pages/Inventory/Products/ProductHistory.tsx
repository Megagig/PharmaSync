import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Spinner from '@/components/common/Spinner/Spinner';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

interface ProductHistoryItem {
  _id: string;
  type: string;
  date: string;
  quantity: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
  costPrice?: number;
  sellingPrice?: number;
  location?: string;
  batchNumber?: string;
}

const ProductHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<ProductHistoryItem[]>([]);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchProductHistory = async () => {
      setIsLoading(true);
      try {
        const [productResponse, historyResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/history`)
        ]);
        
        setProduct(productResponse.data.data);
        setHistory(historyResponse.data.data);
      } catch (error) {
        console.error('Error fetching product history:', error);
        showToast('Error fetching product history', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductHistory();
    }
  }, [id, showToast]);

  const getHistoryTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Purchase';
      case 'sale':
        return 'Sale';
      case 'adjustment':
        return 'Adjustment';
      case 'transfer':
        return 'Transfer';
      case 'return':
        return 'Return';
      case 'expiry':
        return 'Expiry';
      case 'damage':
        return 'Damage';
      case 'create':
        return 'Created';
      case 'update':
        return 'Updated';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getHistoryTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'green';
      case 'sale':
        return 'blue';
      case 'adjustment':
        return 'yellow';
      case 'transfer':
        return 'indigo';
      case 'return':
        return 'purple';
      case 'expiry':
        return 'red';
      case 'damage':
        return 'red';
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Product History
          </h2>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getHistoryTypeBadgeColor(item.type)}>
                          {getHistoryTypeLabel(item.type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.batchNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.user ? `${item.user.firstName} ${item.user.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No history available for this product.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductHistory;
