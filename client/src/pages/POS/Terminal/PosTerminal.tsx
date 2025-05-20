import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
  fetchActivePosSession,
  createPosTransaction,
  createPosSession,
} from '@/store/slices/posSlice';
import { PosTransactionType, PaymentStatus, PosSession, PosTransactionFormData } from '@/types/pos.types';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage/ErrorMessage';
import ProductSearch from '@/components/common/ProductSearch/ProductSearch';
import CustomerSearch from '@/components/common/CustomerSearch/CustomerSearch';
import PosCart from './components/PosCart';
import PosPayment from './components/PosPayment';
import PosHeader from './components/PosHeader';
import PosProductGrid from './components/PosProductGrid';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  phone?: string;
  email?: string;
}

const PosTerminal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeSession, isLoading, error: posError } = useSelector(
    (state: RootState) => state.pos
  );
  const { showToast } = useToast();

  // Get session ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session');

  // State declarations
  const [isInitializing, setIsInitializing] = useState(true);
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [register, setRegister] = useState('Main Register');
  const [transactionType, setTransactionType] = useState<PosTransactionType>(
    PosTransactionType.SALE
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>({
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

  // Initialize terminal
  const initializeTerminal = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError('');

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
      if (Array.isArray(paymentMethodsResponse.data.data) && paymentMethodsResponse.data.data.length > 0) {
        setPaymentMethods(paymentMethodsResponse.data.data);
      } else {
        setPaymentMethods([]);
      }

      // Check for existing session
      if (selectedLocation) {
        try {
          const activeSession = await dispatch(fetchActivePosSession({
            location: selectedLocation,
            register: register || 'Main Register'
          })).unwrap();

          if (!activeSession) {
            // No active session found, create a new one
            const newSession = await dispatch(createPosSession({
              location: selectedLocation,
              register: register || 'Main Register',
              openingBalance: 0,
              notes: ''
            })).unwrap();

            showToast('New POS session created successfully', 'success');
          } else {
            showToast('Resumed existing POS session', 'info');
          }
        } catch (err: any) {
          if (err.message?.includes('already an open session')) {
            // If there's a session conflict, try to fetch the existing session
            const existingSession = await dispatch(fetchActivePosSession({
              location: selectedLocation,
              register: register || 'Main Register'
            })).unwrap();

            if (existingSession) {
              showToast('Resumed existing POS session', 'info');
            } else {
              throw new Error('Failed to fetch existing session');
            }
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error('Error initializing POS terminal:', err);
      setError(err.message || 'Failed to initialize POS terminal');
      showToast(err.message || 'Failed to initialize POS terminal', 'error');
    } finally {
      setIsInitializing(false);
    }
  }, [dispatch, selectedLocation, register, showToast]);

  // Load initial data
  useEffect(() => {
    initializeTerminal();
  }, [initializeTerminal]);

  // Fetch active session when location or register changes
  useEffect(() => {
    if (sessionId && selectedLocation) {
      dispatch(
        fetchActivePosSession({
          location: selectedLocation,
          register: register || 'Main Register'
        })
      );
    }
  }, [dispatch, sessionId, selectedLocation, register]);

  // Handle product selection
  const handleProductSelect = useCallback((product: any) => {
    if (product && product._id) {
      setSelectedProduct(product);
      setUnitPrice(product.price);
      setQuantity(1);
      setProductDiscount(0);
      fetchProductBatches(product._id);
    }
  }, []);

  // Fetch product batches
  const fetchProductBatches = async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}/batches`);
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
      showToast('Error loading product inventory', 'error');
    }
  };

  // Add a helper to check if Add to Cart should be enabled
  const canAddToCart =
    selectedProduct &&
    quantity > 0 &&
    (!selectedProduct.inventoryType || selectedProduct.inventoryType !== 'tracked' || selectedProduct.quantity >= quantity);

  // Add a warning for out of stock
  const outOfStockWarning =
    selectedProduct && selectedProduct.inventoryType === 'tracked' && selectedProduct.quantity <= 0
      ? 'This product is out of stock.'
      : '';

  // Handle adding item to cart
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

      // Add to cart
      const cartItem = {
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: unitPrice || product.price,
        discount: productDiscount,
        subtotal: (unitPrice * quantity) * (1 - productDiscount / 100),
        batchNumber: selectedExpiryDate,
      };

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === product._id
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
      setUnitPrice(0);

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add item to cart');
      showToast('Failed to add item to cart', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle removing item from cart
  const handleRemoveFromCart = (index: number) => {
    try {
      const newCartItems = [...cartItems];
      newCartItems.splice(index, 1);
      setCartItems(newCartItems);
      showToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      showToast('Failed to remove item from cart', 'error');
    }
  };

  // Handle updating cart item
  const handleUpdateCartItem = (index: number, field: string, value: any) => {
    try {
      if (index < 0 || index >= cartItems.length) {
        showToast('Invalid item index', 'error');
        return;
      }

      const newCartItems = [...cartItems];
      const item = { ...newCartItems[index] };

      if (field === 'quantity') {
        item.quantity = value;
        item.subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      } else if (field === 'unitPrice') {
        item.unitPrice = value;
        item.subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      } else if (field === 'discount') {
        item.discount = value;
        item.subtotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      }

      newCartItems[index] = item;
      setCartItems(newCartItems);
      showToast('Item updated', 'success');
    } catch (error) {
      console.error('Error updating cart item:', error);
      showToast('Failed to update item', 'error');
    }
  };

  // Handle proceeding to payment
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

  // Handle payment completion
  const handlePaymentComplete = (paymentData: any[]) => {
    setPaymentMethods(paymentData);
    handleCompleteTransaction();
  };

  // Handle completing transaction
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
      const transactionData: PosTransactionFormData = {
        customer: selectedCustomer._id,
        transactionType: transactionType,
        location: selectedLocation,
        register: register,
        posSession: activeSession._id,
        items: cartItems.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          batchNumber: item.batchNumber
        })),
        discount,
        tax,
        paymentMethods: paymentMethods.map((method) => ({
          method: method._id,
          amount: method.amount,
          reference: method.reference,
        })),
        notes,
        barcodeScanned: false
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

      showToast('Transaction completed successfully', 'success');
      navigate(`/pos/transactions/${result._id}`);
    } catch (err: any) {
      console.error('Error completing transaction:', err);
      setError(err.message || 'Failed to complete transaction');
      showToast('Failed to complete transaction', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error state
  if (error || posError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error || posError || 'An error occurred'}
          onRetry={initializeTerminal}
        />
      </div>
    );
  }

  // If no active session, show message to create one
  if (!activeSession && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-medium mb-4">No Active POS Session</h2>
            <p className="mb-4">
              You need to create or open a POS session before using the terminal.
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
      {activeSession && (
        <PosHeader
          activeSession={activeSession}
          onExitTerminal={() => navigate('/pos/sessions')}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Product selection */}
        <div className="w-2/3 flex flex-col p-4 overflow-hidden">
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <CustomerSearch
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                placeholder="Search for customer..."
                allowCreate
              />
            </div>
            <div className="w-1/2">
              <ProductSearch
                value={selectedProduct}
                onChange={handleProductSelect}
                placeholder="Search for product..."
              />
            </div>
          </div>

          {selectedProduct && (
            <Card className="mb-4">
              <div className="p-4 grid grid-cols-4 gap-4">
                {availableExpiryDates.length > 0 && (
                  <div className="col-span-4 mb-2">
                    <Select
                      label="Select Batch"
                      value={selectedExpiryDate}
                      onChange={(e) => setSelectedExpiryDate(e.target.value)}
                      options={availableExpiryDates.map((group) => ({
                        value: group.expiryDate,
                        label: `${group.totalQuantity} units (Expires: ${new Date(
                          group.expiryDate
                        ).toLocaleDateString()})`,
                      }))}
                    />
                  </div>
                )}
                <div>
                  <Input
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    step="1"
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
                    disabled={!canAddToCart || isProcessing}
                  >
                    {isProcessing ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
              {outOfStockWarning && (
                <div className="text-red-600 text-sm mt-2">{outOfStockWarning}</div>
              )}
            </Card>
          )}

          <div className="flex-1 overflow-auto">
            <PosProductGrid onSelectProduct={handleProductSelect} />
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
              disabled={cartItems.length === 0 || !selectedCustomer || isProcessing || paymentMethods.length === 0}
            >
              {isProcessing ? 'Processing...' : `Pay Now (${formatCurrency(total)})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosTerminal;