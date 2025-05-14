// Sales Report Types
export interface SalesSummary {
  totalSales: number;
  totalDispensings: number;
  averageSale: number;
  minSale: number;
  maxSale: number;
}

export interface SalesByDate {
  date: string;
  totalSales: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: string;
  totalSales: number;
  count: number;
}

export interface TopSellingMedication {
  medicationId: string;
  medicationName: string;
  strength: string;
  totalQuantity: number;
  totalSales: number;
}

export interface SalesReport {
  summary: SalesSummary;
  salesByDate: SalesByDate[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  topSellingMedications: TopSellingMedication[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Inventory Report Types
export interface InventorySummary {
  totalMedications: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface StockByCategory {
  category: string;
  count: number;
  totalStock: number;
  totalValue: number;
}

export interface ExpiryBreakdown {
  expiryPeriod: string;
  count: number;
  totalStock: number;
  totalValue: number;
}

export interface InventoryTurnover {
  medicationId: string;
  medicationName: string;
  strength: string;
  totalStock: number;
  totalDispensed: number;
  turnoverRatio: number;
}

export interface InventoryReport {
  summary: InventorySummary;
  stockByCategory: StockByCategory[];
  expiryBreakdown: ExpiryBreakdown[];
  inventoryTurnover: InventoryTurnover[];
}

// Prescription Report Types
export interface PrescriptionSummary {
  totalPrescriptions: number;
  activeCount: number;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
  averageItemsPerPrescription: number;
}

export interface PrescriptionsByDate {
  date: string;
  count: number;
}

export interface TopPrescribedMedication {
  medicationId: string;
  medicationName: string;
  strength: string;
  prescriptionCount: number;
  totalQuantity: number;
}

export interface PrescriptionReport {
  summary: PrescriptionSummary;
  prescriptionsByDate: PrescriptionsByDate[];
  topPrescribedMedications: TopPrescribedMedication[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Patient Report Types
export interface PatientSummary {
  totalPatients: number;
  maleCount: number;
  femaleCount: number;
  otherGenderCount: number;
}

export interface PatientsByAgeGroup {
  ageGroup: string;
  count: number;
}

export interface MedicalCondition {
  condition: string;
  count: number;
}

export interface Allergy {
  allergen: string;
  count: number;
}

export interface PatientWithPrescriptions {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  prescriptionCount: number;
}

export interface PatientReport {
  summary: PatientSummary;
  patientsByAgeGroup: PatientsByAgeGroup[];
  topMedicalConditions: MedicalCondition[];
  topAllergies: Allergy[];
  patientsWithMostPrescriptions: PatientWithPrescriptions[];
}

// Reports State
export interface ReportsState {
  salesReport: SalesReport | null;
  inventoryReport: InventoryReport | null;
  prescriptionReport: PrescriptionReport | null;
  patientReport: PatientReport | null;
  isLoading: boolean;
  error: string | null;
}
