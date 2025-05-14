import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserRole } from '@/types/user.types';
import { RoleType } from '@/types/role.types';

/**
 * Hook to check if the current user has a specific permission
 * 
 * @returns A function that checks if the user has permission for a resource and action
 */
const usePermission = () => {
  const { currentUser } = useSelector((state: RootState) => state.users);
  const { userPermissions } = useSelector((state: RootState) => state.roles);
  
  /**
   * Check if the user has permission for a resource and action
   * 
   * @param resource The resource to check permission for
   * @param action The action to check permission for
   * @returns True if the user has permission, false otherwise
   */
  const hasPermission = (resource: string, action: string): boolean => {
    // Check if user has admin role (legacy check)
    const hasAdminRole = currentUser?.role === UserRole.ADMIN;
    
    // Check if user has admin role in new role system
    const hasAdminRoleNew = currentUser?.roles?.some(
      (role) => role.type === RoleType.ADMIN || role.type === RoleType.SUPER_ADMIN
    );
    
    // Check if user has the specific permission
    const hasSpecificPermission = userPermissions?.some(
      (permission) =>
        permission.resource === resource &&
        (permission.actions.includes(action) || permission.actions.includes('manage'))
    );
    
    // If user has admin role or the specific permission, return true
    return hasAdminRole || hasAdminRoleNew || !!hasSpecificPermission;
  };
  
  return { hasPermission };
};

export default usePermission;
