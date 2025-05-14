import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserRole } from '@/types/user.types';
import { RoleType } from '@/types/role.types';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

const AdminRoute: React.FC = () => {
  const location = useLocation();
  const { currentUser, isLoading } = useSelector((state: RootState) => state.users);
  const { userPermissions } = useSelector((state: RootState) => state.roles);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role (legacy check)
  const hasAdminRole = currentUser.role === UserRole.ADMIN;

  // Check if user has admin role in new role system
  const hasAdminRoleNew = currentUser.roles?.some(
    role => role.type === RoleType.ADMIN || role.type === RoleType.SUPER_ADMIN
  );

  // Check if user has user management permissions
  const hasUserManagementPermission = userPermissions?.some(
    permission => 
      permission.resource === 'users' && 
      (permission.actions.includes('manage') || permission.actions.includes('read'))
  );

  // Allow access if user has admin role or user management permissions
  if (hasAdminRole || hasAdminRoleNew || hasUserManagementPermission) {
    return <Outlet />;
  }

  // Redirect to forbidden page if user doesn't have required permissions
  return <Navigate to="/403" replace />;
};

export default AdminRoute;
