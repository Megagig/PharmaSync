import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createInvoice } from '@/store/slices/invoicesSlice';
import { fetchSales } from '@/store/slices/salesSlice';
import { InvoiceType } from '@/types/invoice.types';
import { SaleStatus, PaymentStatus } from '@/types/sale.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import DateRangePicker from '@/components/common/DateRangePicker/DateRangePicker';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { formatCurrency, formatDate } from '@/utils/formatters';

const BatchInvoice = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sales, isLoading: salesLoading } = useSelector((state: RootState) => state.sales);
  const { isLoading: invoiceLoading, error } = useSelector((state: RootState) => state.invoices);

  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customer, setCustomer] = useState('');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  // Set due date to 30 days from now by default
  useEffect(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    setDueDate(thirtyDaysFromNow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadSales();
  }, [dispatch, customer, dateRange]);

  const loadSales = () => {
    const params: any = {
      status: SaleStatus.COMPLETED,
      paymentStatus: PaymentStatus.UNPAID,
      limit: 100,
    };

    if (customer) {
      params.customer = customer;
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    dispatch(fetchSales(params) as any);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSales([]);
    } else {
      setSelectedSales(sales.map((sale) => sale._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectSale = (saleId: string) => {
    if (selectedSales.includes(saleId)) {
      setSelectedSales(selectedSales.filter((id) => id !== saleId));
      setSelectAll(false);
    } else {
      setSelectedSales([...selectedSales, saleId]);
      if (selectedSales.length + 1 === sales.length) {
        setSelectAll(true);
      }
    }
  };

  const handleCreateInvoices = async () => {
    if (selectedSales.length === 0) {
      alert('Please select at least one sale to invoice');
      return;
    }

    try {
      // Create an invoice for each selected sale
      for (const saleId of selectedSales) {
        const sale = sales.find((s) => s._id === saleId);
        if (!sale) continue;

        const customer = typeof sale.customer === 'object' ? sale.customer._id : sale.customer;

        await dispatch(
          createInvoice({
            type: InvoiceType.SALES,
            customer,
            invoiceDate,
            dueDate,
            items: sale.items.map((item: any) => ({
              product: typeof item.product === 'object' ? item.product._id : item.product,
              description: typeof item.product === 'object' ? item.product.name : 'Product',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              tax: 0,
            })),
            discount: sale.discount,
            tax: sale.tax,
            notes,
            termsAndConditions,
            sale: saleId,
          }) as any
        );
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Failed to create invoices:', error);
    }
  };

  const calculateTotal = () => {
    return sales
      .filter((sale) => selectedSales.includes(sale._id))
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Batch Invoicing</h1>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Select Sales to Invoice</h2>
            <div className="space-y-4 mb-6">
              <Input
                label="Customer ID (Optional)"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Filter by customer ID"
              />
              <DateRangePicker
                label="Sale Date Range (Optional)"
                startDate={dateRange?.startDate || ''}
                endDate={dateRange?.endDate || ''}
                onDateChange={setDateRange}
              />
              <div className="flex justify-end">
                <Button variant="primary" onClick={loadSales}>
                  Search
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            {salesLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No unpaid sales found</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Checkbox
                    id="select-all"
                    label="Select All"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sale #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sales.map((sale) => (
                        <tr key={sale._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              id={`sale-${sale._id}`}
                              checked={selectedSales.includes(sale._id)}
                              onChange={() => handleSelectSale(sale._id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-primary-600">
                              {sale.saleNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {formatDate(sale.saleDate)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {typeof sale.customer === 'object'
                                ? `${sale.customer.firstName} ${sale.customer.lastName}`
                                : 'Unknown Customer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {formatCurrency(sale.total)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Invoice Details</h2>
            <div className="space-y-4">
              <DatePicker
                label="Invoice Date"
                value={invoiceDate}
                onChange={setInvoiceDate}
                required
              />
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms and Conditions (Optional)
                </label>
                <textarea
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Selected Sales:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedSales.length}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    Total Amount:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
                <Button
                  variant="primary"
                  onClick={handleCreateInvoices}
                  disabled={selectedSales.length === 0 || invoiceLoading}
                  className="w-full"
                >
                  {invoiceLoading ? 'Creating...' : 'Create Invoices'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BatchInvoice;
