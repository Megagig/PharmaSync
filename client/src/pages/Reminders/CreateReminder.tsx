import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createReminder } from '@/store/slices/remindersSlice';
import { ReminderType } from '@/types/reminder.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import api from '@/services/api';

const CreateReminder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.reminders);

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialCustomerId = queryParams.get('customer') || '';
  const initialInvoiceId = queryParams.get('invoice') || '';
  const initialPaymentId = queryParams.get('payment') || '';
  const initialType = queryParams.get('type') || ReminderType.CUSTOM;

  // Form state
  const [customer, setCustomer] = useState(initialCustomerId);
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState(initialType as ReminderType);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoice, setInvoice] = useState(initialInvoiceId);
  const [payment, setPayment] = useState(initialPaymentId);

  // Options for dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    // Load customers
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();

    // If customer ID is provided, load related data
    if (initialCustomerId) {
      fetchCustomerDetails(initialCustomerId);
      fetchCustomerInvoices(initialCustomerId);
      fetchCustomerPayments(initialCustomerId);
    }

    // If invoice ID is provided, load invoice details
    if (initialInvoiceId) {
      fetchInvoiceDetails(initialInvoiceId);
    }

    // If payment ID is provided, load payment details
    if (initialPaymentId) {
      fetchPaymentDetails(initialPaymentId);
    }
  }, [initialCustomerId, initialInvoiceId, initialPaymentId]);

  // Set default subject and message based on type
  useEffect(() => {
    if (customerName) {
      switch (type) {
        case ReminderType.INVOICE_DUE:
          setSubject(`Invoice Payment Reminder`);
          setMessage(`Dear ${customerName},\n\nThis is a friendly reminder that your invoice is due soon. Please make your payment before the due date to avoid late fees.\n\nThank you for your business.`);
          break;
        case ReminderType.INVOICE_OVERDUE:
          setSubject(`Overdue Invoice Reminder`);
          setMessage(`Dear ${customerName},\n\nThis is a reminder that your invoice is now overdue. Please make your payment as soon as possible.\n\nThank you for your business.`);
          break;
        case ReminderType.PAYMENT_THANK_YOU:
          setSubject(`Thank You for Your Payment`);
          setMessage(`Dear ${customerName},\n\nThank you for your recent payment. We appreciate your business and look forward to serving you again.\n\nBest regards.`);
          break;
        default:
          setSubject('');
          setMessage('');
      }
    }
  }, [type, customerName]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      const customer = response.data.data;
      setCustomerName(`${customer.firstName} ${customer.lastName}`);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const fetchCustomerInvoices = async (customerId: string) => {
    try {
      const response = await api.get(`/invoices?customer=${customerId}`);
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
    }
  };

  const fetchCustomerPayments = async (customerId: string) => {
    try {
      const response = await api.get(`/payments?customer=${customerId}`);
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching customer payments:', error);
    }
  };

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      const invoice = response.data.data;
      
      // Set customer if not already set
      if (!customer && invoice.customer) {
        const customerId = typeof invoice.customer === 'object' ? invoice.customer._id : invoice.customer;
        setCustomer(customerId);
        fetchCustomerDetails(customerId);
        fetchCustomerInvoices(customerId);
        fetchCustomerPayments(customerId);
      }
      
      // Set type to invoice due or overdue based on due date
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      
      if (dueDate < today) {
        setType(ReminderType.INVOICE_OVERDUE);
      } else {
        setType(ReminderType.INVOICE_DUE);
      }
      
      // Update subject with invoice number
      setSubject(`Invoice ${invoice.invoiceNumber} ${dueDate < today ? 'Overdue' : 'Payment'} Reminder`);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const fetchPaymentDetails = async (paymentId: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      const payment = response.data.data;
      
      // Set customer if not already set
      if (!customer && payment.customer) {
        const customerId = typeof payment.customer === 'object' ? payment.customer._id : payment.customer;
        setCustomer(customerId);
        fetchCustomerDetails(customerId);
        fetchCustomerInvoices(customerId);
        fetchCustomerPayments(customerId);
      }
      
      // Set type to payment thank you
      setType(ReminderType.PAYMENT_THANK_YOU);
      
      // Update subject with payment number
      setSubject(`Thank You for Payment ${payment.paymentNumber}`);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setCustomer(customerId);
    
    if (customerId) {
      fetchCustomerDetails(customerId);
      fetchCustomerInvoices(customerId);
      fetchCustomerPayments(customerId);
    } else {
      setCustomerName('');
      setInvoices([]);
      setPayments([]);
    }
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = e.target.value;
    setInvoice(invoiceId);
    
    if (invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paymentId = e.target.value;
    setPayment(paymentId);
    
    if (paymentId) {
      fetchPaymentDetails(paymentId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer) {
      alert('Please select a customer');
      return;
    }

    if (!subject || !message) {
      alert('Please provide a subject and message');
      return;
    }

    try {
      const reminderData = {
        customer,
        type,
        subject,
        message,
        scheduledDate,
        invoice: invoice || undefined,
        payment: payment || undefined,
      };

      const resultAction = await dispatch(createReminder(reminderData) as any);
      if (createReminder.fulfilled.match(resultAction)) {
        navigate(`/reminders/${resultAction.payload._id}`);
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Reminder</h1>
        <Button variant="outline" onClick={() => navigate('/reminders')}>
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
              <h2 className="text-lg font-medium mb-4">Reminder Information</h2>
              <div className="space-y-4">
                <Select
                  label="Customer"
                  value={customer}
                  onChange={handleCustomerChange}
                  required
                  disabled={!!initialCustomerId}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.firstName} {customer.lastName} ({customer.customerNumber})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Reminder Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ReminderType)}
                  required
                >
                  <option value={ReminderType.CUSTOM}>Custom</option>
                  <option value={ReminderType.INVOICE_DUE}>Invoice Due</option>
                  <option value={ReminderType.INVOICE_OVERDUE}>Invoice Overdue</option>
                  <option value={ReminderType.PAYMENT_THANK_YOU}>Payment Thank You</option>
                </Select>

                <DatePicker
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  required
                />

                <Input
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  ></textarea>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Related Information</h2>
              <div className="space-y-4">
                <Select
                  label="Related Invoice (Optional)"
                  value={invoice}
                  onChange={handleInvoiceChange}
                  disabled={!customer || !!initialInvoiceId}
                >
                  <option value="">None</option>
                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Related Payment (Optional)"
                  value={payment}
                  onChange={handlePaymentChange}
                  disabled={!customer || !!initialPaymentId}
                >
                  <option value="">None</option>
                  {payments.map((payment) => (
                    <option key={payment._id} value={payment._id}>
                      {payment.paymentNumber} - {new Date(payment.paymentDate).toLocaleDateString()}
                    </option>
                  ))}
                </Select>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || !customer || !subject || !message}
                    className="w-full"
                  >
                    {isLoading ? 'Creating...' : 'Create Reminder'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CreateReminder;
