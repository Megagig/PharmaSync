import { Document, Types } from 'mongoose';

export enum LocationType {
  MAIN_STORE = 'main_store',
  DISPENSING_AREA = 'dispensing_area',
  REFRIGERATED = 'refrigerated',
  CONTROLLED_SUBSTANCES = 'controlled_substances',
  BRANCH = 'branch',
  WAREHOUSE = 'warehouse',
  OTHER = 'other',
}

export interface ILocationAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ILocation extends Document {
  name: string;
  code: string;
  type: LocationType;
  address?: ILocationAddress;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  parentLocation?: Types.ObjectId; // For hierarchical locations
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface ILocationCreate {
  name: string;
  code?: string;
  type: LocationType;
  address?: ILocationAddress;
  phone?: string;
  email?: string;
  manager?: string;
  isActive?: boolean;
  isDefault?: boolean;
  notes?: string;
  parentLocation?: string;
}

export interface ILocationUpdate {
  name?: string;
  code?: string;
  type?: LocationType;
  address?: ILocationAddress;
  phone?: string;
  email?: string;
  manager?: string;
  isActive?: boolean;
  isDefault?: boolean;
  notes?: string;
  parentLocation?: string;
}

export interface ILocationResponse {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  address?: ILocationAddress;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  parentLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}
