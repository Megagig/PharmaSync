import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchActivePosSession,
  createPosTransaction,
} from '@/store/slices/posSlice';
import { PosTransactionType, PosSessionStatus } from '@/types/pos.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import ProductSearch from '@/components/common/ProductSearch/ProductSearch';
import CustomerSearch from '@/components/common/CustomerSearch/CustomerSearch';
import PosCart from './components/PosCart';
import PosPayment from './components/PosPayment';
import PosNumpad from './components/PosNumpad';
import PosProductGrid from './components/PosProductGrid';
import PosHeader from './components/PosHeader';

const PosTerminal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { activeSession, isLoading, error } = useSelector(
    (state: RootState) => state.pos
  );
  const { showToast } = useToast();

  // Get session ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session');

  // State for locations
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [selectedLocation, setSelectedLocation] = useState('');

  // State for register
  const [register, setRegister] = useState('Main Register');

  // State for transaction
  const [transactionType, setTransactionType] = useState<PosTransactionType>(
    PosTransactionType.SALE
  );
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    _id: 'walk-in-customer',
    firstName: 'Walk-in',
    lastName: 'Customer',
    customerNumber: 'WALK-IN',
    phone: '',
    email: '',
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');

  // State for payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // State for product search
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [availableExpiryDates, setAvailableExpiryDates] = useState<any[]>([]);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount + tax;

  useEffect(() => {
    // Fetch locations
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        console.log('PosTerminal - Locations API response:', response.data);

        // The active endpoint returns an array directly
        if (Array.isArray(response.data.data)) {
          console.log(
            'PosTerminal - Setting locations array:',
            response.data.data
          );
          setLocations(response.data.data);

          if (response.data.data.length > 0) {
            console.log(
              'PosTerminal - Setting default location:',
              response.data.data[0]._id
            );
            setSelectedLocation(response.data.data[0]._id);
          } else {
            console.log(
              'PosTerminal - No locations found in the response data array'
            );
          }
        } else {
          console.error(
            'PosTerminal - Unexpected API response format:',
            response.data
          );
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    // If session ID is provided, fetch the session
    if (sessionId && selectedLocation) {
      // Make sure register is not empty
      const registerName = register || 'Main Register';
      console.log('Fetching active POS session with:', {
        location: selectedLocation,
        register: registerName,
      });

      dispatch(
        fetchActivePosSession({
          location: selectedLocation,
          register: registerName,
        }) as any
      );
    }
  }, [dispatch, sessionId, selectedLocation, register]);

  useEffect(() => {
    // If product is selected, fetch available batches
    if (selectedProduct) {
      console.log('Product selected in PosTerminal:', selectedProduct);
      fetchProductBatches();
    }
  }, [selectedProduct, selectedLocation]);

  const fetchProductBatches = async () => {
    try {
      console.log('Fetching expiry dates for product:', selectedProduct);

      if (!selectedProduct || !selectedProduct._id) {
        console.error('Invalid product or missing _id:', selectedProduct);
        return;
      }

      // Set the unit price immediately when a product is selected
      setUnitPrice(selectedProduct.defaultPrice || 0);

      const response = await api.get(
        `/products/${selectedProduct._id}/batches`
      );
      console.log('Product batches response:', response.data);

      if (response.data && response.data.data) {
        // Check if there are any batches
        if (response.data.data.length > 0) {
          // Group batches by expiry date
          const batchesByExpiryDate = response.data.data.reduce(
            (acc: any, batch: any) => {
              const expiryDate = new Date(batch.expiryDate)
                .toISOString()
                .split('T')[0];
              if (!acc[expiryDate]) {
                acc[expiryDate] = [];
              }
              acc[expiryDate].push(batch);
              return acc;
            },
            {}
          );

          // Convert to array format and sort by expiry date (earliest first - FIFO)
          const expiryDates = Object.keys(batchesByExpiryDate)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map((date) => ({
              expiryDate: date,
              batches: batchesByExpiryDate[date],
              totalQuantity: batchesByExpiryDate[date].reduce(
                (sum: number, b: any) => sum + b.quantity,
                0
              ),
            }));

          setAvailableExpiryDates(expiryDates);

          // Automatically select the earliest expiry date (FIFO)
          if (expiryDates.length > 0) {
            setSelectedExpiryDate(expiryDates[0].expiryDate);
          }
        } else {
          // No batches found
          setAvailableExpiryDates([]);
          setSelectedExpiryDate('');

          // Show a toast message instead of browser alert
          showToast(
            `No inventory found for ${selectedProduct.name}. Please add inventory first.`,
            'warning'
          );
        }
      } else {
        console.error('Unexpected batches response format:', response.data);
        setAvailableExpiryDates([]);
        setSelectedExpiryDate('');
        showToast(
          'Failed to load product inventory. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to fetch product inventory:', error);
      setAvailableExpiryDates([]);
      setSelectedExpiryDate('');
      showToast('Error loading product inventory. Please try again.', 'error');
    }
  };

  const handleAddToCart = () => {
    console.log(
      'Adding to cart. Product:',
      selectedProduct,
      'Quantity:',
      quantity
    );

    // Validate inputs
    if (!selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    // Ensure product has an _id
    if (!selectedProduct._id) {
      console.error('Product is missing _id:', selectedProduct);
      showToast('Invalid product data. Please try another product.', 'error');
      return;
    }

    // If no expiry dates are available, show an error
    if (availableExpiryDates.length === 0) {
      showToast(
        'This product has no inventory. Please add inventory first.',
        'error'
      );
      return;
    }

    // Validate quantity
    if (quantity <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    // Always use the earliest expiry date (FIFO)
    // The availableExpiryDates array is already sorted by date in fetchProductBatches
    const expiryDateGroup = availableExpiryDates[0];

    // Check stock quantity
    if (quantity > expiryDateGroup.totalQuantity) {
      showToast(
        `Insufficient stock. Available: ${expiryDateGroup.totalQuantity}`,
        'error'
      );
      return;
    }

    // Calculate subtotal
    const itemSubtotal = quantity * unitPrice - productDiscount;

    // Use the first batch from the earliest expiry date group
    const firstBatch = expiryDateGroup.batches[0];

    // Create cart item
    const newItem = {
      product: selectedProduct._id,
      productDetails: {
        _id: selectedProduct._id,
        name: selectedProduct.name || 'Unknown Product',
        sku: selectedProduct.sku || 'No SKU',
        defaultPrice: selectedProduct.defaultPrice || unitPrice,
        // Include any other needed fields
      },
      quantity,
      unitPrice,
      discount: productDiscount,
      subtotal: itemSubtotal,
      batchNumber: firstBatch.batchNumber,
      expiryDate: selectedExpiryDate,
    };

    console.log('Adding item to cart:', newItem);
    setCartItems([...cartItems, newItem]);
    showToast(`Added ${quantity} ${selectedProduct.name} to cart`, 'success');

    // Reset product selection
    setSelectedProduct(null);
    setSelectedExpiryDate('');
    setQuantity(1);
    setUnitPrice(0);
    setProductDiscount(0);
    setAvailableExpiryDates([]);
  };

  const handleRemoveFromCart = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  const handleUpdateCartItem = (index: number, field: string, value: any) => {
    const newCartItems = [...cartItems];
    const item = { ...newCartItems[index] };

    if (field === 'quantity') {
      item.quantity = value;
      item.subtotal = item.quantity * item.unitPrice - item.discount;
    } else if (field === 'unitPrice') {
      item.unitPrice = value;
      item.subtotal = item.quantity * item.unitPrice - item.discount;
    } else if (field === 'discount') {
      item.discount = value;
      item.subtotal = item.quantity * item.unitPrice - item.discount;
    }

    newCartItems[index] = item;
    setCartItems(newCartItems);
  };

  const handleProceedToPayment = () => {
    if (!selectedCustomer) {
      showToast('Please select a customer', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Please add at least one item to the cart', 'error');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentData: any[]) => {
    setPaymentMethods(paymentData);
    handleCompleteTransaction();
  };

  const handleCompleteTransaction = async () => {
    if (!activeSession) {
      showToast('No active POS session', 'error');
      return;
    }

    if (!selectedCustomer) {
      showToast('Please select a customer', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Please add at least one item to the cart', 'error');
      return;
    }

    if (paymentMethods.length === 0) {
      showToast('Please add at least one payment method', 'error');
      return;
    }

    // Validate all items have valid expiry dates
    for (const item of cartItems) {
      if (!item.expiryDate) {
        showToast(
          `Item ${item.productDetails.name} has an invalid expiry date. Please remove it and add again.`,
          'error'
        );
        return;
      }
    }

    const transactionData = {
      customer: selectedCustomer._id,
      transactionType,
      posSession: activeSession._id,
      register: activeSession.register,
      items: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      })),
      discount,
      tax,
      paymentMethods,
      notes,
      location: activeSession.location._id || activeSession.location,
    };

    try {
      const resultAction = await dispatch(
        createPosTransaction(transactionData) as any
      );
      if (createPosTransaction.fulfilled.match(resultAction)) {
        showToast('Transaction completed successfully', 'success');
        navigate(`/pos/transactions/${resultAction.payload._id}/receipt`);

        // Reset form
        const walkInCustomer = {
          _id: 'walk-in-customer',
          firstName: 'Walk-in',
          lastName: 'Customer',
          customerNumber: 'WALK-IN',
          phone: '',
          email: '',
        };

        console.log('Resetting customer to walk-in after transaction');
        setSelectedCustomer(walkInCustomer);
        setCartItems([]);
        setDiscount(0);
        setTax(0);
        setNotes('');
        setPaymentMethods([]);
        setShowPaymentModal(false);
      } else if (resultAction.error) {
        const errorMessage =
          resultAction.error.message || 'Failed to complete transaction';
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Failed to complete transaction:', error);
      showToast(error.message || 'Failed to complete transaction', 'error');
    }
  };

  // If no active session, show message to create one
  if (!activeSession && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-medium mb-4">No Active POS Session</h2>
            <p className="mb-4">
              You need to create or open a POS session before using the
              terminal.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/pos/sessions/new')}
            >
              Create New Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <PosHeader
        activeSession={activeSession}
        onExitTerminal={() => navigate('/pos/sessions')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Product selection */}
        <div className="w-2/3 flex flex-col p-4 overflow-hidden">
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <CustomerSearch
                value={selectedCustomer}
                onChange={(customer) => {
                  console.log('Customer selected in POS Terminal:', customer);
                  setSelectedCustomer(customer);
                }}
                placeholder="Search for customer..."
                allowCreate
              />
            </div>
            <div className="w-1/2">
              <ProductSearch
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Search for product..."
              />
            </div>
          </div>

          {selectedProduct && (
            <Card className="mb-4">
              <div className="p-4 grid grid-cols-4 gap-4">
                {availableExpiryDates.length > 0 && (
                  <div className="col-span-4 mb-2">
                    <div className="text-sm text-gray-600">
                      Available Stock: {availableExpiryDates[0].totalQuantity}{' '}
                      units (Expires:{' '}
                      {new Date(
                        availableExpiryDates[0].expiryDate
                      ).toLocaleDateString()}
                      )
                    </div>
                  </div>
                )}
                <div>
                  <Input
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Unit Price (₦)"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Discount (₦)"
                    value={productDiscount}
                    onChange={(e) => setProductDiscount(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handleAddToCart}
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="flex-1 overflow-auto">
            <PosProductGrid onSelectProduct={setSelectedProduct} />
          </div>
        </div>

        {/* Right side - Cart and payment */}
        <div className="w-1/3 flex flex-col p-4 bg-white shadow-md">
          <PosCart
            items={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onUpdateItem={handleUpdateCartItem}
          />

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount:</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-24"
                />
                <span className="ml-2">{formatCurrency(discount)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax:</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-24"
                />
                <span className="ml-2">{formatCurrency(tax)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <Input
              type="text"
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this transaction"
            />
          </div>

          <div className="mt-auto pt-4">
            <Button
              variant="primary"
              className="w-full py-3 text-lg"
              onClick={handleProceedToPayment}
              disabled={cartItems.length === 0 || !selectedCustomer}
            >
              Pay Now ({formatCurrency(total)})
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PosPayment
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default PosTerminal;
