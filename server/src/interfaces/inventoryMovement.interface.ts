import { Document, Types } from 'mongoose';

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  EXPIRY = 'expiry',
  DAMAGE = 'damage',
  THEFT = 'theft',
  OTHER = 'other',
}

export interface IMovementItem {
  product: Types.ObjectId;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  sellingPrice?: number;
  expiryDate?: Date;
  notes?: string;
  _id?: Types.ObjectId;
}

export interface IInventoryMovement extends Document {
  referenceNumber: string;
  type: MovementType;
  date: Date;
  sourceLocation: Types.ObjectId;
  destinationLocation?: Types.ObjectId;
  items: IMovementItem[];
  notes?: string;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IInventoryMovementCreate {
  referenceNumber?: string;
  type: MovementType;
  date?: Date;
  sourceLocation: string;
  destinationLocation?: string;
  items: {
    product: string;
    batchNumber: string;
    quantity: number;
    costPrice: number;
    sellingPrice?: number;
    expiryDate?: Date;
    notes?: string;
  }[];
  notes?: string;
}

export interface IInventoryMovementUpdate {
  type?: MovementType;
  date?: Date;
  sourceLocation?: string;
  destinationLocation?: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface IInventoryMovementResponse {
  id: string;
  referenceNumber: string;
  type: MovementType;
  date: Date;
  sourceLocation: string;
  sourceLocationName: string;
  destinationLocation?: string;
  destinationLocationName?: string;
  items: {
    id: string;
    product: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    costPrice: number;
    sellingPrice?: number;
    expiryDate?: Date;
    notes?: string;
  }[];
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
