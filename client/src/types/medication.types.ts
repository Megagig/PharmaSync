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

export interface Dosage {
  amount: number;
  unit: string;
  frequency: string;
  route: string;
  instructions?: string;
}

export interface SideEffect {
  _id?: string;
  effect: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: 'rare' | 'uncommon' | 'common' | 'very_common';
}

export interface Interaction {
  _id?: string;
  interactsWith: string;
  effect: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
}

export interface InventoryItem {
  _id?: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  purchaseDate: string;
}

export interface Medication {
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
  standardDosage: Dosage;
  sideEffects: SideEffect[];
  interactions: Interaction[];
  contraindications: string[];
  storageConditions?: string;
  inventory: InventoryItem[];
  minimumStockLevel: number;
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationFormData {
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
  standardDosage: Dosage;
  storageConditions?: string;
  minimumStockLevel: number;
}

export interface InventoryItemFormData {
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  purchaseDate: string;
}

export interface SideEffectFormData {
  effect: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: 'rare' | 'uncommon' | 'common' | 'very_common';
}

export interface InteractionFormData {
  interactsWith: string;
  effect: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
}

export interface MedicationsState {
  medications: Medication[];
  currentMedication: Medication | null;
  isLoading: boolean;
  error: string | null;
  totalMedications: number;
  totalPages: number;
  currentPage: number;
  lowStockMedications: Medication[];
  expiringMedications: Medication[];
}
