import { Document, Types } from 'mongoose';

export enum PosSessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface IPosSession extends Document {
  sessionNumber: string;
  openedBy: Types.ObjectId;
  closedBy?: Types.ObjectId;
  openingTime: Date;
  closingTime?: Date;
  status: PosSessionStatus;
  location: Types.ObjectId;
  register: string;
  openingBalance: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number;
  cashVariance?: number;
  notes?: string;
  transactions: Types.ObjectId[]; // Reference to sales made during this session
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export interface IPosSessionCreate {
  openingBalance: number;
  location: string;
  register: string;
  notes?: string;
}

export interface IPosSessionClose {
  actualClosingBalance: number;
  notes?: string;
}
