import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button/Button';
import { useToast } from '@/hooks/useToast';
import ReceiptService from '@/services/receipt.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  FaPrint, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaDownload,
  FaShare,
  FaArrowLeft
} from 'react-icons/fa';

interface MobileReceiptViewerProps {
  transactionId: string;
  onClose?: () => void;
  onBack?: () => void;
}

const MobileReceiptViewer: React.FC<MobileReceiptViewerProps> = ({ 
  transactionId, 
  onClose,
  onBack
}) => {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [schedulingReminder, setSchedulingReminder] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (transactionId) {
      fetchReceiptData();
    }
  }, [transactionId]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch the receipt data from the API
      // For now, we'll use mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        saleNumber: 'POS-12345',
        saleDate: new Date(),
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          customerNumber: 'CUST-1001',
          email: 'john@example.com',
          phone: '123-456-7890',
        },
        cashier: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
        items: [
          {
            product: {
              name: 'Paracetamol 500mg',
              sku: 'MED-001',
            },
            quantity: 2,
            unitPrice: 5.99,
            discount: 0,
            subtotal: 11.98,
          },
          {
            product: {
              name: 'Vitamin C 1000mg',
              sku: 'VIT-001',
            },
            quantity: 1,
            unitPrice: 8.99,
            discount: 1.00,
            subtotal: 7.99,
          },
        ],
        subtotal: 19.97,
        discount: 2.00,
        tax: 1.80,
        total: 19.77,
        paymentMethods: [
          {
            method: 'cash',
            amount: 20.00,
          },
        ],
        changeDue: 0.23,
        location: {
          name: 'Main Store',
          address: '123 Main St, City',
          phone: '555-123-4567',
        },
        transactionType: 'sale',
      };
      
      setReceiptData(mockData);
    } catch (error) {
      console.error('Error fetching receipt data:', error);
      showToast('Failed to fetch receipt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      
      // In a real implementation, this would call the API to send the email
      await ReceiptService.sendReceiptEmail(transactionId);
      
      showToast('Receipt sent to customer email', 'success');
    } catch (error) {
      console.error('Error sending receipt email:', error);
      showToast('Failed to send receipt email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleScheduleReminder = async () => {
    try {
      setSchedulingReminder(true);
      
      // Calculate default reminder date (30 days from now)
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 30);
      
      // Prompt user for reminder date
      const userDate = window.prompt(
        'Enter reminder date (YYYY-MM-DD):',
        reminderDate.toISOString().split('T')[0]
      );
      
      if (!userDate) {
        setSchedulingReminder(false);
        return;
      }
      
      // In a real implementation, this would call the API to schedule the reminder
      await ReceiptService.scheduleRefillReminder(
        transactionId,
        new Date(userDate)
      );
      
      showToast('Refill reminder scheduled', 'success');
    } catch (error) {
      console.error('Error scheduling refill reminder:', error);
      showToast('Failed to schedule refill reminder', 'error');
    } finally {
      setSchedulingReminder(false);
    }
  };

  const handleShare = () => {
    // This is a placeholder for sharing functionality
    // In a real implementation, this would use the Web Share API
    if (navigator.share) {
      navigator.share({
        title: `Receipt ${receiptData?.saleNumber}`,
        text: `Your receipt from PharmaSync`,
        url: window.location.href,
      })
        .then(() => showToast('Receipt shared successfully', 'success'))
        .catch((error) => {
          console.error('Error sharing receipt:', error);
          showToast('Failed to share receipt', 'error');
        });
    } else {
      showToast('Sharing not supported on this device', 'info');
    }
  };

  return (
    <div className="mobile-receipt-viewer bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div className="flex items-center">
          {onBack && (
            <Button
              variant="text"
              onClick={onBack}
              className="mr-2"
            >
              <FaArrowLeft />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Receipt</h2>
        </div>
        {receiptData && (
          <div className="text-sm text-gray-600">
            {receiptData.saleNumber}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-3 border-b">
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2"
          >
            <FaPrint className="mb-1" />
            <span className="text-xs">Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={loading || sendingEmail}
            className="flex flex-col items-center justify-center py-2"
          >
            <FaEnvelope className="mb-1" />
            <span className="text-xs">Email</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScheduleReminder}
            disabled={loading || schedulingReminder}
            className="flex flex-col items-center justify-center py-2"
          >
            <FaCalendarAlt className="mb-1" />
            <span className="text-xs">Reminder</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2"
          >
            <FaShare className="mb-1" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ) : receiptData ? (
          <>
            {/* Store Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3 text-center">
              <h3 className="text-xl font-bold mb-1">PharmaSync</h3>
              <p className="text-sm text-gray-600 mb-1">{receiptData.location?.name}</p>
              <p className="text-sm text-gray-600 mb-1">{receiptData.location?.address}</p>
              <p className="text-sm text-gray-600">{receiptData.location?.phone}</p>
            </div>

            {/* Transaction Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">Receipt #:</div>
                <div className="font-medium">{receiptData.saleNumber}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">Date:</div>
                <div>{formatDate(receiptData.saleDate)}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">Cashier:</div>
                <div>{receiptData.cashier?.firstName} {receiptData.cashier?.lastName}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">Customer:</div>
                <div>{receiptData.customer?.firstName} {receiptData.customer?.lastName}</div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <h4 className="font-medium mb-3">Items</h4>
              {receiptData.items.map((item: any, index: number) => (
                <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="font-medium">{formatCurrency(item.subtotal)}</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>{item.quantity} x {formatCurrency(item.unitPrice)}</div>
                    {item.discount > 0 && (
                      <div>Discount: {formatCurrency(item.discount)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">Subtotal:</div>
                <div>{formatCurrency(receiptData.subtotal)}</div>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-600">Discount:</div>
                  <div>-{formatCurrency(receiptData.discount)}</div>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-600">Tax:</div>
                <div>{formatCurrency(receiptData.tax)}</div>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <div>Total:</div>
                <div>{formatCurrency(receiptData.total)}</div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <h4 className="font-medium mb-2">Payment</h4>
              {receiptData.paymentMethods.map((payment: any, index: number) => (
                <div key={index} className="flex justify-between mb-1">
                  <div className="text-sm text-gray-600">
                    {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}:
                  </div>
                  <div>{formatCurrency(payment.amount)}</div>
                </div>
              ))}
              {receiptData.changeDue > 0 && (
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <div>Change:</div>
                  <div>{formatCurrency(receiptData.changeDue)}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-3 text-center">
              <p className="text-sm mb-2">Thank you for your business!</p>
              <p className="text-xs text-gray-500">
                Items may be returned within 30 days with receipt.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p>No receipt data available.</p>
            <Button
              variant="primary"
              onClick={fetchReceiptData}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {onClose && (
        <div className="bg-white border-t p-3">
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileReceiptViewer;
