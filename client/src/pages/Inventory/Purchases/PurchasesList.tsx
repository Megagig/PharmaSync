import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Spinner from '@/components/common/Spinner/Spinner';
import Badge from '@/components/common/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

enum PurchaseStatus {
  DRAFT = 'draft',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

interface PurchaseItem {
  product?: string;
  medication?: string;
  name: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

interface Purchase {
  _id: string;
  referenceNumber: string;
  supplier: {
    _id: string;
    name: string;
  };
  date: Date;
  expectedDeliveryDate?: Date;
  status: PurchaseStatus;
  items: PurchaseItem[];
  totalAmount: number;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PurchasesList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (dateFilter) {
        const today = new Date();
        let startDate = new Date();

        switch (dateFilter) {
          case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(today.setMonth(today.getMonth() - 3));
            break;
          default:
            break;
        }

        params.append('startDate', startDate.toISOString());
      }

      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await api.get(`/purchases?${params.toString()}`);
      setPurchases(response.data.data.purchases);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showToast('Error fetching purchases', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, statusFilter, dateFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPurchases();
  };

  const handleDeletePurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await api.delete(`/purchases/${id}`);
        showToast('Purchase deleted successfully', 'success');
        fetchPurchases();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        showToast('Error deleting purchase', 'error');
      }
    }
  };

  const handleCancelPurchase = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this purchase?')) {
      try {
        await api.patch(`/purchases/${id}/cancel`);
        showToast('Purchase cancelled successfully', 'success');
        fetchPurchases();
      } catch (error) {
        console.error('Error cancelling purchase:', error);
        showToast('Error cancelling purchase', 'error');
      }
    }
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.DRAFT:
        return <Badge color="gray">Draft</Badge>;
      case PurchaseStatus.ORDERED:
        return <Badge color="blue">Ordered</Badge>;
      case PurchaseStatus.PARTIALLY_RECEIVED:
        return <Badge color="yellow">Partially Received</Badge>;
      case PurchaseStatus.RECEIVED:
        return <Badge color="green">Received</Badge>;
      case PurchaseStatus.CANCELLED:
        return <Badge color="red">Cancelled</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={() => navigate('/inventory/purchases/new')}
          >
            Create Purchase Order
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
                placeholder="Search by reference number or supplier"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  ...Object.values(PurchaseStatus).map((status) => ({
                    value: status,
                    label: status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                  })),
                ]}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Date Range"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'Last 7 Days' },
                  { value: 'month', label: 'Last 30 Days' },
                  { value: 'quarter', label: 'Last 90 Days' },
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
          ) : purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Reference
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Supplier
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
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
                  {purchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium text-blue-600 cursor-pointer"
                          onClick={() =>
                            navigate(`/inventory/purchases/${purchase._id}`)
                          }
                        >
                          {purchase.referenceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {purchase.supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(purchase.date).toLocaleDateString()}
                        </div>
                        {purchase.expectedDeliveryDate && (
                          <div className="text-xs text-gray-500">
                            Expected:{' '}
                            {new Date(
                              purchase.expectedDeliveryDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(purchase.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {purchase.items.length} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(purchase.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(`/inventory/purchases/${purchase._id}`)
                            }
                          >
                            View
                          </Button>
                          {purchase.status === PurchaseStatus.DRAFT && (
                            <>
                              <Button
                                variant="text"
                                onClick={() =>
                                  navigate(
                                    `/inventory/purchases/${purchase._id}/edit`
                                  )
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                variant="text"
                                color="danger"
                                onClick={() =>
                                  handleDeletePurchase(purchase._id)
                                }
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          {(purchase.status === PurchaseStatus.ORDERED ||
                            purchase.status ===
                              PurchaseStatus.PARTIALLY_RECEIVED) && (
                            <>
                              <Button
                                variant="text"
                                onClick={() =>
                                  navigate(
                                    `/inventory/purchases/${purchase._id}/receive`
                                  )
                                }
                              >
                                Receive
                              </Button>
                              <Button
                                variant="text"
                                color="danger"
                                onClick={() =>
                                  handleCancelPurchase(purchase._id)
                                }
                              >
                                Cancel
                              </Button>
                            </>
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
                No purchases found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || statusFilter || dateFilter
                  ? 'Try adjusting your search criteria.'
                  : 'Create your first purchase order to get started.'}
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

export default PurchasesList;
