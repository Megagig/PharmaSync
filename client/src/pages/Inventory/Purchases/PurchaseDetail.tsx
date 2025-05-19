import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Badge from '@/components/common/Badge/Badge';
import Modal from '@/components/common/Modal/Modal';
import Select from '@/components/common/Select/Select';
import Input from '@/components/common/Input/Input';
import Spinner from '@/components/common/Spinner/Spinner';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import { PaymentMethod, PaymentDirection } from '@/types/payment.types';

enum PurchaseStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface PurchaseItem {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Purchase {
  _id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplier: {
    _id: string;
    name: string;
    contactPerson: string;
    phone: string;
  };
  status: PurchaseStatus;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentTerms: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const PurchaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CASH);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPurchaseDetails();
    }
  }, [id]);

  // Fetch payments when purchase data is available
  useEffect(() => {
    if (purchase?.supplier?._id) {
      fetchPayments();
    }
  }, [purchase]);

  const fetchPurchaseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/purchases/${id}`);
      console.log('Purchase details response:', response.data);

      // Handle different API response structures
      const purchaseData = response.data.data || response.data;

      // Ensure the purchase has a paymentStatus property
      if (!purchaseData.paymentStatus) {
        purchaseData.paymentStatus = 'unpaid';
      }

      // Ensure product data is properly structured
      if (purchaseData.items && purchaseData.items.length > 0) {
        purchaseData.items = purchaseData.items.map((item: any) => {
          // Handle case where product is just an ID
          if (typeof item.product === 'string') {
            return {
              ...item,
              product: {
                _id: item.product,
                name: item.productName || 'Unknown Product'
              }
            };
          }
          return item;
        });
      }

      console.log('Processed purchase data:', purchaseData);
      setPurchase(purchaseData);
    } catch (err: any) {
      console.error('Error fetching purchase details:', err);
      setError(err.response?.data?.message || 'Failed to fetch purchase details');
      showToast(err.response?.data?.message || 'Failed to fetch purchase details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!purchase || !purchase.supplier || !purchase.supplier._id) return;

      console.log('Fetching payments for supplier:', purchase.supplier._id);
      console.log('Purchase number:', purchase.purchaseNumber);

      const response = await api.get(`/payments?direction=made&supplier=${purchase.supplier._id}`);
      console.log('Payments response:', response.data);

      // Filter payments related to this purchase
      const purchasePayments = response.data.data.filter(
        (payment: Payment) => payment.reference === purchase.purchaseNumber
      );

      console.log('Filtered purchase payments:', purchasePayments);
      setPayments(purchasePayments);
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
      showToast('Failed to fetch payment history', 'error');
    }
  };

  const handlePayInvoice = () => {
    if (purchase) {
      // Calculate remaining amount
      const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = purchase.total - paidAmount;

      // Set default payment amount to remaining amount
      setPaymentAmount(remainingAmount.toString());
      setShowPaymentModal(true);
    }
  };

  const handleSubmitPayment = async () => {
    if (!purchase) return;

    try {
      setIsSubmittingPayment(true);

      // Validate payment amount
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid payment amount', 'error');
        setIsSubmittingPayment(false);
        return;
      }

      // Calculate total paid and determine new payment status
      const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const newTotalPaid = paidAmount + amount;
      let newPaymentStatus = 'unpaid';

      if (newTotalPaid >= purchase.total) {
        newPaymentStatus = 'paid';
      } else if (newTotalPaid > 0) {
        newPaymentStatus = 'partial';
      }

      console.log('Creating payment with amount:', amount);
      console.log('New payment status will be:', newPaymentStatus);

      // Create payment record
      // Generate a payment number on the client side as a fallback
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const paymentNumber = `PYMT-${dateStr}-${randomStr}`;

      const paymentData = {
        paymentNumber, // Include the generated payment number
        amount: amount,
        paymentDate: new Date().toISOString(), // Ensure we have a payment date
        paymentMethod,
        reference: purchase.purchaseNumber,
        notes: paymentNotes,
        direction: PaymentDirection.MADE,
        supplier: purchase.supplier._id
      };

      const paymentResponse = await api.post('/payments', paymentData);
      console.log('Payment created:', paymentResponse.data);

      // Update purchase payment status
      const updateResponse = await api.patch(`/purchases/${purchase._id}`, {
        paymentStatus: newPaymentStatus
      });
      console.log('Purchase updated:', updateResponse.data);

      showToast('Payment recorded successfully', 'success');
      setShowPaymentModal(false);

      // Reset form fields
      setPaymentAmount('');
      setPaymentMethod(PaymentMethod.CASH);
      setPaymentReference('');
      setPaymentNotes('');

      // Refresh purchase and payments data
      fetchPurchaseDetails();
    } catch (err: any) {
      console.error('Payment error:', err);

      // Extract detailed error message if available
      let errorMessage = 'Failed to record payment';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      // Check for validation errors
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const validationErrors = err.response.data.errors.map((e: any) => e.message || e).join(', ');
        errorMessage = `Validation error: ${validationErrors}`;
      }

      // Log detailed error information for debugging
      console.error('Detailed payment error:', {
        message: errorMessage,
        data: err.response?.data,
        paymentData
      });

      showToast(errorMessage, 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case PurchaseStatus.COMPLETED:
        return <Badge color="green">Completed</Badge>;
      case PurchaseStatus.CANCELLED:
        return <Badge color="red">Cancelled</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge color="red">Unpaid</Badge>;
      case 'partial':
        return <Badge color="yellow">Partially Paid</Badge>;
      case 'paid':
        return <Badge color="green">Paid</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!purchase) {
    return <div className="text-gray-500">Purchase not found.</div>;
  }

  // Calculate payment summary
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = Math.max(0, purchase.total - totalPaid);

  // Force payment status to be consistent with payment amounts
  let effectivePaymentStatus = purchase.paymentStatus;
  if (totalPaid >= purchase.total && purchase.paymentStatus !== 'paid') {
    effectivePaymentStatus = 'paid';
    console.log('Overriding payment status to paid based on payment amounts');
  } else if (totalPaid > 0 && totalPaid < purchase.total && purchase.paymentStatus !== 'partial') {
    effectivePaymentStatus = 'partial';
    console.log('Overriding payment status to partial based on payment amounts');
  } else if (totalPaid === 0 && purchase.paymentStatus !== 'unpaid') {
    effectivePaymentStatus = 'unpaid';
    console.log('Overriding payment status to unpaid based on payment amounts');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Purchase: {purchase.purchaseNumber}
          </h1>
          <div className="mt-1 flex items-center space-x-2">
            {getStatusBadge(purchase.status)}
            {getPaymentStatusBadge(effectivePaymentStatus)}
          </div>
        </div>
        <div className="flex space-x-3">
          {effectivePaymentStatus !== 'paid' && (
            <Button variant="primary" onClick={handlePayInvoice}>
              Pay Invoice
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/purchases')}
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Purchase Information</h2>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Purchase Number
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {purchase.purchaseNumber}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Date
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {formatDate(purchase.purchaseDate)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Status
                </span>
                <span className="block mt-1">
                  {getStatusBadge(purchase.status)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Payment Status
                </span>
                <span className="block mt-1">
                  {getPaymentStatusBadge(purchase.paymentStatus)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Payment Terms
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {purchase.paymentTerms}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Supplier Information</h2>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Supplier Name
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {purchase.supplier.name}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Contact Person
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {purchase.supplier.contactPerson || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Phone
                </span>
                <span className="block mt-1 text-sm text-gray-900">
                  {purchase.supplier.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Total Amount
                </span>
                <span className="block mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(purchase.total)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Amount Paid
                </span>
                <span className="block mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Remaining Amount
                </span>
                <span className="block mt-1 text-lg font-semibold text-red-600">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
              {effectivePaymentStatus !== 'paid' && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handlePayInvoice}
                  >
                    Pay Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Purchase Items</h2>
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
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchase.items.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product?.name || item.productName || 'Unknown Product'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                    Subtotal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(purchase.subtotal)}
                  </td>
                </tr>
                {purchase.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                      Discount
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(purchase.discount)}
                    </td>
                  </tr>
                )}
                {purchase.tax > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                      Tax
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(purchase.tax)}
                    </td>
                  </tr>
                )}
                {purchase.shippingCost > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                      Shipping
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(purchase.shippingCost)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(purchase.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </Card>

      {payments.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment Number
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
                      Method
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600 cursor-pointer"
                          onClick={() => navigate(`/payments/${payment._id}`)}>
                          {payment.paymentNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {purchase.notes && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Notes</h2>
            <p className="text-sm text-gray-700">{purchase.notes}</p>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Amount (₦)"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            required
          >
            <option value={PaymentMethod.CASH}>Cash</option>
            <option value={PaymentMethod.CARD}>Card</option>
            <option value={PaymentMethod.TRANSFER}>Bank Transfer</option>
            <option value={PaymentMethod.CHEQUE}>Cheque</option>
            <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
          </Select>
          <Input
            label="Reference (Optional)"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />
          <Input
            label="Notes (Optional)"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={isSubmittingPayment}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitPayment}
              disabled={isSubmittingPayment}
            >
              {isSubmittingPayment ? <Spinner size="sm" /> : 'Record Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseDetail;
