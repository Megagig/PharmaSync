/**
 * Report format enum
 */
export enum ReportFormat {
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

/**
 * Inventory report data interface
 */
export interface InventoryReportData {
  summary: {
    totalMedications: number;
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
  };
  stockByCategory: any[];
  expiryBreakdown: {
    expiryPeriod: string;
    count: number;
    totalStock: number;
    totalValue: number;
  }[];
  lowStockItems: {
    medicationId: any;
    medicationName: string;
    currentStock: number;
    minimumLevel: number;
    reorderQuantity: number;
  }[];
  movementAnalysis?: {
    purchases: number;
    sales: number;
    transfers: number;
    adjustments: number;
    returns: number;
    other: number;
  };
  recentMovements?: any[];
}

/**
 * Sales by period interface
 */
export interface SalesByPeriod {
  period: string;
  sales: number;
  count: number;
}

/**
 * Product sale interface
 */
export interface ProductSale {
  productId: string;
  productName: string;
  quantity: number;
  totalSales: number;
}

/**
 * Category sale interface
 */
export interface CategorySale {
  category: string;
  value: number;
}

/**
 * Daily activity interface
 */
export interface DailyActivity {
  date: string;
  count: number;
  users: number;
}

/**
 * User activity interface
 */
export interface UserActivity {
  userId: string;
  userName: string;
  activityCount: number;
  lastActive: Date;
}
