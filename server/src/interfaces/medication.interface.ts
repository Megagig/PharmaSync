import { Document } from 'mongoose';

export enum MedicationType {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  LIQUID = 'liquid',
  INJECTION = 'injection',
  TOPICAL = 'topical',
  INHALER = 'inhaler',
  DROPS = 'drops',
  SUPPOSITORY = 'suppository',
  PATCH = 'patch',
  OTHER = 'other',
}

export enum MedicationCategory {
  ANALGESIC = 'analgesic',
  ANTIBIOTIC = 'antibiotic',
  ANTIHISTAMINE = 'antihistamine',
  ANTIHYPERTENSIVE = 'antihypertensive',
  ANTIDIABETIC = 'antidiabetic',
  ANTIDEPRESSANT = 'antidepressant',
  ANTIPSYCHOTIC = 'antipsychotic',
  ANTICONVULSANT = 'anticonvulsant',
  ANTIVIRAL = 'antiviral',
  ANTIMALARIAL = 'antimalarial',
  NSAID = 'nsaid',
  STEROID = 'steroid',
  VITAMIN = 'vitamin',
  SUPPLEMENT = 'supplement',
  OTHER = 'other',
}

export interface IDosage {
  amount: number;
  unit: string;
  frequency: string;
  route: string;
  instructions?: string;
}

export interface ISideEffect {
  effect: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: 'rare' | 'uncommon' | 'common' | 'very_common';
}

export interface IInteraction {
  interactsWith: string; // Medication name or category
  effect: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
}

export interface IInventoryItem {
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  purchaseDate: Date;
}

export interface IMedication extends Document {
  name: string;
  genericName: string;
  brandName?: string;
  description?: string;
  type: MedicationType;
  category: MedicationCategory;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  nafdacNumber?: string;
  requiresPrescription: boolean;
  standardDosage: IDosage;
  sideEffects: ISideEffect[];
  interactions: IInteraction[];
  contraindications: string[];
  storageConditions?: string;
  inventory: IInventoryItem[];
  minimumStockLevel: number;
  createdBy: string; // Reference to user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicationCreate {
  name: string;
  genericName: string;
  brandName?: string;
  description?: string;
  type: MedicationType;
  category: MedicationCategory;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  nafdacNumber?: string;
  requiresPrescription: boolean;
  standardDosage: IDosage;
  sideEffects?: ISideEffect[];
  interactions?: IInteraction[];
  contraindications?: string[];
  storageConditions?: string;
  inventory?: IInventoryItem[];
  minimumStockLevel: number;
}

export interface IMedicationUpdate {
  name?: string;
  genericName?: string;
  brandName?: string;
  description?: string;
  type?: MedicationType;
  category?: MedicationCategory;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  nafdacNumber?: string;
  requiresPrescription?: boolean;
  standardDosage?: IDosage;
  storageConditions?: string;
  minimumStockLevel?: number;
}

export interface IMedicationResponse {
  id: string;
  name: string;
  genericName: string;
  brandName?: string;
  description?: string;
  type: MedicationType;
  category: MedicationCategory;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  nafdacNumber?: string;
  requiresPrescription: boolean;
  standardDosage: IDosage;
  sideEffects: ISideEffect[];
  interactions: IInteraction[];
  contraindications: string[];
  storageConditions?: string;
  inventory: IInventoryItem[];
  minimumStockLevel: number;
  totalStock: number;
  createdAt: Date;
  updatedAt: Date;
}
