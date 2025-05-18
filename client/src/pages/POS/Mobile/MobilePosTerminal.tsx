import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchActivePosSession, createPosTransaction } from '@/store/slices/posSlice';
import { PosTransactionType } from '@/types/pos.types';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/formatters';
import { 
  FaShoppingCart, 
  FaUser, 
  FaBarcode, 
  FaSearch, 
  FaPlus, 
  FaMinus, 
  FaTrash,
  FaCreditCard,
  FaReceipt,
  FaArrowLeft
} from 'react-icons/fa';

const MobilePosTerminal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { activeSession, loading } = useSelector((state: RootState) => state.pos);

  // Cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState<'cart' | 'products' | 'customer'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // Mock data (would be replaced with API calls)
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    _id: 'walk-in-customer',
    firstName: 'Walk-in',
    lastName: 'Customer',
    customerNumber: 'WALK-IN',
    phone: '',
    email: '',
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount + tax;

  // Fetch active session on component mount
  useEffect(() => {
    dispatch(fetchActivePosSession() as any);
    
    // Mock products data
    const mockProducts = Array.from({ length: 20 }, (_, i) => ({
      _id: `product-${i + 1}`,
      name: `Product ${i + 1}`,
      sku: `SKU-${1000 + i}`,
      sellingPrice: Math.floor(Math.random() * 100) + 5,
      totalStock: Math.floor(Math.random() * 50) + 1,
      category: Math.random() > 0.5 ? 'Medication' : 'Supplies',
    }));
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, [dispatch]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  // Handle product selection
  const handleProductSelect = (product: any) => {
    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex(item => item.product === product._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].subtotal = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      const newItem = {
        product: product._id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        subtotal: product.sellingPrice,
        discount: 0,
      };
      
      setCartItems([...cartItems, newItem]);
    }
    
    // Switch to cart tab
    setActiveTab('cart');
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    // In a real app, this would search for the product by barcode
    showToast(`Scanned barcode: ${barcode}`, 'info');
    setShowBarcodeScanner(false);
    
    // Mock finding a product
    const foundProduct = products[Math.floor(Math.random() * products.length)];
    if (foundProduct) {
      handleProductSelect(foundProduct);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].subtotal = newQuantity * updatedItems[index].unitPrice;
    
    setCartItems(updatedItems);
  };

  // Handle item removal
  const handleRemoveItem = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  };

  // Handle payment
  const handlePayment = (paymentData: any) => {
    if (cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    
    if (!activeSession) {
      showToast('No active session', 'error');
      return;
    }
    
    const transactionData = {
      customer: selectedCustomer._id,
      transactionType: PosTransactionType.SALE,
      posSession: activeSession._id,
      register: activeSession.register,
      items: cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
      discount,
      tax,
      paymentMethods: paymentData,
      notes,
      location: activeSession.location._id || activeSession.location,
    };
    
    dispatch(createPosTransaction(transactionData) as any)
      .then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          showToast('Transaction completed successfully', 'success');
          
          // Reset form
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
          
          // Navigate to receipt
          navigate(`/pos/transactions/${result.payload._id}`);
        }
      })
      .catch((error: any) => {
        console.error('Transaction error:', error);
        showToast('Failed to complete transaction', 'error');
      });
  };

  // Mock payment process
  const handlePaymentComplete = () => {
    const paymentData = [
      {
        method: 'cash',
        amount: total,
      },
    ];
    
    handlePayment(paymentData);
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-2">No Active Session</h2>
          <p className="text-gray-600 mb-4">You need to start a POS session before using the terminal.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/pos/sessions/new')}
          className="w-full max-w-xs"
        >
          Start New Session
        </Button>
      </div>
    );
  }

  return (
    <div className="mobile-pos-terminal h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="text"
            onClick={() => navigate('/pos')}
            className="mr-2"
          >
            <FaArrowLeft />
          </Button>
          <h2 className="text-lg font-semibold">Mobile POS</h2>
        </div>
        <div className="text-sm text-gray-600">
          Session: {activeSession.sessionNumber}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Customer Info */}
        <div className="bg-white p-3 border-b flex justify-between items-center">
          <div className="flex items-center">
            <FaUser className="text-gray-500 mr-2" />
            <div>
              <div className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
              <div className="text-xs text-gray-500">{selectedCustomer.customerNumber}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerModal(true)}
          >
            Change
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="flex">
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'cart' ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
              onClick={() => setActiveTab('cart')}
            >
              Cart ({cartItems.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'products' && (
            <div className="p-3">
              {/* Search and Barcode */}
              <div className="flex mb-3">
                <div className="flex-1 mr-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowBarcodeScanner(true)}
                >
                  <FaBarcode />
                </Button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm border p-3 flex flex-col"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{product.sku}</div>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="font-bold text-primary">
                        {formatCurrency(product.sellingPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.totalStock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="p-3">
              {/* Cart Items */}
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaShoppingCart className="mx-auto mb-2 text-gray-300 text-4xl" />
                  <p>Your cart is empty</p>
                  <Button
                    variant="text"
                    className="mt-2 text-primary"
                    onClick={() => setActiveTab('products')}
                  >
                    Add products
                  </Button>
                </div>
              ) : (
                <div>
                  {cartItems.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-3 mb-3">
                      <div className="flex justify-between">
                        <div className="font-medium">{item.productName}</div>
                        <Button
                          variant="text"
                          className="text-red-500 p-1"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          >
                            <FaMinus size={12} />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            <FaPlus size={12} />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {formatCurrency(item.unitPrice)} each
                          </div>
                          <div className="font-bold">
                            {formatCurrency(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cart Summary */}
                  <div className="bg-white rounded-lg shadow-sm border p-3 mt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Discount</span>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-20 text-right mr-2"
                        />
                        <span>{formatCurrency(discount)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax</span>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={tax}
                          onChange={(e) => setTax(Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-20 text-right mr-2"
                        />
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <Input
                      type="text"
                      placeholder="Add notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm">
            <div>Total</div>
            <div className="text-xl font-bold">{formatCurrency(total)}</div>
          </div>
          <div className="text-sm text-right">
            <div>Items</div>
            <div className="font-medium">{cartItems.length}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => setCartItems([])}
            disabled={cartItems.length === 0}
            className="flex items-center justify-center"
          >
            <FaTrash className="mr-2" /> Clear
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowPaymentModal(true)}
            disabled={cartItems.length === 0}
            className="flex items-center justify-center"
          >
            <FaCreditCard className="mr-2" /> Pay
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Payment</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="text-2xl font-bold">{formatCurrency(total)}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-3"
                  >
                    Cash
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-3"
                  >
                    Card
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-3"
                  >
                    Mobile Money
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center py-3"
                  >
                    Transfer
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePaymentComplete}
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Select Customer</h3>
            </div>
            <div className="p-4">
              <Input
                type="text"
                placeholder="Search customers..."
                className="w-full mb-4"
              />
              
              <div className="max-h-64 overflow-y-auto">
                <div 
                  className="p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCustomerSelect({
                    _id: 'walk-in-customer',
                    firstName: 'Walk-in',
                    lastName: 'Customer',
                    customerNumber: 'WALK-IN',
                    phone: '',
                    email: '',
                  })}
                >
                  <div className="font-medium">Walk-in Customer</div>
                  <div className="text-xs text-gray-500">WALK-IN</div>
                </div>
                
                {/* Mock customers */}
                {Array.from({ length: 5 }, (_, i) => (
                  <div 
                    key={i}
                    className="p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleCustomerSelect({
                      _id: `customer-${i + 1}`,
                      firstName: `John${i + 1}`,
                      lastName: 'Doe',
                      customerNumber: `CUST-${1000 + i}`,
                      phone: '123-456-7890',
                      email: `john${i + 1}@example.com`,
                    })}
                  >
                    <div className="font-medium">John{i + 1} Doe</div>
                    <div className="text-xs text-gray-500">CUST-{1000 + i}</div>
                    <div className="text-xs text-gray-500">john{i + 1}@example.com</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/customers/new')}
                >
                  New Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
          <div className="p-4 text-white flex justify-between items-center">
            <h3 className="text-lg font-semibold">Scan Barcode</h3>
            <Button
              variant="text"
              className="text-white"
              onClick={() => setShowBarcodeScanner(false)}
            >
              <FaTimes />
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm aspect-square border-2 border-white rounded-lg mb-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-1 bg-red-500 animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-white text-center mb-4">
              Position the barcode within the frame
            </p>
            
            <Input
              type="text"
              placeholder="Enter barcode manually"
              className="w-full max-w-sm mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  handleBarcodeScan(target.value);
                  target.value = '';
                }
              }}
            />
            
            <Button
              variant="primary"
              onClick={() => handleBarcodeScan('123456789')}
              className="w-full max-w-sm"
            >
              Simulate Scan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePosTerminal;
