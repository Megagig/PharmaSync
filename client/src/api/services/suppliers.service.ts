import axiosInstance from '../axios.config';
import { Supplier, SupplierFormData } from '@/types/supplier.types';

const supplierService = {
  getAllSuppliers: async (
    page = 1,
    limit = 10,
    isActive = '',
    preferredSupplier = '',
    search = '',
    category = ''
  ): Promise<{
    data: Supplier[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/suppliers?page=${page}&limit=${limit}`;
    
    if (isActive !== '') {
      url += `&isActive=${isActive}`;
    }
    
    if (preferredSupplier !== '') {
      url += `&preferredSupplier=${preferredSupplier}`;
    }
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (category) {
      url += `&category=${category}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await axiosInstance.get(`/suppliers/${id}`);
    return response.data.data;
  },

  createSupplier: async (supplierData: SupplierFormData): Promise<Supplier> => {
    const response = await axiosInstance.post('/suppliers', supplierData);
    return response.data.data;
  },

  updateSupplier: async (id: string, updateData: Partial<SupplierFormData>): Promise<Supplier> => {
    const response = await axiosInstance.patch(`/suppliers/${id}`, updateData);
    return response.data.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/suppliers/${id}`);
  },
};

export default supplierService;
