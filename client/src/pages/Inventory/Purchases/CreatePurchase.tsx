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
  purchaseDate: string; // Changed from orderDate to match backend expectation
  expectedDeliveryDate?: string;
  items: {
    product: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
    retailPrice?: number;
    wholesalePrice?: number;
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
  const [selectedSupplierInfo, setSelectedSupplierInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [retailPrice, setRetailPrice] = useState<number | string>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | string>('');

  // Initialize form data from localStorage if available
  const [formData, setFormData] = useState<PurchaseFormData>(() => {
    const savedFormData = localStorage.getItem('purchaseFormData');
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          supplier: '',
          purchaseDate: new Date().toISOString().split('T')[0], // Changed from orderDate to purchaseDate
          expectedDeliveryDate: '',
          items: [],
          discount: 0,
          tax: 0,
          shippingCost: 0,
          paymentTerms: 'net30',
          notes: '',
        };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('purchaseFormData', JSON.stringify(formData));
  }, [formData]);

  // Restore selected supplier info if we have a supplier ID in formData
  useEffect(() => {
    const restoreSelectedSupplier = async () => {
      if (formData.supplier && !selectedSupplierInfo) {
        try {
          const response = await api.get(`/suppliers/${formData.supplier}`);
          if (response.data && response.data.data) {
            setSelectedSupplierInfo(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching supplier details:', error);
        }
      }
    };

    restoreSelectedSupplier();
  }, [formData.supplier, selectedSupplierInfo]);

  // Check for newly created product and select it
  useEffect(() => {
    const checkForNewProduct = async () => {
      const newProductId = localStorage.getItem('newlyCreatedProductId');
      if (newProductId) {
        try {
          // Fetch the newly created product
          const response = await api.get(`/products/${newProductId}`);
          if (response.data && response.data.data) {
            // Select the product
            setSelectedProduct(response.data.data);
            setCostPrice(
              response.data.data.costPrice ||
                response.data.data.defaultPrice ||
                ''
            );
            setRetailPrice(
              response.data.data.retailPrice ||
                response.data.data.defaultPrice ||
                ''
            );
            setWholesalePrice(
              response.data.data.wholesalePrice ||
                response.data.data.defaultPrice ||
                ''
            );
            // Set quantity to current stock for reference
            setQuantity(response.data.data.totalStock || 0);

            // Clear the stored product ID
            localStorage.removeItem('newlyCreatedProductId');
          }
        } catch (error) {
          console.error('Error fetching newly created product:', error);
          localStorage.removeItem('newlyCreatedProductId');
        }
      }
    };

    checkForNewProduct();
  }, []);

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
    // Convert string values to numbers for validation
    const numQuantity = Number(quantity);
    const numCostPrice = Number(costPrice);

    if (!selectedProduct || numQuantity <= 0 || numCostPrice <= 0) {
      showToast(
        'Please select a product, and enter valid quantity and price',
        'error'
      );
      return;
    }

    console.log('Adding item to purchase:', selectedProduct);

    const subtotal = numQuantity * numCostPrice;

    const newItem = {
      product: selectedProduct._id, // Use product ID instead of medication ID
      productName: selectedProduct.name, // Store the product name
      quantity: numQuantity,
      unitPrice: numCostPrice,
      subtotal,
      notes: '',
      retailPrice: Number(retailPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || 0,
    };

    setFormData((prev) => {
      const updatedItems = [...prev.items, newItem];
      console.log('Updated items:', updatedItems);
      return {
        ...prev,
        items: updatedItems,
      };
    });

    // Show success message
    showToast(
      `Added ${quantity} ${selectedProduct.name} to purchase`,
      'success'
    );

    // Reset item form
    setSelectedProduct(null);
    setQuantity(1);
    setCostPrice('');
    setRetailPrice('');
    setWholesalePrice('');
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
      // Prepare the data to match the backend expectations
      const purchaseData = {
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        items: formData.items,
        discount: formData.discount || 0,
        tax: formData.tax || 0,
        shippingCost: formData.shippingCost || 0,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
      };

      console.log('Sending purchase data:', purchaseData);

      // Use the purchases API
      const response = await api.post('/purchases', purchaseData);
      showToast('Purchase created successfully', 'success');
      // Clear the saved form data after successful submission
      localStorage.removeItem('purchaseFormData');
      // Navigate back to the purchases list
      navigate('/inventory/purchases');
    } catch (error: any) {
      console.error('Error creating purchase:', error);

      // Show more detailed error message if available
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showToast(`Error: ${error.response.data.message}`, 'error');
      } else {
        showToast('Error creating purchase', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Purchase
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
                        // Store the supplier ID in the form data
                        setFormData((prev) => ({
                          ...prev,
                          supplier: supplier._id,
                          paymentTerms: supplier.paymentTerms || 'net30',
                        }));

                        // Store the supplier info for display
                        setSelectedSupplierInfo(supplier);

                        // Show a success message
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
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(date) => handleDateChange('purchaseDate', date)}
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
                    Product Search
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <ProductSearch
                        onSelect={(product) => {
                          console.log(
                            'Product selected in CreatePurchase:',
                            product
                          );
                          setSelectedProduct(product);
                          // Set quantity to 1 by default (user can change this)
                          setQuantity(1);
                          // Clear price fields to allow user input
                          // The placeholders will show the previous values
                          setCostPrice('');
                          setRetailPrice('');
                          setWholesalePrice('');
                        }}
                        onSearchChange={(term, results) => {
                          setSearchTerm(term);
                          setFilteredProducts(results);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        console.log('Navigating to new product page');
                        navigate(
                          '/inventory/products/new?returnTo=/inventory/purchases/create'
                        );
                      }}
                    >
                      New
                    </Button>
                  </div>
                  {filteredProducts &&
                    filteredProducts.length === 0 &&
                    searchTerm && (
                      <div className="mt-2 text-sm text-gray-500">
                        No products found.{' '}
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-700"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(
                              '/inventory/products/new?returnTo=/inventory/purchases/create'
                            );
                          }}
                        >
                          Create a new product
                        </button>
                      </div>
                    )}
                </div>

                {selectedProduct && (
                  <>
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-50 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selected Product
                      </label>
                      <div className="font-medium text-gray-900">
                        {selectedProduct.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {selectedProduct.sku || 'N/A'} | Stock:{' '}
                        {selectedProduct.totalStock || 0}
                      </div>
                    </div>

                    <Input
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      placeholder={`Current Stock: ${
                        selectedProduct.totalStock || 0
                      }`}
                    />

                    <Input
                      type="number"
                      label="Cost Price (₦)"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder={`Previous: ${
                        selectedProduct.costPrice || 'N/A'
                      }`}
                    />

                    <Input
                      type="number"
                      label="Retail Price (₦)"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder={`Previous: ${
                        selectedProduct.retailPrice || 'N/A'
                      }`}
                    />

                    <Input
                      type="number"
                      label="Wholesale Price (₦)"
                      value={wholesalePrice}
                      onChange={(e) =>
                        setWholesalePrice(Number(e.target.value))
                      }
                      min="0"
                      step="0.01"
                      placeholder={`Previous: ${
                        selectedProduct.wholesalePrice || 'N/A'
                      }`}
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddItem}
                      className="w-full mt-4"
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
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.productName || 'Unknown Product'}
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
            {isLoading ? 'Creating...' : 'Create Purchase'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchase;
