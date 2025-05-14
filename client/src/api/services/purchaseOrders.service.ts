import axiosInstance from '../axios.config';
import {
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseOrderReceiveData,
  PurchaseOrderStatus,
} from '@/types/purchaseOrder.types';

const purchaseOrderService = {
  getAllPurchaseOrders: async (
    page = 1,
    limit = 10,
    supplier = '',
    status = '',
    paymentStatus = '',
    search = '',
    startDate = '',
    endDate = ''
  ): Promise<{
    data: PurchaseOrder[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/purchase-orders?page=${page}&limit=${limit}`;
    
    if (supplier) {
      url += `&supplier=${supplier}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (paymentStatus) {
      url += `&paymentStatus=${paymentStatus}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.get(`/purchase-orders/${id}`);
    return response.data.data;
  },

  createPurchaseOrder: async (purchaseOrderData: PurchaseOrderFormData): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post('/purchase-orders', purchaseOrderData);
    return response.data.data;
  },

  updatePurchaseOrder: async (
    id: string,
    updateData: {
      expectedDeliveryDate?: string;
      status?: PurchaseOrderStatus;
      discount?: number;
      tax?: number;
      shippingCost?: number;
      paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
      paymentStatus?: 'unpaid' | 'partial' | 'paid';
      notes?: string;
    }
  ): Promise<PurchaseOrder> => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}`, updateData);
    return response.data.data;
  },

  addPurchaseOrderItem: async (
    purchaseOrderId: string,
    itemData: {
      medication: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }
  ): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post(
      `/purchase-orders/${purchaseOrderId}/items`,
      itemData
    );
    return response.data.data;
  },

  updatePurchaseOrderItem: async (
    purchaseOrderId: string,
    itemId: string,
    updateData: {
      quantity?: number;
      unitPrice?: number;
      notes?: string;
    }
  ): Promise<PurchaseOrder> => {
    const response = await axiosInstance.patch(
      `/purchase-orders/${purchaseOrderId}/items/${itemId}`,
      updateData
    );
    return response.data.data;
  },

  removePurchaseOrderItem: async (
    purchaseOrderId: string,
    itemId: string
  ): Promise<PurchaseOrder> => {
    const response = await axiosInstance.delete(
      `/purchase-orders/${purchaseOrderId}/items/${itemId}`
    );
    return response.data.data;
  },

  approvePurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/approve`, {});
    return response.data.data;
  },

  markAsOrdered: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/order`, {});
    return response.data.data;
  },

  receivePurchaseOrder: async (
    id: string,
    receiveData: PurchaseOrderReceiveData
  ): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post(`/purchase-orders/${id}/receive`, receiveData);
    return response.data.data;
  },

  cancelPurchaseOrder: async (id: string, reason: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/cancel`, { reason });
    return response.data.data;
  },
};

export default purchaseOrderService;
