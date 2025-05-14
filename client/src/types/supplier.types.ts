export interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: SupplierAddress;
  taxId?: string;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  isActive: boolean;
  preferredSupplier: boolean;
  supplierCode: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: SupplierAddress;
  taxId?: string;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  preferredSupplier?: boolean;
  supplierCode?: string;
  categories?: string[];
}

export interface SuppliersState {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  isLoading: boolean;
  error: string | null;
  totalSuppliers: number;
  totalPages: number;
  currentPage: number;
}
