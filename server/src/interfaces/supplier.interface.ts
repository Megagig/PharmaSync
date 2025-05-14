import { Document } from 'mongoose';

export interface ISupplierAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: ISupplierAddress;
  taxId?: string;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  isActive: boolean;
  preferredSupplier: boolean;
  supplierCode: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierCreate {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: ISupplierAddress;
  taxId?: string;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  preferredSupplier?: boolean;
  supplierCode?: string;
  categories?: string[];
}

export interface ISupplierUpdate {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Partial<ISupplierAddress>;
  taxId?: string;
  paymentTerms?: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  isActive?: boolean;
  preferredSupplier?: boolean;
  categories?: string[];
}

export interface ISupplierResponse {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: ISupplierAddress;
  taxId?: string;
  paymentTerms: 'prepaid' | 'net15' | 'net30' | 'net60' | 'cod';
  notes?: string;
  isActive: boolean;
  preferredSupplier: boolean;
  supplierCode: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}
