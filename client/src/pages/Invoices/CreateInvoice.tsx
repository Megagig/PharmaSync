import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createInvoice } from '@/store/slices/invoicesSlice';
import { InvoiceFormData, InvoiceType } from '@/types/invoice.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.invoices
  );

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialType =
    queryParams.get('type') === 'purchase'
      ? InvoiceType.PURCHASE
      : InvoiceType.SALES;
  const initialSaleId = queryParams.get('sale') || '';
  const initialPurchaseOrderId = queryParams.get('purchaseOrder') || '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [productDetails, setProductDetails] = useState<any>(null);

  const [formData, setFormData] = useState<InvoiceFormData>({
    type: initialType,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days from now
    items: [],
    discount: 0,
    tax: 0,
    notes: '',
    termsAndConditions:
      'Payment is due within 30 days of invoice date. Late payments are subject to a 5% fee.',
    sale: initialSaleId,
    purchaseOrder: initialPurchaseOrderId,
  });

  useEffect(() => {
    // Load customers if sales invoice
    if (formData.type === InvoiceType.SALES) {
      const fetchCustomers = async () => {
        try {
          const response = await api.get('/customers?isActive=true');
          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setCustomers(response.data.data);
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setCustomers(response.data);
          } else {
            console.error('Unexpected API response format:', response.data);
            setCustomers([]);
          }
        } catch (error) {
          console.error('Error fetching customers:', error);
          setCustomers([]);
        }
      };
      fetchCustomers();
    }

    // Load suppliers if purchase invoice
    if (formData.type === InvoiceType.PURCHASE) {
      const fetchSuppliers = async () => {
        try {
          const response = await api.get('/suppliers?isActive=true');
          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setSuppliers(response.data.data);
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setSuppliers(response.data);
          } else {
            console.error('Unexpected API response format:', response.data);
            setSuppliers([]);
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setSuppliers([]);
        }
      };
      fetchSuppliers();
    }

    // Load products
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?isActive=true');
        // Check if response.data.data exists and is an array
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setProducts(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where API returns array directly
          setProducts(response.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };
    fetchProducts();

    // Load sales if needed
    if (initialSaleId) {
      const fetchSale = async () => {
        try {
          const response = await api.get(`/sales/${initialSaleId}`);
          const sale = response.data.data;

          // Pre-populate form with sale data
          setFormData((prev) => ({
            ...prev,
            customer:
              typeof sale.customer === 'object'
                ? sale.customer._id
                : sale.customer,
            items: sale.items.map((item: any) => ({
              product:
                typeof item.product === 'object'
                  ? item.product._id
                  : item.product,
              description:
                typeof item.product === 'object'
                  ? item.product.name
                  : 'Product',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              tax: 0,
            })),
            discount: sale.discount,
            tax: sale.tax,
          }));
        } catch (error) {
          console.error('Error fetching sale:', error);
        }
      };
      fetchSale();
    }

    // Load purchase order if needed
    if (initialPurchaseOrderId) {
      const fetchPurchaseOrder = async () => {
        try {
          const response = await api.get(
            `/purchase-orders/${initialPurchaseOrderId}`
          );
          const po = response.data.data;

          // Pre-populate form with purchase order data
          setFormData((prev) => ({
            ...prev,
            supplier:
              typeof po.supplier === 'object' ? po.supplier._id : po.supplier,
            items: po.items.map((item: any) => ({
              product:
                typeof item.product === 'object'
                  ? item.product._id
                  : item.product,
              description:
                typeof item.product === 'object'
                  ? item.product.name
                  : 'Product',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: 0,
              tax: 0,
            })),
            discount: po.discount,
            tax: po.tax,
          }));
        } catch (error) {
          console.error('Error fetching purchase order:', error);
        }
      };
      fetchPurchaseOrder();
    }
  }, [formData.type, initialSaleId, initialPurchaseOrderId]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductDetails();
    } else {
      setProductDetails(null);
      setUnitPrice(0);
      setProductDescription('');
    }
  }, [selectedProduct]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${selectedProduct}`);
      const product = response.data.data;
      setProductDetails(product);

      // Set default price
      setUnitPrice(product.defaultPrice);

      // Set description
      setProductDescription(product.name);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field: string, date: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as InvoiceType;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      customer: newType === InvoiceType.SALES ? prev.customer : undefined,
      supplier: newType === InvoiceType.PURCHASE ? prev.supplier : undefined,
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || !productDescription || quantity <= 0) {
      alert(
        'Please select a product, enter a description, and specify a valid quantity'
      );
      return;
    }

    const newItem = {
      product: selectedProduct,
      description: productDescription,
      quantity,
      unitPrice,
      discount: discount || 0,
      tax: tax || 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset item form
    setSelectedProduct('');
    setProductDescription('');
    setQuantity(1);
    setUnitPrice(0);
    setDiscount(0);
    setTax(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateItemSubtotal = (
    quantity: number,
    unitPrice: number,
    discount: number,
    tax: number
  ) => {
    return (quantity * unitPrice - discount) * (1 + tax / 100);
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return (
        sum +
        calculateItemSubtotal(
          item.quantity,
          item.unitPrice,
          item.discount || 0,
          item.tax || 0
        )
      );
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (formData.discount || 0) + (formData.tax || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === InvoiceType.SALES && !formData.customer) {
      alert('Please select a customer');
      return;
    }

    if (formData.type === InvoiceType.PURCHASE && !formData.supplier) {
      alert('Please select a supplier');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const resultAction = await dispatch(createInvoice(formData) as any);
      if (createInvoice.fulfilled.match(resultAction)) {
        navigate(`/invoices/${resultAction.payload._id}`);
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create New{' '}
          {formData.type === InvoiceType.SALES ? 'Sales' : 'Purchase'} Invoice
        </h1>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
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
              <h2 className="text-lg font-medium mb-4">Invoice Information</h2>
              <div className="space-y-4">
                <Select
                  label="Invoice Type"
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  disabled={!!initialSaleId || !!initialPurchaseOrderId}
                >
                  <option value={InvoiceType.SALES}>Sales Invoice</option>
                  <option value={InvoiceType.PURCHASE}>Purchase Invoice</option>
                </Select>

                {formData.type === InvoiceType.SALES && (
                  <Select
                    label="Customer"
                    name="customer"
                    value={formData.customer || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!!initialSaleId}
                  >
                    <option value="">Select Customer</option>
                    {Array.isArray(customers) && customers.length > 0 ? (
                      customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.firstName} {customer.lastName} (
                          {customer.customerNumber})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No customers available
                      </option>
                    )}
                  </Select>
                )}

                {formData.type === InvoiceType.PURCHASE && (
                  <Select
                    label="Supplier"
                    name="supplier"
                    value={formData.supplier || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!!initialPurchaseOrderId}
                  >
                    <option value="">Select Supplier</option>
                    {Array.isArray(suppliers) && suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} ({supplier.supplierCode})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No suppliers available
                      </option>
                    )}
                  </Select>
                )}

                <DatePicker
                  label="Invoice Date"
                  value={formData.invoiceDate || ''}
                  onChange={(date) => handleDateChange('invoiceDate', date)}
                  required
                />

                <DatePicker
                  label="Due Date"
                  value={formData.dueDate || ''}
                  onChange={(date) => handleDateChange('dueDate', date)}
                  required
                />

                <Input
                  type="number"
                  label="Discount (₦)"
                  name="discount"
                  value={formData.discount || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />

                <Input
                  type="number"
                  label="Tax (₦)"
                  name="tax"
                  value={formData.tax || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms and Conditions
                  </label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions || ''}
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
              <h2 className="text-lg font-medium mb-4">Add Items</h2>
              <div className="space-y-4">
                <Select
                  label="Product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select Product</option>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No products available
                    </option>
                  )}
                </Select>

                <Input
                  label="Description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />

                <Input
                  type="number"
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                />

                <Input
                  type="number"
                  label="Unit Price (₦)"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />

                <Input
                  type="number"
                  label="Discount (₦)"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />

                <Input
                  type="number"
                  label="Tax (%)"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  Add Item
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Items</h2>
            {formData.items.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No items added yet
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
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const product = Array.isArray(products)
                        ? products.find((p) => p._id === item.product)
                        : null;
                      const subtotal = calculateItemSubtotal(
                        item.quantity,
                        item.unitPrice,
                        item.discount || 0,
                        item.tax || 0
                      );

                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(item.discount || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.tax || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(subtotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-right font-medium"
                      >
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-right font-medium"
                      >
                        Discount:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.discount || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-right font-medium"
                      >
                        Tax:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.tax || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-right font-bold"
                      >
                        Total:
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatCurrency(calculateTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
