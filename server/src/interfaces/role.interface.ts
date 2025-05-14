import { Document } from 'mongoose';

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  PHARMACY_TECHNICIAN = 'pharmacy_technician',
  CASHIER = 'cashier',
  INVENTORY_MANAGER = 'inventory_manager',
  STAFF = 'staff',
  PATIENT = 'patient',
}

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRole extends Document {
  name: string;
  type: RoleType;
  description?: string;
  permissions: IPermission[];
  isActive: boolean;
  isDefault: boolean;
  parentRole?: string; // Reference to parent role for inheritance
  level: number; // Role hierarchy level (0 is highest)
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getAllPermissions(): Promise<IPermission[]>;
}

export interface IRoleCreate {
  name: string;
  type: RoleType;
  description?: string;
  permissions: IPermission[];
  isActive?: boolean;
  isDefault?: boolean;
  parentRole?: string; // Reference to parent role for inheritance
  level?: number; // Role hierarchy level (0 is highest)
}

export interface IRoleUpdate {
  name?: string;
  description?: string;
  permissions?: IPermission[];
  isActive?: boolean;
  isDefault?: boolean;
  parentRole?: string; // Reference to parent role for inheritance
  level?: number; // Role hierarchy level (0 is highest)
}

export interface IUserRole {
  user: string;
  role: string;
  assignedBy: string;
  assignedAt: Date;
}

export interface IUserRoleCreate {
  user: string;
  role: string;
  assignedBy: string;
}

export interface IUserRoleDocument extends IUserRole, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Define common permission resources
export enum PermissionResource {
  USERS = 'users',
  ROLES = 'roles',
  PATIENTS = 'patients',
  MEDICATIONS = 'medications',
  PRESCRIPTIONS = 'prescriptions',
  DISPENSINGS = 'dispensings',
  INVENTORY = 'inventory',
  SUPPLIERS = 'suppliers',
  PURCHASE_ORDERS = 'purchase_orders',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  MESSAGES = 'messages',
  ACTIVITY_LOGS = 'activity_logs',
  SCHEDULE = 'schedule',
}

// Define common permission actions
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Full access to the resource
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
}

// Helper function to create a permission
export const createPermission = (
  resource: PermissionResource,
  actions: PermissionAction[]
): IPermission => {
  return {
    resource,
    actions: actions.map((action) => action.toString()),
  };
};

// Define default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS = {
  [RoleType.SUPER_ADMIN]: [
    // Super admin has full access to everything
    createPermission(PermissionResource.USERS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.ROLES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PATIENTS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PRESCRIPTIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.DISPENSINGS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.INVENTORY, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SUPPLIERS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PURCHASE_ORDERS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.REPORTS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SETTINGS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.ACTIVITY_LOGS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.MANAGE]),
  ],

  [RoleType.ADMIN]: [
    // Admin has most access but limited on some sensitive areas
    createPermission(PermissionResource.USERS, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ]),
    createPermission(PermissionResource.ROLES, [PermissionAction.READ]),
    createPermission(PermissionResource.PATIENTS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PRESCRIPTIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.DISPENSINGS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.INVENTORY, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SUPPLIERS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PURCHASE_ORDERS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.REPORTS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SETTINGS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.ACTIVITY_LOGS, [PermissionAction.READ]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.MANAGE]),
  ],

  [RoleType.PHARMACIST]: [
    // Pharmacist has clinical access
    createPermission(PermissionResource.USERS, [PermissionAction.READ]),
    createPermission(PermissionResource.PATIENTS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PRESCRIPTIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.DISPENSINGS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.INVENTORY, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.SUPPLIERS, [PermissionAction.READ]),
    createPermission(PermissionResource.PURCHASE_ORDERS, [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.REPORTS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.EXPORT,
    ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SCHEDULE, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
  ],

  [RoleType.PHARMACY_TECHNICIAN]: [
    // Pharmacy technician has limited clinical access
    createPermission(PermissionResource.PATIENTS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.READ]),
    createPermission(PermissionResource.PRESCRIPTIONS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.DISPENSINGS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.INVENTORY, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.SUPPLIERS, [PermissionAction.READ]),
    createPermission(PermissionResource.PURCHASE_ORDERS, [
      PermissionAction.READ,
    ]),
    createPermission(PermissionResource.REPORTS, [PermissionAction.READ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.READ]),
  ],

  [RoleType.CASHIER]: [
    // Cashier has access to sales and basic patient info
    createPermission(PermissionResource.PATIENTS, [PermissionAction.READ]),
    createPermission(PermissionResource.PRESCRIPTIONS, [PermissionAction.READ]),
    createPermission(PermissionResource.DISPENSINGS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.INVENTORY, [PermissionAction.READ]),
    createPermission(PermissionResource.REPORTS, [PermissionAction.READ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.READ]),
  ],

  [RoleType.INVENTORY_MANAGER]: [
    // Inventory manager has full inventory access
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.INVENTORY, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SUPPLIERS, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.PURCHASE_ORDERS, [
      PermissionAction.MANAGE,
    ]),
    createPermission(PermissionResource.REPORTS, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.EXPORT,
    ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.READ]),
  ],

  [RoleType.STAFF]: [
    // General staff has basic access
    createPermission(PermissionResource.PATIENTS, [PermissionAction.READ]),
    createPermission(PermissionResource.MEDICATIONS, [PermissionAction.READ]),
    createPermission(PermissionResource.PRESCRIPTIONS, [PermissionAction.READ]),
    createPermission(PermissionResource.DISPENSINGS, [PermissionAction.READ]),
    createPermission(PermissionResource.INVENTORY, [PermissionAction.READ]),
    createPermission(PermissionResource.REPORTS, [PermissionAction.READ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MESSAGES, [PermissionAction.MANAGE]),
    createPermission(PermissionResource.SCHEDULE, [PermissionAction.READ]),
  ],

  [RoleType.PATIENT]: [
    // Patient can only access their own data
    createPermission(PermissionResource.PATIENTS, [PermissionAction.READ]),
    createPermission(PermissionResource.PRESCRIPTIONS, [PermissionAction.READ]),
    createPermission(PermissionResource.DISPENSINGS, [PermissionAction.READ]),
    createPermission(PermissionResource.NOTIFICATIONS, [
      PermissionAction.READ,
      PermissionAction.UPDATE,
    ]),
    createPermission(PermissionResource.MESSAGES, [
      PermissionAction.READ,
      PermissionAction.CREATE,
      PermissionAction.UPDATE,
    ]),
  ],
};
