import api from './api';
import { Invoice, InvoiceFormData, InvoiceUpdateData } from '../types/invoice.types';

const invoiceService = {
  getAllInvoices: async (
    page = 1,
    limit = 10,
    type = '',
    status = '',
    customer = '',
    supplier = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: Invoice[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/invoices?page=${page}&limit=${limit}`;

    if (type) {
      url += `&type=${type}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    if (customer) {
      url += `&customer=${customer}`;
    }

    if (supplier) {
      url += `&supplier=${supplier}`;
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

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },

  createInvoice: async (invoiceData: InvoiceFormData): Promise<Invoice> => {
    try {
      // Add a dummy invoiceNumber that will be replaced by the server's pre-save hook
      const dataToSend = {
        ...invoiceData,
        invoiceNumber: 'TEMP-INVOICE', // This will be replaced by the server's pre-save hook
        // Calculate subtotal for each item
        items: invoiceData.items.map(item => ({
          ...item,
          subtotal: (item.quantity * item.unitPrice) - (item.discount || 0)
        }))
      };

      const response = await api.post('/invoices', dataToSend);
      return response.data.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  updateInvoice: async (id: string, updateData: InvoiceUpdateData): Promise<Invoice> => {
    const response = await api.patch(`/invoices/${id}`, updateData);
    return response.data.data;
  },
};

export default invoiceService;
