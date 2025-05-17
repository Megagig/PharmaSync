import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchActivePosSession,
  createPosTransaction,
} from '@/store/slices/posSlice';
import { PosTransactionType, PaymentStatus } from '@/types/pos.types';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

const PosTerminal = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { activeSession } = useSelector(
    (state: RootState) => state.pos
  );
  const { showToast } = useToast();

  // Get session ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session');

  // State declarations
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [register, setRegister] = useState('Main Register');
  const [transactionType, setTransactionType] = useState<PosTransactionType>(
    PosTransactionType.SALE
  );
  const [selectedCustomer, setSelectedCustomer] = useState({
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [availableExpiryDates, setAvailableExpiryDates] = useState<any[]>([]);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount + tax;

  useEffect(() => {
    const initializeTerminal = async () => {
      try {
        // Fetch locations
        const locationsResponse = await api.get('/locations/active');
        if (Array.isArray(locationsResponse.data.data)) {
          setLocations(locationsResponse.data.data);
          if (locationsResponse.data.data.length > 0) {
            setSelectedLocation(locationsResponse.data.data[0]._id);
          }
        }

        // Fetch payment methods
        const paymentMethodsResponse = await api.get('/payment-methods');
        if (Array.isArray(paymentMethodsResponse.data.data)) {
          setPaymentMethods(paymentMethodsResponse.data.data);
        }

        // Fetch active session if not already loaded
        if (!activeSession && sessionId) {
          await dispatch(fetchActivePosSession({ location: selectedLocation })).unwrap();
        }
      } catch (err: any) {
        console.error('Error initializing POS terminal:', err);
        setError(err.message || 'Failed to initialize POS terminal');
      }
    };

    initializeTerminal();
  }, [dispatch, sessionId, activeSession, selectedLocation]);

  useEffect(() => {
    // If session ID is provided and location is selected, fetch the session
    if (sessionId && selectedLocation) {
      dispatch(
        fetchActivePosSession({
          location: selectedLocation,
          register: register || 'Main Register'
        }) as any
      );
    }
  }, [dispatch, sessionId, selectedLocation, register]);

  useEffect(() => {
    // If product is selected, fetch available batches
    if (selectedProduct && selectedProduct._id) {
      console.log('Product selected in PosTerminal:', selectedProduct);
      fetchProductBatches();
    }
  }, [selectedProduct, selectedLocation]);

  const fetchProductBatches = async () => {
    try {
      if (!selectedProduct || !selectedProduct._id) return;

      const response = await api.get(`/products/${selectedProduct._id}/batches`);
      const batches = response.data.data || [];

      if (batches.length > 0) {
        const groupedBatches = batches.reduce((groups: any[], batch: any) => {
          const existingGroup = groups.find(
            (g) => g.expiryDate === batch.expiryDate
          );

          if (existingGroup) {
            existingGroup.batches.push(batch);
            existingGroup.totalQuantity += batch.quantity;
          } else {
            groups.push({
              expiryDate: batch.expiryDate,
              batches: [batch],
              totalQuantity: batch.quantity,
            });
          }

          return groups;
        }, []);

        setAvailableExpiryDates(groupedBatches);
      } else {
        setAvailableExpiryDates([]);
      }
    } catch (error: any) {
      console.error('Error fetching product batches:', error);
      setAvailableExpiryDates([]);
    }
  };

  } catch (error) {
      console.error('Failed to fetch product inventory:', error);
      setAvailableExpiryDates([]);
      setSelectedExpiryDate('');
      showToast('Error loading product inventory. Please try again.', 'error');
    }
  };

  const { showToast } = useToast();

  const handleAddToCart = async () => {
    if (!selectedProduct || quantity <= 0) {
      showToast('Please select a valid product and quantity', 'error');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const productResponse = await api.get(`/products/${selectedProduct._id}`);
      const product = productResponse.data.data;

      if (!product.active) {
        setError('This product is currently inactive');
        showToast('This product is currently inactive', 'error');
        return;
      }

      if (product.inventoryType === 'tracked' && product.quantity < quantity) {
        setError('Insufficient stock for this product');
        showToast('Insufficient stock for this product', 'error');
        return;
      }

      // Check if product has expiry dates
      if (product.expiryDates && product.expiryDates.length > 0) {
        setAvailableExpiryDates(product.expiryDates);
        setShowExpiryModal(true);
        return;
      }

      // Add to cart
      const cartItem = {
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        discount: productDiscount,
        subtotal: (product.price * quantity) * (1 - productDiscount / 100),
      };

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item: any) => item.productId === product._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex] = {
          ...cartItems[existingItemIndex],
          ...cartItem,
        };
        setCartItems(updatedItems);
        showToast('Item quantity updated', 'success');
      } else {
        // Add new item
        setCartItems([...cartItems, cartItem]);
        showToast('Item added to cart', 'success');
      }

      // Reset product selection
      setSelectedProduct(null);
      setQuantity(1);
      setProductDiscount(0);
      setAvailableExpiryDates([]);
      setSelectedExpiryDate('');

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add item to cart');
      showToast('Failed to add item to cart', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    try {
      console.log('Removing item at index:', index);
      console.log('Current cart items:', cartItems);

      // Create a new array without the item at the specified index
      const newCartItems = [...cartItems];
      newCartItems.splice(index, 1);

      console.log('New cart items after removal:', newCartItems);

      // Update the state with the new array
      setCartItems([...newCartItems]);

      showToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      showToast('Failed to remove item from cart', 'error');
    }
  };

  const handleUpdateCartItem = (index: number, field: string, value: any) => {
    try {
      console.log(
        `Updating item at index ${index}, field: ${field}, value: ${value}`
      );
      console.log('Current cart items:', cartItems);

      if (index < 0 || index >= cartItems.length) {
        console.error(
          `Invalid index: ${index}, cart length: ${cartItems.length}`
        );
        showToast('Invalid item index', 'error');
        return;
      }

      // Create a deep copy of the cart items
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

      // Update the item in the array
      newCartItems[index] = item;

      console.log('Updated cart items:', newCartItems);

      // Update the state with the new array
      setCartItems([...newCartItems]);

      showToast('Item updated', 'success');
    } catch (error) {
      console.error('Error updating cart item:', error);
      showToast('Failed to update item', 'error');
    }
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
    if (cartItems.length === 0) {
      setError('Please add items to cart');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    if (!activeSession) {
      setError('No active POS session found');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Validate payment
      const totalAmount = subtotal - discount + tax;
      const totalPaid = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      const change = totalPaid - totalAmount;

      // Create transaction
      const transactionData = {
        customer: selectedCustomer._id,
        transactionType: transactionType as PosTransactionType,
        location: selectedLocation,
        cashier: activeSession.cashier,
        posSession: activeSession._id,
        cartItems,
        subtotal,
        discount,
        tax,
        total: totalAmount,
        notes,
        payments: paymentMethods.map((method) => ({
          method: method._id,
          amount: method.amount,
          reference: method.reference,
        })),
        paymentStatus: totalPaid >= totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL,
      };

      const result = await dispatch(createPosTransaction(transactionData)).unwrap();

      // Update session totals
      await api.patch(`/pos/sessions/${activeSession._id}/update-totals`, {
        totalSales: (activeSession.totalSales || 0) + totalAmount,
        totalPayments: (activeSession.totalPayments || 0) + totalPaid,
      });

      // Reset transaction
      setCartItems([]);
      setDiscount(0);
      setTax(0);
      setNotes('');
      setSelectedCustomer({
        _id: 'walk-in-customer',
        firstName: 'Walk-in',
        lastName: 'Customer',
        customerNumber: 'WALK-IN',
        phone: '',
        email: '',
      });
      setPaymentMethods([]);

      showToast('success', 'Transaction completed successfully' as ToastType);
      navigate(`/pos/transactions/${result._id}`);
    } catch (err: any) {
      console.error('Error completing transaction:', err);
      setError(err.message || 'Failed to complete transaction');
      showToast('error', 'Failed to complete transaction' as ToastType);
    } finally {
      setIsProcessing(false);
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
                  if (customer && customer._id) {
                    // Make a deep copy to ensure state update is recognized
                    const customerCopy = {
                      _id: customer._id,
                      firstName: customer.firstName || '',
                      lastName: customer.lastName || '',
                      customerNumber: customer.customerNumber || '',
                      phone: customer.phone || '',
                      email: customer.email || '',
                    };
                    setSelectedCustomer(customerCopy);
                    showToast(
                      `Customer ${customerCopy.firstName} ${customerCopy.lastName} selected`,
                      'success'
                    );
                  }
                }}
                placeholder="Search for customer..."
                allowCreate
              />
            </div>
            <div className="w-1/2">
              <ProductSearch
                value={selectedProduct}
                onChange={(product) => {
                  console.log('Product selected in POS Terminal:', product);
                  if (product && product._id) {
                    setSelectedProduct(product);
                    // Trigger the fetch of product batches
                    fetchProductBatches();
                  }
                }}
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
