import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserRole } from '@/types/user.types';
import { RoleType } from '@/types/role.types';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 * 
 * @param resource The resource to check permission for
 * @param action The action to check permission for
 * @param children The content to render if the user has permission
 * @param fallback Optional content to render if the user doesn't have permission
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null,
}) => {
  const { currentUser } = useSelector((state: RootState) => state.users);
  const { userPermissions } = useSelector((state: RootState) => state.roles);
  
  // Check if user has admin role (legacy check)
  const hasAdminRole = currentUser?.role === UserRole.ADMIN;
  
  // Check if user has admin role in new role system
  const hasAdminRoleNew = currentUser?.roles?.some(
    (role) => role.type === RoleType.ADMIN || role.type === RoleType.SUPER_ADMIN
  );
  
  // Check if user has the specific permission
  const hasPermission = userPermissions?.some(
    (permission) =>
      permission.resource === resource &&
      (permission.actions.includes(action) || permission.actions.includes('manage'))
  );
  
  // If user has admin role or the specific permission, render the children
  if (hasAdminRole || hasAdminRoleNew || hasPermission) {
    return <>{children}</>;
  }
  
  // Otherwise, render the fallback content
  return <>{fallback}</>;
};

export default PermissionGuard;
