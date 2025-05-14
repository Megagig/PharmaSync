import axiosInstance from '../axios.config';
import {
  LowStockAlert,
  ExpiringStockAlert,
  InventoryValuation,
  InventoryMovement,
  InventoryAdjustmentData,
  InventoryAdjustmentResult,
} from '@/types/inventory.types';

const inventoryService = {
  getLowStockAlerts: async (threshold = 10): Promise<LowStockAlert[]> => {
    const response = await axiosInstance.get(`/inventory/low-stock?threshold=${threshold}`);
    return response.data.data;
  },

  getExpiringStockAlerts: async (days = 90): Promise<ExpiringStockAlert[]> => {
    const response = await axiosInstance.get(`/inventory/expiring?days=${days}`);
    return response.data.data;
  },

  getInventoryValuation: async (): Promise<InventoryValuation> => {
    const response = await axiosInstance.get('/inventory/valuation');
    return response.data.data;
  },

  getInventoryMovement: async (
    medicationId = '',
    startDate = '',
    endDate = ''
  ): Promise<InventoryMovement[]> => {
    let url = '/inventory/movement';
    const params = [];
    
    if (medicationId) {
      params.push(`medicationId=${medicationId}`);
    }
    
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  adjustInventory: async (
    adjustmentData: InventoryAdjustmentData
  ): Promise<InventoryAdjustmentResult> => {
    const response = await axiosInstance.post('/inventory/adjust', adjustmentData);
    return response.data.data;
  },
};

export default inventoryService;
