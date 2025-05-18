import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchActivePosSession,
  createPosTransaction,
} from '@/store/slices/posSlice';
import { PosTransactionType } from '@/types/pos.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import Modal from '@/components/common/Modal/Modal';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import ProductSearch from '@/components/common/ProductSearch/ProductSearch';
import CustomerSearch from '@/components/common/CustomerSearch/CustomerSearch';
import BarcodeScanner from '@/components/common/BarcodeScanner';
import PosCart from './components/NewPosCart';
import PosPayment from './components/PosPayment';
import PosProductGrid from './components/PosProductGrid';
import PosHeader from './components/PosHeader';

const NewPosTerminal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { activeSession, isLoading } = useSelector(
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

  // State for transaction
  const [transactionType, setTransactionType] = useState<PosTransactionType>(
    PosTransactionType.SALE
  );

  // Customer state with default walk-in customer
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    _id: 'walk-in-customer',
    firstName: 'Walk-in',
    lastName: 'Customer',
    customerNumber: 'WALK-IN',
    phone: '',
    email: '',
  });

  // Prescription and doctor state
  const [prescription, setPrescription] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Email and refill reminder state
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [refillReminder, setRefillReminder] = useState(false);
  const [refillReminderDate, setRefillReminderDate] = useState<Date | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [barcodeScanned, setBarcodeScanned] = useState(false);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [earliestBatch, setEarliestBatch] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount + tax;

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        if (Array.isArray(response.data.data)) {
          setLocations(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedLocation(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        showToast('Failed to load locations', 'error');
      }
    };

    fetchLocations();
  }, [showToast]);

  // Fetch active POS session when location is selected
  useEffect(() => {
    if (sessionId && selectedLocation) {
      dispatch(
        fetchActivePosSession({
          location: selectedLocation,
          register: 'Main Register',
        }) as any
      );
    }
  }, [dispatch, sessionId, selectedLocation]);

  // Fetch product stock when a product is selected
  const fetchProductStock = useCallback(
    async (productId: string) => {
      if (!productId) return;

      try {
        const response = await api.get(`/products/${productId}/batches`);

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          // Sort batches by expiry date (earliest first - FIFO)
          const sortedBatches = [...response.data.data].sort(
            (a, b) =>
              new Date(a.expiryDate).getTime() -
              new Date(b.expiryDate).getTime()
          );

          // Calculate total available stock
          const totalStock = sortedBatches.reduce(
            (sum, batch) => sum + batch.quantity,
            0
          );

          // Get the earliest batch
          const firstBatch = sortedBatches[0];

          setAvailableStock(totalStock);
          setEarliestBatch(firstBatch);

          return { totalStock, firstBatch };
        } else {
          setAvailableStock(0);
          setEarliestBatch(null);
          return { totalStock: 0, firstBatch: null };
        }
      } catch (error) {
        console.error('Failed to fetch product stock:', error);
        showToast('Error loading product inventory', 'error');
        setAvailableStock(0);
        setEarliestBatch(null);
        return { totalStock: 0, firstBatch: null };
      }
    },
    [showToast]
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    async (product: any) => {
      if (!product || !product._id) return;

      console.log('Product selected:', product);
      setSelectedProduct(product);
      setUnitPrice(product.defaultPrice || 0);
      setProductDiscount(0);
      setQuantity(1);

      // Fetch stock information
      await fetchProductStock(product._id);
    },
    [fetchProductStock]
  );

  // Handle customer selection
  const handleCustomerSelect = useCallback(
    (customer: any) => {
      if (!customer || !customer._id) return;

      console.log('Customer selected:', customer);
      // Create a deep copy to ensure state update is recognized
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
    },
    [showToast]
  );

  // Handle barcode scanning
  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      try {
        // Search for product by barcode
        const response = await api.get(`/products?barcode=${barcode}`);

        if (response.data.data && response.data.data.length > 0) {
          const product = response.data.data[0];
          setSelectedProduct(product);
          setUnitPrice(product.defaultPrice);
          setBarcodeScanned(true);

          // Get product inventory
          if (product.inventory && product.inventory.length > 0) {
            // Sort inventory by expiry date
            const sortedInventory = [...product.inventory].sort(
              (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
            );

            setAvailableBatches(sortedInventory);
            setEarliestBatch(sortedInventory[0]);
            setSelectedBatch(sortedInventory[0]);
            setAvailableStock(sortedInventory[0].quantity);
          }

          showToast(`Product found: ${product.name}`, 'success');
        } else {
          showToast(`No product found with barcode: ${barcode}`, 'error');
        }
      } catch (error) {
        console.error('Error searching for product by barcode:', error);
        showToast('Failed to search for product by barcode', 'error');
      }
    },
    [showToast]
  );

  // Handle prescription selection
  const handlePrescriptionSelect = useCallback(
    async (prescriptionId: string) => {
      try {
        const response = await api.get(`/prescriptions/${prescriptionId}`);
        if (response.data.data) {
          setPrescription(response.data.data);

          // If prescription has a doctor, set it
          if (response.data.data.doctor) {
            setDoctor(response.data.data.doctor);
          }

          // If prescription has a patient, set as customer
          if (response.data.data.patient) {
            const patientResponse = await api.get(`/patients/${response.data.data.patient}`);
            if (patientResponse.data.data && patientResponse.data.data.customer) {
              const customerResponse = await api.get(`/customers/${patientResponse.data.data.customer}`);
              if (customerResponse.data.data) {
                handleCustomerSelect(customerResponse.data.data);
              }
            }
          }

          showToast(`Prescription #${response.data.data.prescriptionNumber} selected`, 'success');
        }
      } catch (error) {
        console.error('Error fetching prescription:', error);
        showToast('Failed to fetch prescription details', 'error');
      }
    },
    [showToast, handleCustomerSelect]
  );

  // Add product to cart
  const handleAddToCart = useCallback(() => {
    try {
      // Validate inputs
      if (!selectedProduct) {
        showToast('Please select a product', 'error');
        return;
      }

      if (!earliestBatch && !selectedBatch) {
        showToast('No inventory available for this product', 'error');
        return;
      }

      const batchToUse = selectedBatch || earliestBatch;

      if (quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
      }

      if (quantity > availableStock) {
        showToast(`Insufficient stock. Available: ${availableStock}`, 'error');
        return;
      }

      // Calculate subtotal
      const itemSubtotal = quantity * unitPrice - productDiscount;

      // Create cart item
      const newItem = {
        product: selectedProduct._id,
        productDetails: {
          _id: selectedProduct._id,
          name: selectedProduct.name || 'Unknown Product',
          sku: selectedProduct.sku || 'No SKU',
          barcode: selectedProduct.barcode || '',
          defaultPrice: selectedProduct.defaultPrice || unitPrice,
        },
        quantity,
        unitPrice,
        discount: productDiscount,
        subtotal: itemSubtotal,
        batchNumber: batchToUse.batchNumber,
        expiryDate: batchToUse.expiryDate,
        barcodeScanned: barcodeScanned,
      };

      console.log('Adding item to cart:', newItem);

      // Update cart items with a new array to ensure state update
      setCartItems((prevItems) => [...prevItems, newItem]);

      showToast(`Added ${quantity} ${selectedProduct.name} to cart`, 'success');

      // Reset product selection
      setSelectedProduct(null);
      setUnitPrice(0);
      setProductDiscount(0);
      setQuantity(1);
      setAvailableStock(0);
      setEarliestBatch(null);
      setSelectedBatch(null);
      setAvailableBatches([]);
      setBarcodeScanned(false);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  }, [
    selectedProduct,
    earliestBatch,
    selectedBatch,
    quantity,
    availableStock,
    unitPrice,
    productDiscount,
    barcodeScanned,
    showToast,
  ]);

  // Remove item from cart
  const handleRemoveFromCart = useCallback(
    (index: number) => {
      try {
        console.log('Removing item at index:', index);

        setCartItems((prevItems) => {
          const newItems = [...prevItems];
          newItems.splice(index, 1);
          return newItems;
        });

        showToast('Item removed from cart', 'success');
      } catch (error) {
        console.error('Error removing item from cart:', error);
        showToast('Failed to remove item from cart', 'error');
      }
    },
    [showToast]
  );

  // Update cart item
  const handleUpdateCartItem = useCallback(
    (index: number, field: string, value: any) => {
      try {
        setCartItems((prevItems) => {
          const newItems = [...prevItems];
          const item = { ...newItems[index] };

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

          newItems[index] = item;
          return newItems;
        });

        showToast('Item updated', 'success');
      } catch (error) {
        console.error('Error updating cart item:', error);
        showToast('Failed to update item', 'error');
      }
    },
    [showToast]
  );

  // Proceed to payment
  const handleProceedToPayment = useCallback(() => {
    if (cartItems.length === 0) {
      showToast('Please add at least one item to the cart', 'error');
      return;
    }

    setShowPaymentModal(true);
  }, [cartItems.length, showToast]);

  // Handle payment completion
  const handlePaymentComplete = useCallback((paymentData: any[]) => {
    setPaymentMethods(paymentData);
    handleCompleteTransaction(paymentData);
  }, []);

  // Complete transaction
  const handleCompleteTransaction = useCallback(
    async (paymentData: any[]) => {
      if (!activeSession) {
        showToast('No active POS session', 'error');
        return;
      }

      if (cartItems.length === 0) {
        showToast('Please add at least one item to the cart', 'error');
        return;
      }

      if (paymentData.length === 0) {
        showToast('Please add at least one payment method', 'error');
        return;
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
          barcodeScanned: item.barcodeScanned || false,
        })),
        discount,
        tax,
        paymentMethods: paymentData,
        notes,
        location: activeSession.location._id || activeSession.location,
        prescription: prescription?._id,
        doctor: doctor?._id,
        barcodeScanned: cartItems.some(item => item.barcodeScanned),
        emailReceipt,
        refillReminder,
        refillReminderDate: refillReminderDate ? refillReminderDate.toISOString() : undefined,
      };

      try {
        const resultAction = await dispatch(
          createPosTransaction(transactionData) as any
        );

        if (createPosTransaction.fulfilled.match(resultAction)) {
          showToast('Transaction completed successfully', 'success');
          navigate(`/pos/transactions/${resultAction.payload._id}/receipt`);

          // Reset form
          setSelectedCustomer({
            _id: 'walk-in-customer',
            firstName: 'Walk-in',
            lastName: 'Customer',
            customerNumber: 'WALK-IN',
            phone: '',
            email: '',
          });
          setCartItems([]);
          setDiscount(0);
          setTax(0);
          setNotes('');
          setPrescription(null);
          setDoctor(null);
          setEmailReceipt(false);
          setRefillReminder(false);
          setRefillReminderDate(null);
          setBarcodeScanned(false);
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
    },
    [
      activeSession,
      cartItems,
      selectedCustomer,
      transactionType,
      discount,
      tax,
      notes,
      prescription,
      doctor,
      emailReceipt,
      refillReminder,
      refillReminderDate,
      dispatch,
      navigate,
      showToast,
    ]
  );

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
                onChange={handleCustomerSelect}
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

          <div className="mb-4">
            <BarcodeScanner
              onBarcodeDetected={handleBarcodeDetected}
              placeholder="Scan barcode or enter manually"
              buttonText="Scan Barcode"
            />
          </div>

          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowPrescriptionModal(true)}
              >
                Link Prescription
              </Button>
            </div>
            <div className="w-1/2 flex space-x-2">
              <Checkbox
                id="emailReceipt"
                checked={emailReceipt}
                onChange={(e) => setEmailReceipt(e.target.checked)}
                label="Email Receipt"
              />
              <Checkbox
                id="refillReminder"
                checked={refillReminder}
                onChange={(e) => setRefillReminder(e.target.checked)}
                label="Refill Reminder"
              />
            </div>
          </div>

          {refillReminder && (
            <div className="mb-4">
              <Input
                type="date"
                label="Refill Reminder Date"
                value={refillReminderDate ? refillReminderDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setRefillReminderDate(e.target.value ? new Date(e.target.value) : null)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {prescription && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h3 className="font-medium">Linked Prescription</h3>
              <p>Prescription #: {prescription.prescriptionNumber}</p>
              <p>Date: {new Date(prescription.issueDate).toLocaleDateString()}</p>
              {doctor && <p>Doctor: Dr. {doctor.firstName} {doctor.lastName}</p>}
              <Button
                variant="text"
                className="text-red-500 mt-2"
                onClick={() => {
                  setPrescription(null);
                  setDoctor(null);
                }}
              >
                Remove Link
              </Button>
            </div>
          )}

          {selectedProduct && (
            <Card className="mb-4">
              <div className="p-4 grid grid-cols-4 gap-4">
                <div className="col-span-4 mb-2">
                  <div className="text-sm text-gray-600">
                    Available Stock: {availableStock} units
                    {earliestBatch && (
                      <span className="ml-2">
                        (Expires:{' '}
                        {new Date(
                          earliestBatch.expiryDate
                        ).toLocaleDateString()}
                        )
                      </span>
                    )}
                  </div>
                </div>
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
                {availableBatches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Batch
                    </label>
                    <Select
                      value={selectedBatch?.batchNumber || ''}
                      onChange={(e) => {
                        const batch = availableBatches.find(b => b.batchNumber === e.target.value);
                        if (batch) {
                          setSelectedBatch(batch);
                          setAvailableStock(batch.quantity);
                        }
                      }}
                    >
                      <option value="">Select a batch</option>
                      {availableBatches.map((batch) => (
                        <option key={batch.batchNumber} value={batch.batchNumber}>
                          {batch.batchNumber} - Exp: {new Date(batch.expiryDate).toLocaleDateString()} - Qty: {batch.quantity}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    onClick={handleAddToCart}
                    className="w-full"
                    disabled={!selectedProduct || availableStock <= 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
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
              disabled={cartItems.length === 0}
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

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Link Prescription"
      >
        <div className="p-4">
          <div className="mb-4">
            <Input
              type="text"
              label="Prescription Number"
              placeholder="Enter prescription number"
              onChange={(e) => {
                if (e.target.value.trim()) {
                  // Search for prescription by number
                  api.get(`/prescriptions?prescriptionNumber=${e.target.value.trim()}`)
                    .then(response => {
                      if (response.data.data && response.data.data.length > 0) {
                        handlePrescriptionSelect(response.data.data[0]._id);
                        setShowPrescriptionModal(false);
                      } else {
                        showToast('No prescription found with that number', 'error');
                      }
                    })
                    .catch(error => {
                      console.error('Error searching for prescription:', error);
                      showToast('Error searching for prescription', 'error');
                    });
                }
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowPrescriptionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewPosTerminal;
