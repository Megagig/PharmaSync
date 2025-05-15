import axiosInstance from '../axios.config';
import {
  Customer,
  CustomerFormData,
  CustomerUpdateData,
} from '@/types/customer.types';

const customerService = {
  getAllCustomers: async (
    page = 1,
    limit = 10,
    isActive?: boolean,
    type?: string,
    search?: string
  ): Promise<{
    data: Customer[];
    meta: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> => {
    let url = `/customers?page=${page}&limit=${limit}`;

    if (isActive !== undefined) {
      url += `&isActive=${isActive}`;
    }

    if (type) {
      url += `&type=${type}`;
    }

    if (search) {
      url += `&search=${search}`;
    }

    const response = await axiosInstance.get(url);
    return response.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (customerData: CustomerFormData): Promise<Customer> => {
    const response = await axiosInstance.post('/customers', customerData);
    return response.data.data;
  },

  updateCustomer: async (
    id: string,
    customerData: CustomerUpdateData
  ): Promise<Customer> => {
    const response = await axiosInstance.patch(
      `/customers/${id}`,
      customerData
    );
    return response.data.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/customers/${id}`);
  },

  addCustomerAddress: async (
    customerId: string,
    addressData: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault?: boolean;
    }
  ): Promise<Customer> => {
    const response = await axiosInstance.post(
      `/customers/${customerId}/addresses`,
      addressData
    );
    return response.data.data;
  },

  updateCustomerAddress: async (
    customerId: string,
    addressId: string,
    addressData: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    }
  ): Promise<Customer> => {
    const response = await axiosInstance.patch(
      `/customers/${customerId}/addresses/${addressId}`,
      addressData
    );
    return response.data.data;
  },

  removeCustomerAddress: async (
    customerId: string,
    addressId: string
  ): Promise<Customer> => {
    const response = await axiosInstance.delete(
      `/customers/${customerId}/addresses/${addressId}`
    );
    return response.data.data;
  },
};

export default customerService;
