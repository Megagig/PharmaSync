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

export interface IRole {
  id: string;
  name: string;
  type: RoleType;
  description?: string;
  permissions: IPermission[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleCreate {
  name: string;
  type: RoleType;
  description?: string;
  permissions: IPermission[];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface IRoleUpdate {
  name?: string;
  description?: string;
  permissions?: IPermission[];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface IUserRole {
  id: string;
  user: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: string | {
    id: string;
    name: string;
    type: RoleType;
    description?: string;
  };
  assignedBy: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserRoleCreate {
  user: string;
  role: string;
}

export interface IUserRoleResponse {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    type: RoleType;
  };
  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleState {
  roles: IRole[];
  currentRole: IRole | null;
  userRoles: IUserRole[];
  isLoading: boolean;
  error: string | null;
  totalRoles: number;
  totalUserRoles: number;
  totalPages: number;
  currentPage: number;
}

// Common permission resources
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

// Common permission actions
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
    actions: actions.map(action => action.toString()),
  };
};
