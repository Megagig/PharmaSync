import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createReturn } from '@/store/slices/returnsSlice';
import { ReturnFormData } from '@/types/return.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const CreateReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.returns);

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSaleId = queryParams.get('sale') || '';

  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [reason, setReason] = useState('');
  const [condition, setCondition] = useState<'good' | 'damaged' | 'expired'>('good');
  const [returnToStock, setReturnToStock] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);

  const [formData, setFormData] = useState<ReturnFormData>({
    sale: initialSaleId,
    returnDate: new Date().toISOString().split('T')[0],
    items: [],
    tax: 0,
    notes: '',
  });

  useEffect(() => {
    // Load sales
    const fetchSales = async () => {
      try {
        const response = await api.get('/sales?status=completed');
        setSales(response.data.data);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();

    // Load specific sale if provided
    if (initialSaleId) {
      fetchSaleDetails(initialSaleId);
    }
  }, [initialSaleId]);

  const fetchSaleDetails = async (saleId: string) => {
    try {
      const response = await api.get(`/sales/${saleId}`);
      const sale = response.data.data;
      setSelectedSale(sale);
      setSaleItems(sale.items);
      
      // Pre-populate form with sale data
      setFormData(prev => ({
        ...prev,
        sale: saleId,
      }));
    } catch (error) {
      console.error('Error fetching sale details:', error);
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
      returnDate: date,
    }));
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const saleId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      sale: saleId,
    }));
    
    if (saleId) {
      fetchSaleDetails(saleId);
    } else {
      setSelectedSale(null);
      setSaleItems([]);
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    setSelectedBatch('');
    setQuantity(1);
    setUnitPrice(0);
    setMaxQuantity(0);
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchNumber = e.target.value;
    setSelectedBatch(batchNumber);
    
    // Find the sale item with matching product and batch
    const saleItem = saleItems.find(
      (item) => 
        (typeof item.product === 'object' ? item.product._id : item.product) === selectedProduct && 
        item.batchNumber === batchNumber
    );
    
    if (saleItem) {
      setUnitPrice(saleItem.unitPrice);
      setMaxQuantity(saleItem.quantity);
      setQuantity(1);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || !selectedBatch || quantity <= 0 || !reason) {
      alert('Please select a product, batch, specify a valid quantity, and provide a reason');
      return;
    }

    if (quantity > maxQuantity) {
      alert(`Quantity cannot exceed ${maxQuantity}`);
      return;
    }

    const newItem = {
      product: selectedProduct,
      quantity,
      unitPrice,
      batchNumber: selectedBatch,
      reason,
      condition,
      returnToStock,
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
    setReason('');
    setCondition('good');
    setReturnToStock(false);
    setMaxQuantity(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (formData.tax || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sale) {
      alert('Please select a sale');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const resultAction = await dispatch(createReturn(formData) as any);
      if (createReturn.fulfilled.match(resultAction)) {
        navigate(`/returns/${resultAction.payload._id}`);
      }
    } catch (error) {
      console.error('Failed to create return:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Return</h1>
        <Button variant="outline" onClick={() => navigate('/returns')}>
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
              <h2 className="text-lg font-medium mb-4">Return Information</h2>
              <div className="space-y-4">
                <Select
                  label="Sale"
                  name="sale"
                  value={formData.sale}
                  onChange={handleSaleChange}
                  required
                  disabled={!!initialSaleId}
                >
                  <option value="">Select Sale</option>
                  {sales.map((sale) => (
                    <option key={sale._id} value={sale._id}>
                      {sale.saleNumber} - {new Date(sale.saleDate).toLocaleDateString()}
                    </option>
                  ))}
                </Select>

                <DatePicker
                  label="Return Date"
                  value={formData.returnDate || ''}
                  onChange={handleDateChange}
                  required
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
              {selectedSale ? (
                <div className="space-y-4">
                  <Select
                    label="Product"
                    value={selectedProduct}
                    onChange={handleProductChange}
                  >
                    <option value="">Select Product</option>
                    {saleItems.map((item) => {
                      const product = typeof item.product === 'object' ? item.product : { _id: item.product, name: 'Unknown Product' };
                      return (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      );
                    })}
                  </Select>

                  {selectedProduct && (
                    <>
                      <Select
                        label="Batch"
                        value={selectedBatch}
                        onChange={handleBatchChange}
                      >
                        <option value="">Select Batch</option>
                        {saleItems
                          .filter((item) => 
                            (typeof item.product === 'object' ? item.product._id : item.product) === selectedProduct
                          )
                          .map((item, index) => (
                            <option key={index} value={item.batchNumber}>
                              {item.batchNumber} - Qty: {item.quantity}
                            </option>
                          ))}
                      </Select>

                      <Input
                        type="number"
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                        max={maxQuantity}
                      />

                      <Input
                        type="number"
                        label="Unit Price (₦)"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Number(e.target.value))}
                        min="0"
                        step="0.01"
                        disabled
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Return
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          required
                        ></textarea>
                      </div>

                      <Select
                        label="Condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as 'good' | 'damaged' | 'expired')}
                      >
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                        <option value="expired">Expired</option>
                      </Select>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="returnToStock"
                          checked={returnToStock}
                          onChange={(e) => setReturnToStock(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="returnToStock" className="ml-2 block text-sm text-gray-900">
                          Return to Stock
                        </label>
                      </div>

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
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Please select a sale first
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Return Items</h2>
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
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return to Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const product = saleItems.find(
                        (si) => 
                          (typeof si.product === 'object' ? si.product._id : si.product) === item.product
                      )?.product;
                      
                      const productName = typeof product === 'object' ? product.name : 'Unknown Product';
                      const subtotal = item.quantity * item.unitPrice;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {productName}
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
                            {formatCurrency(subtotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">
                            {item.condition}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.returnToStock ? 'Yes' : 'No'}
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
                      <td colSpan={4} className="px-6 py-4 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-right font-medium">
                        Tax:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(formData.tax || 0)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-right font-bold">
                        Total:
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatCurrency(calculateTotal())}
                      </td>
                      <td colSpan={3}></td>
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
            onClick={() => navigate('/returns')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Return'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateReturn;
