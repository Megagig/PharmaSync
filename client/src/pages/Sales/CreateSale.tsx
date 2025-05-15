import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createSale } from '@/store/slices/salesSlice';
import { SaleFormData } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const CreateSale = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.sales);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [productDetails, setProductDetails] = useState<any>(null);

  const [formData, setFormData] = useState<SaleFormData>({
    customer: '',
    saleDate: new Date().toISOString().split('T')[0],
    items: [],
    discount: 0,
    tax: 0,
    paymentMethod: 'cash',
    notes: '',
    location: '',
  });

  useEffect(() => {
    // Load customers
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers?isActive=true');
        setCustomers(response.data.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    // Load products
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?isActive=true');
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    // Load locations
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        setLocations(response.data.data);
        if (response.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            location: response.data.data[0]._id,
          }));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchCustomers();
    fetchProducts();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductDetails();
    } else {
      setAvailableBatches([]);
      setProductDetails(null);
      setUnitPrice(0);
    }
  }, [selectedProduct]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${selectedProduct}`);
      const product = response.data.data;
      setProductDetails(product);
      
      // Get available batches with stock
      const batches = product.inventory
        .filter((item: any) => item.quantity > 0)
        .map((item: any) => ({
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          costPrice: item.costPrice,
        }));
      
      setAvailableBatches(batches);
      
      // Set default price
      setUnitPrice(product.defaultPrice);
      
      // Clear selected batch
      setSelectedBatch('');
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

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
      saleDate: date,
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || !selectedBatch || quantity <= 0) {
      alert('Please select a product, batch, and valid quantity');
      return;
    }

    const batch = availableBatches.find((b) => b.batchNumber === selectedBatch);
    if (!batch) {
      alert('Selected batch not found');
      return;
    }

    if (quantity > batch.quantity) {
      alert(`Insufficient stock. Available: ${batch.quantity}`);
      return;
    }

    const newItem = {
      product: selectedProduct,
      quantity,
      unitPrice,
      discount: discount || 0,
      batchNumber: selectedBatch,
      expiryDate: batch.expiryDate,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset item form
    setSelectedProduct('');
    setSelectedBatch('');
    setQuantity(1);
    setUnitPrice(0);
    setDiscount(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - (item.discount || 0)), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (formData.discount || 0) + (formData.tax || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const resultAction = await dispatch(createSale(formData) as any);
      if (createSale.fulfilled.match(resultAction)) {
        navigate(`/sales/${resultAction.payload._id}`);
      }
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Sale</h1>
        <Button variant="outline" onClick={() => navigate('/sales')}>
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
              <h2 className="text-lg font-medium mb-4">Sale Information</h2>
              <div className="space-y-4">
                <Select
                  label="Customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.firstName} {customer.lastName} ({customer.customerNumber})
                    </option>
                  ))}
                </Select>

                <DatePicker
                  label="Sale Date"
                  value={formData.saleDate || ''}
                  onChange={handleDateChange}
                  required
                />

                <Select
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod || 'cash'}
                  onChange={handleInputChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="credit">Credit</option>
                  <option value="multiple">Multiple</option>
                </Select>

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
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </Select>

                {selectedProduct && (
                  <>
                    <Select
                      label="Batch"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">Select Batch</option>
                      {availableBatches.map((batch) => (
                        <option key={batch.batchNumber} value={batch.batchNumber}>
                          {batch.batchNumber} - Qty: {batch.quantity} - Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                        </option>
                      ))}
                    </Select>

                    <Input
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      max={selectedBatch ? availableBatches.find(b => b.batchNumber === selectedBatch)?.quantity || 1 : 1}
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

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddItem}
                      className="w-full"
                    >
                      Add Item
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Sale Items</h2>
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
                        Batch
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
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const product = products.find((p) => p._id === item.product);
                      const subtotal = item.quantity * item.unitPrice - (item.discount || 0);
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.batchNumber}
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
                      <td colSpan={5} className="px-6 py-4 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right font-medium">
                        Discount:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.discount || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right font-medium">
                        Tax:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.tax || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right font-bold">
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
            onClick={() => navigate('/sales')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Sale'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSale;
