import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import api from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface ProcessPurchaseInvoiceProps {
  invoiceId: string;
  items: any[];
  onSuccess: () => void;
}

const ProcessPurchaseInvoice = ({
  invoiceId,
  items,
  onSuccess,
}: ProcessPurchaseInvoiceProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [batchNumbers, setBatchNumbers] = useState<string[]>([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);

  useEffect(() => {
    // Initialize arrays based on items length
    setBatchNumbers(Array(items.length).fill(''));
    setExpiryDates(
      Array(items.length).fill(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      )
    );

    // Load locations
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations/active');
        setLocations(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedLocation(response.data.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [items]);

  const handleBatchNumberChange = (index: number, value: string) => {
    const newBatchNumbers = [...batchNumbers];
    newBatchNumbers[index] = value;
    setBatchNumbers(newBatchNumbers);
  };

  const handleExpiryDateChange = (index: number, value: string) => {
    const newExpiryDates = [...expiryDates];
    newExpiryDates[index] = value;
    setExpiryDates(newExpiryDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedLocation) {
      showToast('Please select a location', 'error');
      return;
    }

    if (batchNumbers.some((batch) => !batch)) {
      showToast('Please enter batch numbers for all items', 'error');
      return;
    }

    if (expiryDates.some((date) => !date)) {
      showToast('Please enter expiry dates for all items', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(`/invoices/${invoiceId}/process`, {
        batchNumbers,
        expiryDates,
        location: selectedLocation,
      });

      showToast('Invoice processed successfully', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Error processing invoice:', error);
      showToast(
        error.response?.data?.message || 'Error processing invoice',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-medium mb-4">Process Purchase Invoice</h2>
        <p className="mb-4 text-gray-600">
          Enter batch numbers and expiry dates for each item to add them to inventory.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="border p-4 rounded-md">
                <div className="font-medium mb-2">
                  {typeof item.product === 'object'
                    ? item.product.name
                    : item.description}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Quantity: {item.quantity} | Unit Price: ₦{item.unitPrice.toFixed(2)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Batch Number"
                    value={batchNumbers[index] || ''}
                    onChange={(e) =>
                      handleBatchNumberChange(index, e.target.value)
                    }
                    required
                  />
                  <DatePicker
                    label="Expiry Date"
                    value={expiryDates[index] || ''}
                    onChange={(date) => handleExpiryDateChange(index, date)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/invoices`)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Process Invoice
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ProcessPurchaseInvoice;
