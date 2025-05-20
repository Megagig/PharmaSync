import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createSale } from '@/store/slices/salesSlice';
import { SaleFormData } from '@/types/sale.types';
import { Product } from '@/types/product';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import ProductSearch from '@/components/common/ProductSearch/ProductSearch';
import CustomerSearch from '@/components/common/CustomerSearch/CustomerSearch';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

const CreateSale = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.sales);

  // We don't need to store customers list as CustomerSearch handles that
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
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
    // No need to fetch customers here as the CustomerSearch component will handle it
    // This helps avoid duplicate API calls

    // Load products
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?isActive=true');
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`Loaded ${response.data.data.length} products`);
          setProducts(response.data.data);
        } else {
          console.error('Invalid products data format:', response.data);
          setProducts([]);
          showToast('Error loading products. Please refresh the page.', 'error');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        showToast('Failed to load products. Please refresh the page.', 'error');
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
        } else {
          // If no locations are available, show a toast message
          showToast('No active locations found. Please create a location first.', 'warning');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        showToast('Failed to load locations. Please refresh the page.', 'error');
      }
    };

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

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      saleDate: date,
    }));
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      showToast('Please select a product and valid quantity', 'error');
      return;
    }

    // Check if there's enough total stock available
    const totalAvailableStock = availableBatches.reduce((total, batch) => total + batch.quantity, 0);
    if (totalAvailableStock < quantity) {
      showToast(`Insufficient stock. Total available: ${totalAvailableStock}`, 'error');
      return;
    }

    // Get product information from productDetails (from ProductSearch)
    if (!productDetails || productDetails._id !== selectedProduct) {
      console.error('Product details not found for:', selectedProduct);
      showToast('Product information not found. Please select the product again.', 'error');
      return;
    }

    // Calculate subtotal and finalPrice
    const itemDiscount = discount || 0;
    const itemSubtotal = quantity * unitPrice;
    const itemFinalPrice = itemSubtotal - itemDiscount;

    // Get product name from productDetails
    const productName = productDetails.name || 'Unknown Product';

    let newItem = {
      product: selectedProduct,
      productName: productName, // Store product name for display
      quantity,
      unitPrice,
      discount: itemDiscount,
      subtotal: itemSubtotal,
      finalPrice: itemFinalPrice,
      batchNumber: '', // Default empty string for batch number
    };

    console.log('Adding item with finalPrice:', itemFinalPrice, 'and subtotal:', itemSubtotal);

    // Add batch information if a batch is selected
    if (selectedBatch) {
      const batch = availableBatches.find((b) => b.batchNumber === selectedBatch);
      if (!batch) {
        showToast('Selected batch not found', 'error');
        return;
      }

      if (quantity > batch.quantity) {
        showToast(`Insufficient stock in selected batch. Available: ${batch.quantity}`, 'error');
        return;
      }

      // Add batch number and expiry date if available
      newItem = {
        ...newItem,
        batchNumber: selectedBatch,
        expiryDate: batch.expiryDate,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Show success message with product name
    showToast(`Added ${quantity} ${productName} to sale`, 'success');

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
    return formData.items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice - (item.discount || 0)),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (formData.discount || 0) + (formData.tax || 0);
  };

  const validateForm = () => {
    let isValid = true;
    let errorMessage = '';

    if (!formData.customer) {
      errorMessage = 'Please select a customer';
      isValid = false;
    } else if (!formData.location) {
      errorMessage = 'Please select a location';
      isValid = false;
    } else if (formData.items.length === 0) {
      errorMessage = 'Please add at least one item';
      isValid = false;
    }

    if (!isValid) {
      showToast(errorMessage, 'error');
    }

    return isValid;
  };

  const prepareFormDataForSubmission = () => {
    // Create a deep copy of the form data
    const preparedData = { ...formData };

    // Set default payment method if not set
    if (!preparedData.paymentMethod) {
      preparedData.paymentMethod = 'cash';
    }

    // Ensure each item has the required fields
    preparedData.items = formData.items.map(item => {
      // Calculate subtotal and finalPrice
      const itemDiscount = item.discount || 0;
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemFinalPrice = itemSubtotal - itemDiscount;

      return {
        ...item,
        // Ensure all required fields are set
        subtotal: itemSubtotal,
        finalPrice: itemFinalPrice,
        discount: itemDiscount,
        // Ensure batchNumber is at least an empty string
        batchNumber: item.batchNumber || '',
      };
    });

    // Calculate total values
    const totalSubtotal = preparedData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = preparedData.discount || 0;
    const totalTax = preparedData.tax || 0;

    // Add these calculated values to the prepared data
    preparedData.subtotal = totalSubtotal;
    preparedData.totalDiscount = totalDiscount;

    console.log('Prepared form data for submission:', preparedData);
    return preparedData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Double-check that all items have required fields
      if (formData.items.length === 0) {
        showToast('Please add at least one item', 'error');
        return;
      }

      // Check that all items have finalPrice set
      const itemsWithoutFinalPrice = formData.items.filter(item => !item.finalPrice);
      if (itemsWithoutFinalPrice.length > 0) {
        console.error('Items missing finalPrice:', itemsWithoutFinalPrice);
        showToast('Some items are missing final price. Please try again.', 'error');
        return;
      }

      // Directly use the formData without additional preparation
      // The service layer will handle the data formatting
      console.log('Submitting sale with form data:', formData);

      const resultAction = await dispatch(createSale(formData) as any);
      if (createSale.fulfilled.match(resultAction)) {
        showToast('Sale created successfully', 'success');
        navigate(`/sales/${resultAction.payload._id}`);
      } else if (resultAction.error) {
        // Extract the error message from the action payload
        let errorMessage = 'Failed to create sale';

        console.error('Sale creation error:', resultAction.error);
        console.error('Sale creation payload:', resultAction.payload);

        if (typeof resultAction.payload === 'string') {
          errorMessage = resultAction.payload;

          // Check if we can extract more details from the error
          if (resultAction.meta && resultAction.meta.rejectedWithValue) {
            console.error('Rejected with value:', resultAction.meta.rejectedWithValue);
          }

          // Try to get the original error from the action
          if (resultAction.error && resultAction.error.stack) {
            console.error('Error stack:', resultAction.error.stack);
          }
        } else if (resultAction.error.message) {
          errorMessage = resultAction.error.message;
        }

        console.error('Sale creation failed:', errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      let errorMessage = 'Failed to create sale';

      // Log the complete error object for debugging
      console.error('Complete error object:', JSON.stringify(error, null, 2));

      // Try to extract detailed error information
      if (error.response && error.response.data) {
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Check for validation errors in the response
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const errorDetails = error.response.data.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join('\n');
          errorMessage = `Validation errors:\n${errorDetails}`;

          // Log each error individually for better debugging
          error.response.data.errors.forEach((err: any) => {
            console.error(`Validation error - Field: ${err.field}, Message: ${err.message}`);
          });
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Try to parse the response text if it's a string
      if (error.request && error.request.responseText) {
        try {
          const responseData = JSON.parse(error.request.responseText);
          console.error('Parsed response data:', JSON.stringify(responseData, null, 2));

          // Check for errors array in the response
          if (responseData.errors && Array.isArray(responseData.errors)) {
            const errorDetails = responseData.errors
              .map((err: any) => `${err.field || err.path}: ${err.message}`)
              .join('\n');
            errorMessage = `Validation errors:\n${errorDetails}`;

            // Log each error individually for better debugging
            responseData.errors.forEach((err: any) => {
              console.error(`Validation error - Field: ${err.field || err.path}, Message: ${err.message}`);
            });
          }

          // Check for stack trace in the response
          if (responseData.stack) {
            console.error('Server stack trace:', responseData.stack);

            // Try to extract validation errors from the stack trace
            const validationMatch = responseData.stack.match(/Sale validation failed: ([^\n]+)/);
            if (validationMatch && validationMatch[1]) {
              console.error('Extracted validation errors from stack:', validationMatch[1]);
              errorMessage = `Validation errors: ${validationMatch[1]}`;
            }
          }
        } catch (e) {
          // Not a valid JSON string
          console.error('Failed to parse response text:', e);
        }
      }

      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create New Sale
        </h1>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <CustomerSearch
                    value={selectedCustomer}
                    onSelect={(customer) => {
                      console.log('Customer selected in CreateSale:', customer);
                      if (customer && customer._id) {
                        // Create a properly formatted customer object
                        const formattedCustomer = {
                          _id: customer._id,
                          firstName: customer.firstName || '',
                          lastName: customer.lastName || '',
                          customerNumber: customer.customerNumber || '',
                          phone: customer.phone || '',
                          email: customer.email || ''
                        };

                        // Set the selected customer state
                        setSelectedCustomer(formattedCustomer);

                        // Update the form data with the customer ID
                        setFormData((prev) => ({
                          ...prev,
                          customer: customer._id,
                        }));

                        showToast(
                          `Customer ${formattedCustomer.firstName} ${formattedCustomer.lastName} selected`,
                          'success'
                        );
                      } else {
                        console.error(
                          'Invalid customer object received:',
                          customer
                        );
                        showToast(
                          'Error selecting customer. Please try again.',
                          'error'
                        );
                      }
                    }}
                    placeholder="Search for a customer or create new"
                    allowCreate={true}
                  />
                  {!formData.customer && (
                    <p className="mt-1 text-sm text-red-600">
                      Please select a customer
                    </p>
                  )}
                </div>

                <DatePicker
                  label="Sale Date"
                  value={formData.saleDate || ''}
                  onChange={handleDateChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Location</option>
                    {Array.isArray(locations) && locations.length > 0 ? (
                      locations.map((location) => (
                        <option key={location._id} value={location._id}>
                          {location.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No locations available
                      </option>
                    )}
                  </Select>
                  {!formData.location && (
                    <p className="mt-1 text-sm text-red-600">
                      Please select a location
                    </p>
                  )}
                </div>

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <ProductSearch
                    onSelect={(product: Product) => {
                      console.log('Product selected in CreateSale:', product);
                      if (!product || !product._id) {
                        showToast('Invalid product selected', 'error');
                        return;
                      }

                      setSelectedProduct(product._id);
                      setProductDetails(product);

                      // Get available batches with stock
                      const batches = product.inventory
                        ? product.inventory
                            .filter((item: any) => item && item.quantity > 0)
                            .map((item: any) => ({
                              batchNumber: item.batchNumber || '',
                              quantity: item.quantity || 0,
                              expiryDate: item.expiryDate || '',
                              costPrice: item.costPrice || 0,
                            }))
                        : [];

                      console.log('Available batches:', batches);
                      setAvailableBatches(batches);

                      // Set default price
                      setUnitPrice(product.defaultPrice || 0);

                      // Clear selected batch
                      setSelectedBatch('');

                      showToast(`Product ${product.name} selected`, 'success');
                    }}
                  />
                </div>

                {selectedProduct && (
                  <>
                    <Select
                      label="Batch (Optional)"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                      <option value="">Select Batch (Optional)</option>
                      {Array.isArray(availableBatches) &&
                      availableBatches.length > 0 ? (
                        availableBatches.map((batch) => (
                          <option
                            key={batch.batchNumber}
                            value={batch.batchNumber}
                          >
                            {batch.batchNumber} - Qty: {batch.quantity} -
                            Expires:{' '}
                            {new Date(batch.expiryDate).toLocaleDateString()}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No batches available
                        </option>
                      )}
                    </Select>

                    <Input
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      max={
                        selectedBatch
                          ? availableBatches.find(
                              (b) => b.batchNumber === selectedBatch
                            )?.quantity || 1
                          : 1
                      }
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
                      // Use the stored productName as the primary source of truth
                      const productName = item.productName || 'Unknown Product';

                      // Use the stored subtotal or calculate it
                      const subtotal = item.subtotal ||
                        (item.quantity * item.unitPrice - (item.discount || 0));

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
                      <td
                        colSpan={5}
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
                        colSpan={5}
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
                        colSpan={5}
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
                        colSpan={5}
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
