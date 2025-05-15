import { Document, Types } from 'mongoose';

export interface IPriceLevel extends Document {
  name: string;
  code: string;
  description?: string;
  markupPercentage?: number;
  markdownPercentage?: number;
  isDefault: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPriceLevelCreate {
  name: string;
  code?: string;
  description?: string;
  markupPercentage?: number;
  markdownPercentage?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IPriceLevelUpdate {
  name?: string;
  code?: string;
  description?: string;
  markupPercentage?: number;
  markdownPercentage?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IPriceLevelResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  markupPercentage?: number;
  markdownPercentage?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
