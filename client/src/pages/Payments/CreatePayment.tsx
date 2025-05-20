import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createPayment } from '@/store/slices/paymentsSlice';
import {
  PaymentFormData,
  PaymentMethod,
  PaymentDirection,
} from '@/types/payment.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const CreatePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.payments
  );

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialDirection =
    queryParams.get('direction') === 'made'
      ? PaymentDirection.MADE
      : PaymentDirection.RECEIVED;
  const initialInvoiceId = queryParams.get('invoice') || '';
  const initialSaleId = queryParams.get('sale') || '';
  const initialPurchaseOrderId = queryParams.get('purchaseOrder') || '';
  const initialCustomerId = queryParams.get('customer') || '';
  const initialSupplierId = queryParams.get('supplier') || '';

  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    reference: '',
    notes: '',
    direction: initialDirection,
    invoice: initialInvoiceId,
    sale: initialSaleId,
    purchaseOrder: initialPurchaseOrderId,
    customer: initialCustomerId,
    supplier: initialSupplierId,
  });

  // Helper function to add delay between API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    // Load customers if receiving payment
    if (formData.direction === PaymentDirection.RECEIVED) {
      const fetchCustomers = async () => {
        try {
          // Add delay to avoid rate limiting
          await delay(300);
          const response = await api.get('/customers?isActive=true');
          console.log('Customer response:', response.data);

          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setCustomers(response.data.data);
            console.log('Found customers in data.data property');
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setCustomers(response.data);
            console.log('Found customers in direct array');
          } else if (response.data && response.data.customers && Array.isArray(response.data.customers)) {
            // Handle case where customers are in a nested property
            setCustomers(response.data.customers);
            console.log('Found customers in customers property');
          } else if (response.data && typeof response.data === 'object') {
            // Try to find any array property that might contain customers
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              setCustomers(response.data[arrayProps[0]]);
              console.log(`Extracted customers from ${arrayProps[0]} property`);
            } else {
              console.error('Unexpected API response format:', response.data);
              setCustomers([]);
            }
          } else {
            console.error('Unexpected API response format:', response.data);
            setCustomers([]);
          }
        } catch (error) {
          console.error('Error fetching customers:', error);
          setCustomers([]);
        }
      };
      fetchCustomers();
    }

    // Load suppliers if making payment
    if (formData.direction === PaymentDirection.MADE) {
      const fetchSuppliers = async () => {
        try {
          // Add delay to avoid rate limiting
          await delay(300);
          const response = await api.get('/suppliers?isActive=true');
          console.log('Supplier response:', response.data);

          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setSuppliers(response.data.data);
            console.log('Found suppliers in data.data property');
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setSuppliers(response.data);
            console.log('Found suppliers in direct array');
          } else if (response.data && response.data.suppliers && Array.isArray(response.data.suppliers)) {
            // Handle case where suppliers are in a nested property
            setSuppliers(response.data.suppliers);
            console.log('Found suppliers in suppliers property');
          } else if (response.data && typeof response.data === 'object') {
            // Try to find any array property that might contain suppliers
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              setSuppliers(response.data[arrayProps[0]]);
              console.log(`Extracted suppliers from ${arrayProps[0]} property`);
            } else {
              console.error('Unexpected API response format:', response.data);
              setSuppliers([]);
            }
          } else {
            console.error('Unexpected API response format:', response.data);
            setSuppliers([]);
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setSuppliers([]);
        }
      };
      fetchSuppliers();
    }

    // Load invoices based on direction
    const fetchInvoices = async () => {
      try {
        // Add delay to avoid rate limiting
        await delay(600);
        const type =
          formData.direction === PaymentDirection.RECEIVED
            ? 'sales'
            : 'purchase';
        const status = 'draft,sent,partial,overdue';
        const response = await api.get(
          `/invoices?type=${type}&status=${status}`
        );
        console.log('Invoice response:', response.data);

        // Check if response.data.data exists and is an array
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setInvoices(response.data.data);
          console.log('Found invoices in data.data property');
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where API returns array directly
          setInvoices(response.data);
          console.log('Found invoices in direct array');
        } else if (response.data && response.data.invoices && Array.isArray(response.data.invoices)) {
          // Handle case where invoices are in a nested property
          setInvoices(response.data.invoices);
          console.log('Found invoices in invoices property');
        } else if (response.data && typeof response.data === 'object') {
          // Try to find any array property that might contain invoices
          const arrayProps = Object.keys(response.data).filter(key =>
            Array.isArray(response.data[key])
          );

          if (arrayProps.length > 0) {
            setInvoices(response.data[arrayProps[0]]);
            console.log(`Extracted invoices from ${arrayProps[0]} property`);
          } else {
            console.error('Unexpected API response format:', response.data);
            setInvoices([]);
          }
        } else {
          console.error('Unexpected API response format:', response.data);
          setInvoices([]);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      }
    };
    fetchInvoices();

    // Load sales if receiving payment
    if (formData.direction === PaymentDirection.RECEIVED) {
      const fetchSales = async () => {
        try {
          // Add delay to avoid rate limiting
          await delay(900);
          const response = await api.get('/sales?paymentStatus=unpaid,partial');
          console.log('Sales response:', response.data);

          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setSales(response.data.data);
            console.log('Found sales in data.data property');
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setSales(response.data);
            console.log('Found sales in direct array');
          } else if (response.data && response.data.sales && Array.isArray(response.data.sales)) {
            // Handle case where sales are in a nested property
            setSales(response.data.sales);
            console.log('Found sales in sales property');
          } else if (response.data && typeof response.data === 'object') {
            // Try to find any array property that might contain sales
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              setSales(response.data[arrayProps[0]]);
              console.log(`Extracted sales from ${arrayProps[0]} property`);
            } else {
              console.error('Unexpected API response format:', response.data);
              setSales([]);
            }
          } else {
            console.error('Unexpected API response format:', response.data);
            setSales([]);
          }
        } catch (error) {
          console.error('Error fetching sales:', error);
          setSales([]);
        }
      };
      fetchSales();
    }

    // Load purchase orders if making payment
    if (formData.direction === PaymentDirection.MADE) {
      const fetchPurchaseOrders = async () => {
        try {
          // Add delay to avoid rate limiting
          await delay(900);
          const response = await api.get(
            '/purchase-orders?paymentStatus=unpaid,partial'
          );
          console.log('Purchase orders response:', response.data);

          // Check if response.data.data exists and is an array
          if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            setPurchaseOrders(response.data.data);
            console.log('Found purchase orders in data.data property');
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API returns array directly
            setPurchaseOrders(response.data);
            console.log('Found purchase orders in direct array');
          } else if (response.data && response.data.purchaseOrders && Array.isArray(response.data.purchaseOrders)) {
            // Handle case where purchase orders are in a nested property
            setPurchaseOrders(response.data.purchaseOrders);
            console.log('Found purchase orders in purchaseOrders property');
          } else if (response.data && typeof response.data === 'object') {
            // Try to find any array property that might contain purchase orders
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              setPurchaseOrders(response.data[arrayProps[0]]);
              console.log(`Extracted purchase orders from ${arrayProps[0]} property`);
            } else {
              console.error('Unexpected API response format:', response.data);
              setPurchaseOrders([]);
            }
          } else {
            console.error('Unexpected API response format:', response.data);
            setPurchaseOrders([]);
          }
        } catch (error) {
          console.error('Error fetching purchase orders:', error);
          setPurchaseOrders([]);
        }
      };
      fetchPurchaseOrders();
    }
  }, [formData.direction]);

  useEffect(() => {
    // Load specific invoice if provided
    if (initialInvoiceId) {
      const fetchInvoice = async () => {
        try {
          const response = await api.get(`/invoices/${initialInvoiceId}`);
          const invoice = response.data.data;
          setSelectedInvoice(invoice);

          // Pre-populate form with invoice data
          setFormData((prev) => ({
            ...prev,
            amount: invoice.balance,
            customer:
              invoice.type === 'sales' && invoice.customer
                ? typeof invoice.customer === 'object'
                  ? invoice.customer._id
                  : invoice.customer
                : prev.customer,
            supplier:
              invoice.type === 'purchase' && invoice.supplier
                ? typeof invoice.supplier === 'object'
                  ? invoice.supplier._id
                  : invoice.supplier
                : prev.supplier,
          }));
        } catch (error) {
          console.error('Error fetching invoice:', error);
        }
      };
      fetchInvoice();
    }

    // Load specific sale if provided
    if (initialSaleId) {
      const fetchSale = async () => {
        try {
          const response = await api.get(`/sales/${initialSaleId}`);
          const sale = response.data.data;
          setSelectedSale(sale);

          // Pre-populate form with sale data
          setFormData((prev) => ({
            ...prev,
            amount: sale.total,
            customer:
              typeof sale.customer === 'object'
                ? sale.customer._id
                : sale.customer,
          }));
        } catch (error) {
          console.error('Error fetching sale:', error);
        }
      };
      fetchSale();
    }

    // Load specific purchase order if provided
    if (initialPurchaseOrderId) {
      const fetchPurchaseOrder = async () => {
        try {
          const response = await api.get(
            `/purchase-orders/${initialPurchaseOrderId}`
          );
          const po = response.data.data;
          setSelectedPurchaseOrder(po);

          // Pre-populate form with purchase order data
          setFormData((prev) => ({
            ...prev,
            amount: po.total,
            supplier:
              typeof po.supplier === 'object' ? po.supplier._id : po.supplier,
          }));
        } catch (error) {
          console.error('Error fetching purchase order:', error);
        }
      };
      fetchPurchaseOrder();
    }

    // Load specific customer if provided
    if (initialCustomerId) {
      const fetchCustomer = async () => {
        try {
          console.log(`Fetching initial customer: ${initialCustomerId}`);
          const response = await api.get(`/customers/${initialCustomerId}`);
          setSelectedCustomer(response.data.data);

          // Set form data
          setFormData((prev) => ({
            ...prev,
            customer: initialCustomerId,
          }));

          // Fetch invoices and sales for this customer
          console.log(`Fetching invoices for customer ${initialCustomerId}`);
          const invoiceResponse = await api.get(`/invoices?type=sales&status=sent,partial,overdue&customer=${initialCustomerId}`);
          let customerInvoices = [];

          console.log('Customer invoice response:', invoiceResponse.data);

          if (invoiceResponse.data && invoiceResponse.data.data && Array.isArray(invoiceResponse.data.data)) {
            customerInvoices = invoiceResponse.data.data;
            console.log(`Found ${customerInvoices.length} invoices for customer (data.data format)`);
          } else if (invoiceResponse.data && Array.isArray(invoiceResponse.data)) {
            customerInvoices = invoiceResponse.data;
            console.log(`Found ${customerInvoices.length} invoices for customer (array format)`);
          } else if (invoiceResponse.data && typeof invoiceResponse.data === 'object') {
            // Handle case where API returns object with nested structure
            if (invoiceResponse.data.invoices && Array.isArray(invoiceResponse.data.invoices)) {
              customerInvoices = invoiceResponse.data.invoices;
              console.log(`Found ${customerInvoices.length} invoices for customer (invoices property)`);
            } else {
              console.log('Customer invoice response has unexpected format:', invoiceResponse.data);
              // Try to extract any array property from the response
              const arrayProps = Object.keys(invoiceResponse.data).filter(key =>
                Array.isArray(invoiceResponse.data[key])
              );

              if (arrayProps.length > 0) {
                customerInvoices = invoiceResponse.data[arrayProps[0]];
                console.log(`Found ${customerInvoices.length} invoices for customer (extracted from ${arrayProps[0]})`);
              }
            }
          }

          // Filter to only include unpaid or partially paid invoices
          const unpaidInvoices = customerInvoices.filter(invoice =>
            invoice.status !== 'paid' && invoice.balance > 0
          );

          console.log(`After filtering, ${unpaidInvoices.length} unpaid invoices remain`);
          setInvoices(unpaidInvoices);

          // Also fetch unpaid sales for this customer
          console.log(`Fetching sales for customer ${initialCustomerId}`);
          const salesResponse = await api.get(`/sales?customer=${initialCustomerId}&paymentStatus=unpaid,partial`);
          let customerSales = [];

          console.log('Sales response:', salesResponse.data);

          if (salesResponse.data && salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
            customerSales = salesResponse.data.data;
            console.log(`Found ${customerSales.length} sales for customer (data.data format)`);
          } else if (salesResponse.data && Array.isArray(salesResponse.data)) {
            customerSales = salesResponse.data;
            console.log(`Found ${customerSales.length} sales for customer (array format)`);
          } else if (salesResponse.data && salesResponse.data.sales && Array.isArray(salesResponse.data.sales)) {
            customerSales = salesResponse.data.sales;
            console.log(`Found ${customerSales.length} sales for customer (sales property)`);
          } else if (salesResponse.data && typeof salesResponse.data === 'object') {
            console.log('Sales response has unexpected format:', salesResponse.data);
            // Try to extract any array property from the response
            const arrayProps = Object.keys(salesResponse.data).filter(key =>
              Array.isArray(salesResponse.data[key])
            );

            if (arrayProps.length > 0) {
              customerSales = salesResponse.data[arrayProps[0]];
              console.log(`Found ${customerSales.length} sales for customer (extracted from ${arrayProps[0]})`);
            }
          }

          setSales(customerSales);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      };
      fetchCustomer();
    }

    // Load specific supplier if provided
    if (initialSupplierId) {
      const fetchSupplier = async () => {
        try {
          console.log(`Fetching initial supplier: ${initialSupplierId}`);
          const response = await api.get(`/suppliers/${initialSupplierId}`);
          setSelectedSupplier(response.data.data);

          // Set form data
          setFormData((prev) => ({
            ...prev,
            supplier: initialSupplierId,
          }));

          // Fetch invoices and purchases for this supplier
          console.log(`Fetching invoices for supplier ${initialSupplierId}`);
          const invoiceResponse = await api.get(`/invoices?type=purchase&status=sent,partial,overdue&supplier=${initialSupplierId}`);
          let supplierInvoices = [];

          console.log('Invoice response:', invoiceResponse.data);

          if (invoiceResponse.data && invoiceResponse.data.data && Array.isArray(invoiceResponse.data.data)) {
            supplierInvoices = invoiceResponse.data.data;
            console.log(`Found ${supplierInvoices.length} invoices for supplier (data.data format)`);
          } else if (invoiceResponse.data && Array.isArray(invoiceResponse.data)) {
            supplierInvoices = invoiceResponse.data;
            console.log(`Found ${supplierInvoices.length} invoices for supplier (array format)`);
          } else if (invoiceResponse.data && typeof invoiceResponse.data === 'object') {
            // Handle case where API returns object with nested structure
            if (invoiceResponse.data.invoices && Array.isArray(invoiceResponse.data.invoices)) {
              supplierInvoices = invoiceResponse.data.invoices;
              console.log(`Found ${supplierInvoices.length} invoices for supplier (invoices property)`);
            } else {
              console.log('Invoice response has unexpected format:', invoiceResponse.data);
              // Try to extract any array property from the response
              const arrayProps = Object.keys(invoiceResponse.data).filter(key =>
                Array.isArray(invoiceResponse.data[key])
              );

              if (arrayProps.length > 0) {
                supplierInvoices = invoiceResponse.data[arrayProps[0]];
                console.log(`Found ${supplierInvoices.length} invoices for supplier (extracted from ${arrayProps[0]})`);
              }
            }
          }

          // Filter to only include unpaid or partially paid invoices
          const unpaidInvoices = supplierInvoices.filter(invoice =>
            invoice.status !== 'paid' && invoice.balance > 0
          );

          console.log(`After filtering, ${unpaidInvoices.length} unpaid invoices remain`);
          setInvoices(unpaidInvoices);

          // Also fetch unpaid purchase orders for this supplier
          console.log(`Fetching purchase orders for supplier ${initialSupplierId}`);
          const poResponse = await api.get(`/purchase-orders?paymentStatus=unpaid,partial&supplier=${initialSupplierId}`);
          let supplierPOs = [];

          console.log('Purchase orders response:', poResponse.data);

          if (poResponse.data && poResponse.data.data && Array.isArray(poResponse.data.data)) {
            supplierPOs = poResponse.data.data;
            console.log(`Found ${supplierPOs.length} purchase orders for supplier (data.data format)`);
          } else if (poResponse.data && Array.isArray(poResponse.data)) {
            supplierPOs = poResponse.data;
            console.log(`Found ${supplierPOs.length} purchase orders for supplier (array format)`);
          } else if (poResponse.data && typeof poResponse.data === 'object') {
            // Handle case where API returns object with nested structure
            if (poResponse.data.purchaseOrders && Array.isArray(poResponse.data.purchaseOrders)) {
              supplierPOs = poResponse.data.purchaseOrders;
              console.log(`Found ${supplierPOs.length} purchase orders for supplier (purchaseOrders property)`);
            } else {
              console.log('Purchase orders response has unexpected format:', poResponse.data);
              // Try to extract any array property from the response
              const arrayProps = Object.keys(poResponse.data).filter(key =>
                Array.isArray(poResponse.data[key])
              );

              if (arrayProps.length > 0) {
                supplierPOs = poResponse.data[arrayProps[0]];
                console.log(`Found ${supplierPOs.length} purchase orders for supplier (extracted from ${arrayProps[0]})`);
              }
            }
          }

          // Also fetch unpaid purchases for this supplier
          console.log(`Fetching purchases for supplier ${initialSupplierId}`);
          const purchasesResponse = await api.get(`/purchases?supplier=${initialSupplierId}&paymentStatus=unpaid,partial`);
          let supplierPurchases = [];

          console.log('Purchases response:', purchasesResponse.data);

          if (purchasesResponse.data && purchasesResponse.data.data && Array.isArray(purchasesResponse.data.data)) {
            supplierPurchases = purchasesResponse.data.data;
            console.log(`Found ${supplierPurchases.length} purchases for supplier (data.data format)`);
          } else if (purchasesResponse.data && Array.isArray(purchasesResponse.data)) {
            supplierPurchases = purchasesResponse.data;
            console.log(`Found ${supplierPurchases.length} purchases for supplier (array format)`);
          } else if (purchasesResponse.data && purchasesResponse.data.purchases && Array.isArray(purchasesResponse.data.purchases)) {
            supplierPurchases = purchasesResponse.data.purchases;
            console.log(`Found ${supplierPurchases.length} purchases for supplier (purchases property)`);
          } else if (purchasesResponse.data && typeof purchasesResponse.data === 'object') {
            console.log('Purchases response has unexpected format:', purchasesResponse.data);
            // Try to extract any array property from the response
            const arrayProps = Object.keys(purchasesResponse.data).filter(key =>
              Array.isArray(purchasesResponse.data[key])
            );

            if (arrayProps.length > 0) {
              supplierPurchases = purchasesResponse.data[arrayProps[0]];
              console.log(`Found ${supplierPurchases.length} purchases for supplier (extracted from ${arrayProps[0]})`);
            }
          }

          // Add purchases to the purchase orders list since they're similar
          const formattedPurchases = supplierPurchases.map(purchase => ({
            ...purchase,
            _id: purchase._id,
            orderNumber: purchase.purchaseNumber, // Map to match PO structure
            total: purchase.total,
            isPurchase: true // Flag to identify as purchase vs PO
          }));

          // Combine purchase orders and purchases
          const combinedPOs = [...supplierPOs, ...formattedPurchases];
          console.log(`Combined ${combinedPOs.length} purchase orders/purchases`);
          setPurchaseOrders(combinedPOs);
        } catch (error) {
          console.error('Error fetching supplier:', error);
        }
      };
      fetchSupplier();
    }
  }, [
    initialInvoiceId,
    initialSaleId,
    initialPurchaseOrderId,
    initialCustomerId,
    initialSupplierId,
  ]);

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

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentDate: date,
    }));
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDirection = e.target.value as PaymentDirection;
    setFormData((prev) => ({
      ...prev,
      direction: newDirection,
      // Reset related fields when direction changes
      customer:
        newDirection === PaymentDirection.RECEIVED ? prev.customer : undefined,
      supplier:
        newDirection === PaymentDirection.MADE ? prev.supplier : undefined,
      invoice: undefined,
      sale: newDirection === PaymentDirection.RECEIVED ? prev.sale : undefined,
      purchaseOrder:
        newDirection === PaymentDirection.MADE ? prev.purchaseOrder : undefined,
    }));
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = e.target.value;

    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      invoice: invoiceId || undefined,
      sale: undefined,
      purchaseOrder: undefined,
    }));

    if (invoiceId) {
      const invoice = invoices.find((inv) => inv._id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);

        // Set the payment amount to the remaining balance
        const remainingBalance = invoice.balance || (invoice.total - (invoice.amountPaid || 0));

        setFormData((prev) => ({
          ...prev,
          amount: remainingBalance,
          customer:
            invoice.type === 'sales' && invoice.customer
              ? typeof invoice.customer === 'object'
                ? invoice.customer._id
                : invoice.customer
              : undefined,
          supplier:
            invoice.type === 'purchase' && invoice.supplier
              ? typeof invoice.supplier === 'object'
                ? invoice.supplier._id
                : invoice.supplier
              : undefined,
        }));
      }
    } else {
      setSelectedInvoice(null);
    }
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const saleId = e.target.value;

    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      sale: saleId || undefined,
      invoice: undefined,
      purchaseOrder: undefined,
    }));

    if (saleId) {
      const sale = sales.find((s) => s._id === saleId);
      if (sale) {
        setSelectedSale(sale);

        // Calculate remaining balance
        // If sale has amountPaid property, use it, otherwise assume it's the full amount
        const remainingBalance = sale.balance ||
          (sale.paymentStatus === 'partial' ?
            (sale.total - (sale.amountPaid || 0)) :
            sale.total);

        setFormData((prev) => ({
          ...prev,
          amount: remainingBalance,
          customer:
            typeof sale.customer === 'object'
              ? sale.customer._id
              : sale.customer,
        }));
      }
    } else {
      setSelectedSale(null);
    }
  };

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const poId = e.target.value;

    // Clear other related fields
    setFormData((prev) => ({
      ...prev,
      purchaseOrder: poId || undefined,
      invoice: undefined,
      sale: undefined,
    }));

    if (poId) {
      const po = purchaseOrders.find((p) => p._id === poId);
      if (po) {
        setSelectedPurchaseOrder(po);

        // Calculate remaining balance
        // If it's a purchase (not a PO), handle differently
        let remainingBalance;
        if (po.isPurchase) {
          // This is a purchase, not a purchase order
          remainingBalance = po.balance ||
            (po.paymentStatus === 'partial' ?
              (po.total - (po.amountPaid || 0)) :
              po.total);
        } else {
          // This is a purchase order
          remainingBalance = po.balance ||
            (po.paymentStatus === 'partial' ?
              (po.total - (po.amountPaid || 0)) :
              po.total);
        }

        setFormData((prev) => ({
          ...prev,
          amount: remainingBalance,
          supplier:
            typeof po.supplier === 'object' ? po.supplier._id : po.supplier,
        }));
      }
    } else {
      setSelectedPurchaseOrder(null);
    }
  };

  const handleCustomerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customer: customerId || undefined,
    }));

    // Clear previous data
    setInvoices([]);
    setSales([]);
    setSelectedCustomer(null);

    // Fetch unpaid/partially paid invoices for this customer
    if (customerId) {
      try {
        // Add delay to avoid rate limiting
        await delay(300);
        // First, fetch the customer details
        const customerResponse = await api.get(`/customers/${customerId}`);
        if (customerResponse.data && customerResponse.data.data) {
          setSelectedCustomer(customerResponse.data.data);
        }

        // Fetch sales invoices for this customer
        console.log(`Fetching invoices for customer ${customerId}`);
        await delay(300);
        const response = await api.get(`/invoices?type=sales&status=sent,partial,overdue&customer=${customerId}`);
        let customerInvoices = [];

        console.log('Customer invoice response:', response.data);

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          customerInvoices = response.data.data;
          console.log(`Found ${customerInvoices.length} invoices for customer (data.data format)`);
        } else if (response.data && Array.isArray(response.data)) {
          customerInvoices = response.data;
          console.log(`Found ${customerInvoices.length} invoices for customer (array format)`);
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where API returns object with nested structure
          if (response.data.invoices && Array.isArray(response.data.invoices)) {
            customerInvoices = response.data.invoices;
            console.log(`Found ${customerInvoices.length} invoices for customer (invoices property)`);
          } else {
            console.log('Customer invoice response has unexpected format:', response.data);
            // Try to extract any array property from the response
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              customerInvoices = response.data[arrayProps[0]];
              console.log(`Found ${customerInvoices.length} invoices for customer (extracted from ${arrayProps[0]})`);
            }
          }
        }

        // Filter to only include unpaid or partially paid invoices
        const unpaidInvoices = customerInvoices.filter(invoice =>
          invoice.status !== 'paid' && invoice.balance > 0
        );

        console.log(`After filtering, ${unpaidInvoices.length} unpaid invoices remain`);
        setInvoices(unpaidInvoices);

        // Also fetch unpaid sales for this customer
        console.log(`Fetching sales for customer ${customerId}`);
        await delay(300);
        const salesResponse = await api.get(`/sales?customer=${customerId}&paymentStatus=unpaid,partial`);
        let customerSales = [];

        console.log('Sales response:', salesResponse.data);

        if (salesResponse.data && salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
          customerSales = salesResponse.data.data;
          console.log(`Found ${customerSales.length} sales for customer (data.data format)`);
        } else if (salesResponse.data && Array.isArray(salesResponse.data)) {
          customerSales = salesResponse.data;
          console.log(`Found ${customerSales.length} sales for customer (array format)`);
        } else if (salesResponse.data && salesResponse.data.sales && Array.isArray(salesResponse.data.sales)) {
          customerSales = salesResponse.data.sales;
          console.log(`Found ${customerSales.length} sales for customer (sales property)`);
        } else if (salesResponse.data && typeof salesResponse.data === 'object') {
          console.log('Sales response has unexpected format:', salesResponse.data);
          // Try to extract any array property from the response
          const arrayProps = Object.keys(salesResponse.data).filter(key =>
            Array.isArray(salesResponse.data[key])
          );

          if (arrayProps.length > 0) {
            customerSales = salesResponse.data[arrayProps[0]];
            console.log(`Found ${customerSales.length} sales for customer (extracted from ${arrayProps[0]})`);
          }
        }

        setSales(customerSales);
      } catch (error) {
        console.error('Error fetching customer invoices:', error);
      }
    }
  };

  const handleSupplierChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      supplier: supplierId || undefined,
    }));

    // Clear previous data
    setInvoices([]);
    setPurchaseOrders([]);
    setSelectedSupplier(null);

    // Fetch unpaid/partially paid invoices for this supplier
    if (supplierId) {
      try {
        // Add delay to avoid rate limiting
        await delay(300);
        // First, fetch the supplier details
        const supplierResponse = await api.get(`/suppliers/${supplierId}`);
        if (supplierResponse.data && supplierResponse.data.data) {
          setSelectedSupplier(supplierResponse.data.data);
        }

        // Fetch purchase invoices for this supplier
        console.log(`Fetching invoices for supplier ${supplierId}`);
        await delay(300);
        const response = await api.get(`/invoices?type=purchase&status=sent,partial,overdue&supplier=${supplierId}`);
        let supplierInvoices = [];

        console.log('Invoice response:', response.data);

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          supplierInvoices = response.data.data;
          console.log(`Found ${supplierInvoices.length} invoices for supplier (data.data format)`);
        } else if (response.data && Array.isArray(response.data)) {
          supplierInvoices = response.data;
          console.log(`Found ${supplierInvoices.length} invoices for supplier (array format)`);
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where API returns object with nested structure
          if (response.data.invoices && Array.isArray(response.data.invoices)) {
            supplierInvoices = response.data.invoices;
            console.log(`Found ${supplierInvoices.length} invoices for supplier (invoices property)`);
          } else {
            console.log('Invoice response has unexpected format:', response.data);
            // Try to extract any array property from the response
            const arrayProps = Object.keys(response.data).filter(key =>
              Array.isArray(response.data[key])
            );

            if (arrayProps.length > 0) {
              supplierInvoices = response.data[arrayProps[0]];
              console.log(`Found ${supplierInvoices.length} invoices for supplier (extracted from ${arrayProps[0]})`);
            }
          }
        }

        // Filter to only include unpaid or partially paid invoices
        const unpaidInvoices = supplierInvoices.filter(invoice =>
          invoice.status !== 'paid' && invoice.balance > 0
        );

        console.log(`After filtering, ${unpaidInvoices.length} unpaid invoices remain`);
        setInvoices(unpaidInvoices);

        // Also fetch unpaid purchase orders for this supplier
        console.log(`Fetching purchase orders for supplier ${supplierId}`);
        await delay(300);
        const poResponse = await api.get(`/purchase-orders?paymentStatus=unpaid,partial&supplier=${supplierId}`);
        let supplierPOs = [];

        console.log('Purchase orders response:', poResponse.data);

        if (poResponse.data && poResponse.data.data && Array.isArray(poResponse.data.data)) {
          supplierPOs = poResponse.data.data;
          console.log(`Found ${supplierPOs.length} purchase orders for supplier (data.data format)`);
        } else if (poResponse.data && Array.isArray(poResponse.data)) {
          supplierPOs = poResponse.data;
          console.log(`Found ${supplierPOs.length} purchase orders for supplier (array format)`);
        } else if (poResponse.data && typeof poResponse.data === 'object') {
          // Handle case where API returns object with nested structure
          if (poResponse.data.purchaseOrders && Array.isArray(poResponse.data.purchaseOrders)) {
            supplierPOs = poResponse.data.purchaseOrders;
            console.log(`Found ${supplierPOs.length} purchase orders for supplier (purchaseOrders property)`);
          } else {
            console.log('Purchase orders response has unexpected format:', poResponse.data);
            // Try to extract any array property from the response
            const arrayProps = Object.keys(poResponse.data).filter(key =>
              Array.isArray(poResponse.data[key])
            );

            if (arrayProps.length > 0) {
              supplierPOs = poResponse.data[arrayProps[0]];
              console.log(`Found ${supplierPOs.length} purchase orders for supplier (extracted from ${arrayProps[0]})`);
            }
          }
        }

        // Also fetch unpaid purchases for this supplier
        console.log(`Fetching purchases for supplier ${supplierId}`);
        await delay(300);
        const purchasesResponse = await api.get(`/purchases?supplier=${supplierId}&paymentStatus=unpaid,partial`);
        let supplierPurchases = [];

        console.log('Purchases response:', purchasesResponse.data);

        if (purchasesResponse.data && purchasesResponse.data.data && Array.isArray(purchasesResponse.data.data)) {
          supplierPurchases = purchasesResponse.data.data;
          console.log(`Found ${supplierPurchases.length} purchases for supplier (data.data format)`);
        } else if (purchasesResponse.data && Array.isArray(purchasesResponse.data)) {
          supplierPurchases = purchasesResponse.data;
          console.log(`Found ${supplierPurchases.length} purchases for supplier (array format)`);
        } else if (purchasesResponse.data && purchasesResponse.data.purchases && Array.isArray(purchasesResponse.data.purchases)) {
          supplierPurchases = purchasesResponse.data.purchases;
          console.log(`Found ${supplierPurchases.length} purchases for supplier (purchases property)`);
        } else if (purchasesResponse.data && typeof purchasesResponse.data === 'object') {
          console.log('Purchases response has unexpected format:', purchasesResponse.data);
          // Try to extract any array property from the response
          const arrayProps = Object.keys(purchasesResponse.data).filter(key =>
            Array.isArray(purchasesResponse.data[key])
          );

          if (arrayProps.length > 0) {
            supplierPurchases = purchasesResponse.data[arrayProps[0]];
            console.log(`Found ${supplierPurchases.length} purchases for supplier (extracted from ${arrayProps[0]})`);
          }
        }

        // Add purchases to the purchase orders list since they're similar
        const formattedPurchases = supplierPurchases.map(purchase => ({
          ...purchase,
          _id: purchase._id,
          orderNumber: purchase.purchaseNumber, // Map to match PO structure
          total: purchase.total,
          isPurchase: true // Flag to identify as purchase vs PO
        }));

        // Combine purchase orders and purchases
        const combinedPOs = [...supplierPOs, ...formattedPurchases];
        console.log(`Combined ${combinedPOs.length} purchase orders/purchases`);
        setPurchaseOrders(combinedPOs);
      } catch (error) {
        console.error('Error fetching supplier invoices:', error);
      }
    }
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      alert('Amount must be greater than zero');
      return false;
    }

    if (formData.direction === PaymentDirection.RECEIVED) {
      if (!formData.customer && !formData.sale && !formData.invoice) {
        alert('Please select a customer, sale, or invoice');
        return false;
      }
    } else {
      if (!formData.supplier && !formData.purchaseOrder && !formData.invoice) {
        alert('Please select a supplier, purchase order, or invoice');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert amount to number before submitting
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount as string)
      };

      console.log('Submitting payment with data:', paymentData);

      const resultAction = await dispatch(createPayment(paymentData) as any);
      if (createPayment.fulfilled.match(resultAction)) {
        showToast('Payment created successfully', 'success');

        // Redirect based on payment direction
        if (formData.direction === PaymentDirection.RECEIVED) {
          // If it's a payment received, redirect to sales page
          navigate('/sales');
        } else {
          // If it's a payment made, redirect to purchases page
          navigate('/purchases');
        }
      }
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      let errorMessage = 'Failed to create payment';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {formData.direction === PaymentDirection.RECEIVED
            ? 'Receive Payment'
            : 'Make Payment'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/payments')}>
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
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              <div className="space-y-4">
                <Select
                  label="Payment Direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleDirectionChange}
                  disabled={
                    !!initialInvoiceId ||
                    !!initialSaleId ||
                    !!initialPurchaseOrderId
                  }
                >
                  <option value={PaymentDirection.RECEIVED}>
                    Receive Payment
                  </option>
                  <option value={PaymentDirection.MADE}>Make Payment</option>
                </Select>

                <Input
                  type="number"
                  label="Amount (₦)"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                />

                <DatePicker
                  label="Payment Date"
                  value={formData.paymentDate || ''}
                  onChange={handleDateChange}
                  required
                />

                <Select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.CARD}>Card</option>
                  <option value={PaymentMethod.TRANSFER}>Transfer</option>
                  <option value={PaymentMethod.CHEQUE}>Cheque</option>
                  <option value={PaymentMethod.MOBILE_MONEY}>
                    Mobile Money
                  </option>
                  <option value={PaymentMethod.CREDIT}>Credit</option>
                </Select>

                <Input
                  label="Reference"
                  name="reference"
                  value={formData.reference || ''}
                  onChange={handleInputChange}
                  placeholder="Transaction ID, Cheque Number, etc."
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
              <h2 className="text-lg font-medium mb-4">Related To</h2>
              <div className="space-y-4">
                {formData.direction === PaymentDirection.RECEIVED && (
                  <>
                    <Select
                      label="Customer"
                      name="customer"
                      value={formData.customer || ''}
                      onChange={handleCustomerChange}
                      disabled={!!initialInvoiceId || !!initialSaleId}
                    >
                      <option value="">Select Customer</option>
                      {Array.isArray(customers) && customers.length > 0 ? (
                        customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.firstName} {customer.lastName} (
                            {customer.customerNumber})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No customers available
                        </option>
                      )}
                    </Select>

                    <Select
                      label="Invoice"
                      value={formData.invoice || ''}
                      onChange={handleInvoiceChange}
                      disabled={
                        !!initialInvoiceId ||
                        !!initialSaleId ||
                        !!initialPurchaseOrderId
                      }
                    >
                      <option value="">Select Invoice</option>
                      {Array.isArray(invoices) && invoices.length > 0 ? (
                        invoices
                          .filter((inv) => inv.type === 'sales')
                          .map((invoice) => (
                            <option key={invoice._id} value={invoice._id}>
                              {invoice.invoiceNumber} - {invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'} -
                              Balance: {formatCurrency(invoice.balance)}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>
                          No invoices available
                        </option>
                      )}
                    </Select>

                    <Select
                      label="Sale"
                      value={formData.sale || ''}
                      onChange={handleSaleChange}
                      disabled={
                        !!initialInvoiceId ||
                        !!initialSaleId ||
                        !!initialPurchaseOrderId
                      }
                    >
                      <option value="">Select Sale</option>
                      {Array.isArray(sales) && sales.length > 0 ? (
                        sales.map((sale) => (
                          <option key={sale._id} value={sale._id}>
                            {sale.saleNumber} - {sale.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'} -
                            Total: {formatCurrency(sale.total)}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No sales available
                        </option>
                      )}
                    </Select>
                  </>
                )}

                {formData.direction === PaymentDirection.MADE && (
                  <>
                    <Select
                      label="Supplier"
                      name="supplier"
                      value={formData.supplier || ''}
                      onChange={handleSupplierChange}
                      disabled={!!initialInvoiceId || !!initialPurchaseOrderId}
                    >
                      <option value="">Select Supplier</option>
                      {Array.isArray(suppliers) && suppliers.length > 0 ? (
                        suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name} ({supplier.supplierCode})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No suppliers available
                        </option>
                      )}
                    </Select>

                    <Select
                      label="Invoice"
                      value={formData.invoice || ''}
                      onChange={handleInvoiceChange}
                      disabled={
                        !!initialInvoiceId ||
                        !!initialSaleId ||
                        !!initialPurchaseOrderId
                      }
                    >
                      <option value="">Select Invoice</option>
                      {Array.isArray(invoices) && invoices.length > 0 ? (
                        invoices
                          .filter((inv) => inv.type === 'purchase')
                          .map((invoice) => (
                            <option key={invoice._id} value={invoice._id}>
                              {invoice.invoiceNumber} - {invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'} -
                              Balance: {formatCurrency(invoice.balance)}
                            </option>
                          ))
                      ) : (
                        <option value="" disabled>
                          No invoices available
                        </option>
                      )}
                    </Select>

                    <Select
                      label="Purchase Order/Purchase"
                      value={formData.purchaseOrder || ''}
                      onChange={handlePurchaseOrderChange}
                      disabled={
                        !!initialInvoiceId ||
                        !!initialSaleId ||
                        !!initialPurchaseOrderId
                      }
                    >
                      <option value="">Select Purchase Order/Purchase</option>
                      {Array.isArray(purchaseOrders) &&
                      purchaseOrders.length > 0 ? (
                        purchaseOrders.map((po) => (
                          <option key={po._id} value={po._id}>
                            {po.orderNumber || po.purchaseNumber} -
                            {po.paymentStatus === 'partial' ? 'Partially Paid' : 'Unpaid'} -
                            {po.isPurchase ? 'Purchase' : 'Purchase Order'} -
                            Total: {formatCurrency(po.total)}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No purchase orders/purchases available
                        </option>
                      )}
                    </Select>
                  </>
                )}

                {selectedInvoice && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">
                      Selected Invoice Details
                    </h3>
                    <p>
                      <span className="font-medium">Invoice Number:</span>{' '}
                      {selectedInvoice.invoiceNumber}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(
                        selectedInvoice.invoiceDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span>{' '}
                      {formatCurrency(selectedInvoice.total)}
                    </p>
                    <p>
                      <span className="font-medium">Balance:</span>{' '}
                      {formatCurrency(selectedInvoice.balance)}
                    </p>
                  </div>
                )}

                {selectedSale && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">
                      Selected Sale Details
                    </h3>
                    <p>
                      <span className="font-medium">Sale Number:</span>{' '}
                      {selectedSale.saleNumber}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(selectedSale.saleDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span>{' '}
                      {formatCurrency(selectedSale.total)}
                    </p>
                  </div>
                )}

                {selectedPurchaseOrder && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-md font-medium mb-2">
                      Selected Purchase Order Details
                    </h3>
                    <p>
                      <span className="font-medium">PO Number:</span>{' '}
                      {selectedPurchaseOrder.orderNumber}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(
                        selectedPurchaseOrder.orderDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span>{' '}
                      {formatCurrency(selectedPurchaseOrder.total)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/payments')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : formData.direction === PaymentDirection.RECEIVED
              ? 'Receive Payment'
              : 'Make Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePayment;
