export interface LowStockAlert {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  totalStock: number;
  reorderLevel: number;
}

export interface ExpiringStockAlert {
  medicationId: string;
  medicationName: string;
  strength: string;
  dosageForm: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface MedicationValuation {
  medicationId: string;
  medicationName: string;
  totalStock: number;
  value: number;
}

export interface InventoryValuation {
  totalValue: number;
  medications: MedicationValuation[];
}

export interface InventoryMovementItem {
  date: string;
  type: 'purchase' | 'dispensing';
  quantity: number;
  batchNumber: string;
  reference: string;
}

export interface InventoryMovement {
  id: string;
  name: string;
  movements: InventoryMovementItem[];
}

export interface InventoryAdjustmentData {
  medicationId: string;
  batchNumber: string;
  quantity: number;
  reason: string;
}

export interface InventoryAdjustmentResult {
  medication: string;
  batchNumber: string;
  previousQuantity: number;
  adjustmentQuantity: number;
  newQuantity: number;
  reason: string;
}

export interface InventoryState {
  lowStockAlerts: LowStockAlert[];
  expiringStockAlerts: ExpiringStockAlert[];
  inventoryValuation: InventoryValuation | null;
  inventoryMovements: InventoryMovement[];
  adjustmentResult: InventoryAdjustmentResult | null;
  isLoading: boolean;
  error: string | null;
}
