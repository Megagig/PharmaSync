import api from './api';
import { Sale, SaleFormData, SaleUpdateData, SaleReceiptData } from '../types/sale.types';

const saleService = {
  getAllSales: async (
    page = 1,
    limit = 10,
    customer = '',
    status = '',
    paymentStatus = '',
    location = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Sale[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    // Make sure we're using the correct API endpoint
    let url = `/sales?page=${page}&limit=${limit}`;

    if (customer) {
      url += `&customer=${customer}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }

    if (location) {
      url += `&location=${location}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  getSaleById: async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`);
    return response.data.data;
  },

  createSale: async (saleData: SaleFormData): Promise<Sale> => {
    try {
      // Generate a temporary sale number (the server should replace this)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const tempSaleNumber = `SALE-${dateStr}-${randomStr}`;

      // Create a new object with only the fields expected by the server
      // Explicitly include only the fields that the server expects
      const serverData = {
        customer: saleData.customer,
        saleDate: saleData.saleDate || new Date().toISOString(),
        location: saleData.location,
        paymentMethod: saleData.paymentMethod || 'cash',
        discount: saleData.discount || 0,
        tax: saleData.tax || 0,
        notes: saleData.notes || '',
        // Add required fields
        saleNumber: tempSaleNumber, // Add a temporary sale number
        totalDiscount: saleData.discount || 0,
        items: saleData.items.map(item => {
          // Calculate subtotal and finalPrice
          const itemDiscount = item.discount || 0;
          const itemSubtotal = item.quantity * item.unitPrice;
          const itemFinalPrice = itemSubtotal - itemDiscount;

          // Return only the fields expected by the server
          return {
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: itemDiscount,
            subtotal: itemSubtotal,
            finalPrice: itemFinalPrice, // Ensure this is set
            batchNumber: item.batchNumber || '',
            expiryDate: item.expiryDate || null,
            notes: item.notes || ''
          };
        })
      };

      // Calculate overall subtotal
      const subtotal = serverData.items.reduce((sum, item) => sum + item.subtotal, 0);
      serverData.subtotal = subtotal;

      // Calculate total
      const total = subtotal - (serverData.discount || 0) + (serverData.tax || 0);
      serverData.total = total;

      // Add createdBy field if available from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user.id) {
        serverData.createdBy = user.id;
      }

      // Double-check that all items have finalPrice set
      const itemsWithoutFinalPrice = serverData.items.filter(item => item.finalPrice === undefined);
      if (itemsWithoutFinalPrice.length > 0) {
        console.error('Items missing finalPrice:', itemsWithoutFinalPrice);
        throw new Error('Some items are missing final price');
      }

      // Add status and paymentStatus fields
      serverData.status = 'completed'; // Default status
      serverData.paymentStatus = 'paid'; // Default payment status

      // Add receiptGenerated field
      serverData.receiptGenerated = false;

      console.log('Creating sale with server data:', JSON.stringify(serverData, null, 2));
      const response = await api.post('/sales', serverData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating sale:', error);

      // Log the error response for debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);

        // Check for validation errors in the response
        if (error.response.data && error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
        }

        // Check for stack trace in the response
        if (error.response.data && error.response.data.stack) {
          console.error('Server stack trace:', error.response.data.stack);

          // Try to extract validation errors from the stack trace
          const validationMatch = error.response.data.stack.match(/Sale validation failed: ([^\n]+)/);
          if (validationMatch && validationMatch[1]) {
            console.error('Extracted validation errors from stack:', validationMatch[1]);
          }
        }
      }

      throw error;
    }
  },

  updateSale: async (id: string, updateData: SaleUpdateData): Promise<Sale> => {
    const response = await api.patch(`/sales/${id}`, updateData);
    return response.data.data;
  },

  generateReceipt: async (id: string): Promise<SaleReceiptData> => {
    const response = await api.post(`/sales/${id}/receipt`);
    return response.data.data;
  },
};

export default saleService;
