import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import ProductSearch from '@/components/common/ProductSearch/ProductSearch';
import SupplierSearch from '@/components/common/SupplierSearch/SupplierSearch';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

interface PurchaseFormData {
  supplier: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: {
    medication: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }[];
  discount: number;
  tax: number;
  shippingCost: number;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes: string;
}

const CreatePurchase = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const [formData, setFormData] = useState<PurchaseFormData>({
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    discount: 0,
    tax: 0,
    shippingCost: 0,
    paymentTerms: 'net30',
    notes: '',
  });

  useEffect(() => {
    // Load products
    const fetchProducts = async () => {
      try {
        const response = await api.get('/medications?isActive=true');
        if (response.data && response.data.data) {
          setProducts(response.data.data);
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
  }, []);

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

  const handleDateChange = (name: string, date: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      showToast(
        'Please select a product, and enter valid quantity and price',
        'error'
      );
      return;
    }

    const subtotal = quantity * unitPrice;

    const newItem = {
      medication: selectedProduct._id,
      quantity,
      unitPrice,
      subtotal,
      notes: '',
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset item form
    setSelectedProduct(null);
    setQuantity(1);
    setUnitPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - formData.discount + formData.tax + formData.shippingCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier) {
      showToast('Please select a supplier', 'error');
      return;
    }

    if (formData.items.length === 0) {
      showToast('Please add at least one item', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/purchase-orders', formData);
      showToast('Purchase order created successfully', 'success');
      navigate(`/inventory/purchases/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      showToast('Error creating purchase order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Purchase Order
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/inventory/purchases')}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Purchase Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <SupplierSearch
                    onSelect={(supplier) => {
                      console.log(
                        'Supplier selected in CreatePurchase:',
                        supplier
                      );
                      if (supplier && supplier._id) {
                        setFormData((prev) => ({
                          ...prev,
                          supplier: supplier._id,
                          paymentTerms: supplier.paymentTerms || 'net30',
                        }));
                        showToast(
                          `Supplier ${supplier.name} selected`,
                          'success'
                        );
                      } else {
                        console.error(
                          'Invalid supplier object received:',
                          supplier
                        );
                        showToast(
                          'Error selecting supplier. Please try again.',
                          'error'
                        );
                      }
                    }}
                    placeholder="Search for a supplier or create new"
                  />
                  {!formData.supplier && (
                    <p className="mt-1 text-sm text-red-600">
                      Please select a supplier
                    </p>
                  )}
                </div>

                <DatePicker
                  label="Order Date"
                  value={formData.orderDate}
                  onChange={(date) => handleDateChange('orderDate', date)}
                  required
                />

                <DatePicker
                  label="Expected Delivery Date"
                  value={formData.expectedDeliveryDate || ''}
                  onChange={(date) =>
                    handleDateChange('expectedDeliveryDate', date)
                  }
                />

                <Select
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="net15">Net 15 Days</option>
                  <option value="net30">Net 30 Days</option>
                  <option value="net60">Net 60 Days</option>
                  <option value="cod">Cash on Delivery</option>
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

                <Input
                  type="number"
                  label="Shipping Cost (₦)"
                  name="shippingCost"
                  value={formData.shippingCost || ''}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <ProductSearch
                    onSelect={(product) => {
                      setSelectedProduct(product);
                      setUnitPrice(product.costPrice || 0);
                    }}
                  />
                </div>

                {selectedProduct && (
                  <>
                    <Input
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                    />

                    <Input
                      type="number"
                      label="Unit Price (₦)"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
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
            <h2 className="text-lg font-medium mb-4">Purchase Items</h2>
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
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
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
                      const product = products.find(
                        (p) => p._id === item.medication
                      );

                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(item.subtotal)}
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
                        colSpan={3}
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
                        colSpan={3}
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
                        colSpan={3}
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
                        colSpan={3}
                        className="px-6 py-4 text-right font-medium"
                      >
                        Shipping:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.shippingCost || 0)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
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
            onClick={() => navigate('/inventory/purchases')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchase;
