import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createPayment } from '@/store/slices/paymentsSlice';
import { PaymentFormData, PaymentMethod, PaymentDirection } from '@/types/payment.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const CreatePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.payments);

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialDirection = queryParams.get('direction') === 'made' 
    ? PaymentDirection.MADE 
    : PaymentDirection.RECEIVED;
  const initialInvoiceId = queryParams.get('invoice') || '';
  const initialSaleId = queryParams.get('sale') || '';
  const initialPurchaseOrderId = queryParams.get('purchaseOrder') || '';
  const initialCustomerId = queryParams.get('customer') || '';
  const initialSupplierId = queryParams.get('supplier') || '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    reference: '',
    notes: '',
    direction: initialDirection,
    invoice: initialInvoiceId,
    sale: initialSaleId,
    purchaseOrder: initialPurchaseOrderId,
    customer: initialCustomerId,
    supplier: initialSupplierId,
  });

  useEffect(() => {
    // Load customers if receiving payment
    if (formData.direction === PaymentDirection.RECEIVED) {
      const fetchCustomers = async () => {
        try {
          const response = await api.get('/customers?isActive=true');
          setCustomers(response.data.data);
        } catch (error) {
          console.error('Error fetching customers:', error);
        }
      };
      fetchCustomers();
    }

    // Load suppliers if making payment
    if (formData.direction === PaymentDirection.MADE) {
      const fetchSuppliers = async () => {
        try {
          const response = await api.get('/suppliers?isActive=true');
          setSuppliers(response.data.data);
        } catch (error) {
          console.error('Error fetching suppliers:', error);
        }
      };
      fetchSuppliers();
    }

    // Load invoices based on direction
    const fetchInvoices = async () => {
      try {
        const type = formData.direction === PaymentDirection.RECEIVED ? 'sales' : 'purchase';
        const status = 'draft,sent,partial,overdue';
        const response = await api.get(`/invoices?type=${type}&status=${status}`);
        setInvoices(response.data.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };
    fetchInvoices();

    // Load sales if receiving payment
    if (formData.direction === PaymentDirection.RECEIVED) {
      const fetchSales = async () => {
        try {
          const response = await api.get('/sales?paymentStatus=unpaid,partial');
          setSales(response.data.data);
        } catch (error) {
          console.error('Error fetching sales:', error);
        }
      };
      fetchSales();
    }

    // Load purchase orders if making payment
    if (formData.direction === PaymentDirection.MADE) {
      const fetchPurchaseOrders = async () => {
        try {
          const response = await api.get('/purchase-orders?paymentStatus=unpaid,partial');
          setPurchaseOrders(response.data.data);
        } catch (error) {
          console.error('Error fetching purchase orders:', error);
        }
      };
      fetchPurchaseOrders();
    }
  }, [formData.direction]);

  useEffect(() => {
    // Load specific invoice if provided
    if (initialInvoiceId) {
      const fetchInvoice = async () => {
        try {
          const response = await api.get(`/invoices/${initialInvoiceId}`);
          const invoice = response.data.data;
          setSelectedInvoice(invoice);
          
          // Pre-populate form with invoice data
          setFormData(prev => ({
            ...prev,
            amount: invoice.balance,
            customer: invoice.type === 'sales' && invoice.customer ? 
              (typeof invoice.customer === 'object' ? invoice.customer._id : invoice.customer) : 
              prev.customer,
            supplier: invoice.type === 'purchase' && invoice.supplier ? 
              (typeof invoice.supplier === 'object' ? invoice.supplier._id : invoice.supplier) : 
              prev.supplier,
          }));
        } catch (error) {
          console.error('Error fetching invoice:', error);
        }
      };
      fetchInvoice();
    }

    // Load specific sale if provided
    if (initialSaleId) {
      const fetchSale = async () => {
        try {
          const response = await api.get(`/sales/${initialSaleId}`);
          const sale = response.data.data;
          setSelectedSale(sale);
          
          // Pre-populate form with sale data
          setFormData(prev => ({
            ...prev,
            amount: sale.total,
            customer: typeof sale.customer === 'object' ? sale.customer._id : sale.customer,
          }));
        } catch (error) {
          console.error('Error fetching sale:', error);
        }
      };
      fetchSale();
    }

    // Load specific purchase order if provided
    if (initialPurchaseOrderId) {
      const fetchPurchaseOrder = async () => {
        try {
          const response = await api.get(`/purchase-orders/${initialPurchaseOrderId}`);
          const po = response.data.data;
          setSelectedPurchaseOrder(po);
          
          // Pre-populate form with purchase order data
          setFormData(prev => ({
            ...prev,
            amount: po.total,
            supplier: typeof po.supplier === 'object' ? po.supplier._id : po.supplier,
          }));
        } catch (error) {
          console.error('Error fetching purchase order:', error);
        }
      };
      fetchPurchaseOrder();
    }

    // Load specific customer if provided
    if (initialCustomerId) {
      const fetchCustomer = async () => {
        try {
          const response = await api.get(`/customers/${initialCustomerId}`);
          setSelectedCustomer(response.data.data);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      };
      fetchCustomer();
    }

    // Load specific supplier if provided
    if (initialSupplierId) {
      const fetchSupplier = async () => {
        try {
          const response = await api.get(`/suppliers/${initialSupplierId}`);
          setSelectedSupplier(response.data.data);
        } catch (error) {
          console.error('Error fetching supplier:', error);
        }
      };
      fetchSupplier();
    }
  }, [initialInvoiceId, initialSaleId, initialPurchaseOrderId, initialCustomerId, initialSupplierId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentDate: date,
    }));
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDirection = e.target.value as PaymentDirection;
    setFormData((prev) => ({
      ...prev,
      direction: newDirection,
      // Reset related fields when direction changes
      customer: newDirection === PaymentDirection.RECEIVED ? prev.customer : undefined,
      supplier: newDirection === PaymentDirection.MADE ? prev.supplier : undefined,
      invoice: undefined,
      sale: newDirection === PaymentDirection.RECEIVED ? prev.sale : undefined,
      purchaseOrder: newDirection === PaymentDirection.MADE ? prev.purchaseOrder : undefined,
    }));
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = e.target.value;
    
    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      invoice: invoiceId || undefined,
      sale: undefined,
      purchaseOrder: undefined,
    }));
    
    if (invoiceId) {
      const invoice = invoices.find(inv => inv._id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setFormData((prev) => ({
          ...prev,
          amount: invoice.balance,
          customer: invoice.type === 'sales' && invoice.customer ? 
            (typeof invoice.customer === 'object' ? invoice.customer._id : invoice.customer) : 
            undefined,
          supplier: invoice.type === 'purchase' && invoice.supplier ? 
            (typeof invoice.supplier === 'object' ? invoice.supplier._id : invoice.supplier) : 
            undefined,
        }));
      }
    } else {
      setSelectedInvoice(null);
    }
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const saleId = e.target.value;
    
    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      sale: saleId || undefined,
      invoice: undefined,
      purchaseOrder: undefined,
    }));
    
    if (saleId) {
      const sale = sales.find(s => s._id === saleId);
      if (sale) {
        setSelectedSale(sale);
        setFormData((prev) => ({
          ...prev,
          amount: sale.total,
          customer: typeof sale.customer === 'object' ? sale.customer._id : sale.customer,
        }));
      }
    } else {
      setSelectedSale(null);
    }
  };

  const handlePurchaseOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poId = e.target.value;
    
    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      purchaseOrder: poId || undefined,
      invoice: undefined,
      sale: undefined,
    }));
    
    if (poId) {
      const po = purchaseOrders.find(p => p._id === poId);
      if (po) {
        setSelectedPurchaseOrder(po);
        setFormData((prev) => ({
          ...prev,
          amount: po.total,
          supplier: typeof po.supplier === 'object' ? po.supplier._id : po.supplier,
        }));
      }
    } else {
      setSelectedPurchaseOrder(null);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customer: customerId || undefined,
    }));
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      supplier: supplierId || undefined,
    }));
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      alert('Amount must be greater than zero');
      return false;
    }

    if (formData.direction === PaymentDirection.RECEIVED) {
      if (!formData.customer && !formData.sale && !formData.invoice) {
        alert('Please select a customer, sale, or invoice');
        return false;
      }
    } else {
      if (!formData.supplier && !formData.purchaseOrder && !formData.invoice) {
        alert('Please select a supplier, purchase order, or invoice');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(createPayment(formData) as any);
      if (createPayment.fulfilled.match(resultAction)) {
        navigate(`/payments/${resultAction.payload._id}`);
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {formData.direction === PaymentDirection.RECEIVED ? 'Receive Payment' : 'Make Payment'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/payments')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              <div className="space-y-4">
                <Select
                  label="Payment Direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleDirectionChange}
                  disabled={!!initialInvoiceId || !!initialSaleId || !!initialPurchaseOrderId}
                >
                  <option value={PaymentDirection.RECEIVED}>Receive Payment</option>
                  <option value={PaymentDirection.MADE}>Make Payment</option>
                </Select>

                <Input
                  type="number"
                  label="Amount (₦)"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                />

                <DatePicker
                  label="Payment Date"
                  value={formData.paymentDate || ''}
                  onChange={handleDateChange}
                  required
                />

                <Select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.CARD}>Card</option>
                  <option value={PaymentMethod.TRANSFER}>Transfer</option>
                  <option value={PaymentMethod.CHEQUE}>Cheque</option>
                  <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
                  <option value={PaymentMethod.CREDIT}>Credit</option>
                </Select>

                <Input
                  label="Reference"
                  name="reference"
                  value={formData.reference || ''}
                  onChange={handleInputChange}
                  placeholder="Transaction ID, Cheque Number, etc."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Related To</h2>
              <div className="space-y-4">
                {formData.direction === PaymentDirection.RECEIVED && (
                  <>
                    <Select
                      label="Customer"
                      name="customer"
                      value={formData.customer || ''}
                      onChange={handleCustomerChange}
                      disabled={!!initialInvoiceId || !!initialSaleId}
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.firstName} {customer.lastName} ({customer.customerNumber})
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Invoice"
                      value={formData.invoice || ''}
                      onChange={handleInvoiceChange}
                      disabled={!!initialInvoiceId || !!initialSaleId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Invoice</option>
                      {invoices
                        .filter(inv => inv.type === 'sales')
                        .map((invoice) => (
                          <option key={invoice._id} value={invoice._id}>
                            {invoice.invoiceNumber} - {formatCurrency(invoice.balance)}
                          </option>
                        ))}
                    </Select>

                    <Select
                      label="Sale"
                      value={formData.sale || ''}
                      onChange={handleSaleChange}
                      disabled={!!initialInvoiceId || !!initialSaleId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Sale</option>
                      {sales.map((sale) => (
                        <option key={sale._id} value={sale._id}>
                          {sale.saleNumber} - {formatCurrency(sale.total)}
                        </option>
                      ))}
                    </Select>
                  </>
                )}

                {formData.direction === PaymentDirection.MADE && (
                  <>
                    <Select
                      label="Supplier"
                      name="supplier"
                      value={formData.supplier || ''}
                      onChange={handleSupplierChange}
                      disabled={!!initialInvoiceId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} ({supplier.supplierCode})
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Invoice"
                      value={formData.invoice || ''}
                      onChange={handleInvoiceChange}
                      disabled={!!initialInvoiceId || !!initialSaleId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Invoice</option>
                      {invoices
                        .filter(inv => inv.type === 'purchase')
                        .map((invoice) => (
                          <option key={invoice._id} value={invoice._id}>
                            {invoice.invoiceNumber} - {formatCurrency(invoice.balance)}
                          </option>
                        ))}
                    </Select>

                    <Select
                      label="Purchase Order"
                      value={formData.purchaseOrder || ''}
                      onChange={handlePurchaseOrderChange}
                      disabled={!!initialInvoiceId || !!initialSaleId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Purchase Order</option>
                      {purchaseOrders.map((po) => (
                        <option key={po._id} value={po._id}>
                          {po.orderNumber} - {formatCurrency(po.total)}
                        </option>
                      ))}
                    </Select>
                  </>
                )}

                {selectedInvoice && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">Selected Invoice Details</h3>
                    <p><span className="font-medium">Invoice Number:</span> {selectedInvoice.invoiceNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(selectedInvoice.total)}</p>
                    <p><span className="font-medium">Balance:</span> {formatCurrency(selectedInvoice.balance)}</p>
                  </div>
                )}

                {selectedSale && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">Selected Sale Details</h3>
                    <p><span className="font-medium">Sale Number:</span> {selectedSale.saleNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedSale.saleDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(selectedSale.total)}</p>
                  </div>
                )}

                {selectedPurchaseOrder && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">Selected Purchase Order Details</h3>
                    <p><span className="font-medium">PO Number:</span> {selectedPurchaseOrder.orderNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedPurchaseOrder.orderDate).toLocaleDateString()}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(selectedPurchaseOrder.total)}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/payments')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : formData.direction === PaymentDirection.RECEIVED ? 'Receive Payment' : 'Make Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePayment;
