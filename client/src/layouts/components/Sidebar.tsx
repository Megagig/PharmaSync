import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserRole } from '@/types/user.types';
import { RoleType } from '@/types/role.types';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
  FiShoppingCart,
  FiTruck,
  FiBarChart2,
  FiSettings,
  FiActivity,
  FiCalendar,
  FiBell,
  FiMessageSquare,
  FiKey,
  FiShield,
  FiMenu,
  FiX,
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { currentUser } = useSelector((state: RootState) => state.users);
  const { userPermissions } = useSelector((state: RootState) => state.roles);

  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    // Define all menu items
    const allMenuItems = [
      {
        title: 'Dashboard',
        icon: <FiHome className="h-5 w-5" />,
        path: '/dashboard',
        permission: { resource: 'dashboard', action: 'read' },
      },
      {
        title: 'Patient Management',
        icon: <FiUsers className="h-5 w-5" />,
        path: '/patients',
        permission: { resource: 'patients', action: 'read' },
      },
      {
        title: 'Medications',
        icon: <FiPackage className="h-5 w-5" />,
        path: '/medications',
        permission: { resource: 'medications', action: 'read' },
      },
      {
        title: 'Prescriptions',
        icon: <FiFileText className="h-5 w-5" />,
        path: '/prescriptions',
        permission: { resource: 'prescriptions', action: 'read' },
      },
      {
        title: 'Dispensings',
        icon: <FiShoppingCart className="h-5 w-5" />,
        path: '/dispensings',
        permission: { resource: 'dispensings', action: 'read' },
      },
      {
        title: 'Inventory',
        icon: <FiPackage className="h-5 w-5" />,
        path: '/inventory',
        permission: { resource: 'inventory', action: 'read' },
      },
      {
        title: 'Suppliers',
        icon: <FiTruck className="h-5 w-5" />,
        path: '/suppliers',
        permission: { resource: 'suppliers', action: 'read' },
      },
      {
        title: 'Purchase Orders',
        icon: <FiShoppingCart className="h-5 w-5" />,
        path: '/purchase-orders',
        permission: { resource: 'purchase_orders', action: 'read' },
      },
      {
        title: 'Reports',
        icon: <FiBarChart2 className="h-5 w-5" />,
        path: '/reports',
        permission: { resource: 'reports', action: 'read' },
      },
      {
        title: 'User Management',
        icon: <FiUsers className="h-5 w-5" />,
        path: '/users',
        permission: { resource: 'users', action: 'read' },
        adminOnly: true,
      },
      {
        title: 'Role Management',
        icon: <FiShield className="h-5 w-5" />,
        path: '/roles',
        permission: { resource: 'roles', action: 'read' },
        adminOnly: true,
      },
      {
        title: 'Activity Logs',
        icon: <FiActivity className="h-5 w-5" />,
        path: '/activity-logs',
        permission: { resource: 'activity_logs', action: 'read' },
      },
      {
        title: 'Schedule',
        icon: <FiCalendar className="h-5 w-5" />,
        path: '/schedule',
        permission: { resource: 'schedule', action: 'read' },
      },
      {
        title: 'Notifications',
        icon: <FiBell className="h-5 w-5" />,
        path: '/notifications',
        permission: { resource: 'notifications', action: 'read' },
      },
      {
        title: 'Messages',
        icon: <FiMessageSquare className="h-5 w-5" />,
        path: '/messages',
        permission: { resource: 'messages', action: 'read' },
      },
      {
        title: 'Settings',
        icon: <FiSettings className="h-5 w-5" />,
        path: '/settings',
        permission: { resource: 'settings', action: 'read' },
      },
    ];

    // Filter menu items based on user permissions
    const filteredMenuItems = allMenuItems.filter((item) => {
      // Check if the item is admin-only
      if (item.adminOnly) {
        // Check if user has admin role (legacy check)
        const hasAdminRole = currentUser?.role === UserRole.ADMIN;

        // Check if user has admin role in new role system
        const hasAdminRoleNew = currentUser?.roles?.some(
          (role) =>
            role.type === RoleType.ADMIN || role.type === RoleType.SUPER_ADMIN
        );

        // Check if user has the specific permission
        const hasPermission = userPermissions?.some(
          (permission) =>
            permission.resource === item.permission.resource &&
            (permission.actions.includes(item.permission.action) ||
              permission.actions.includes('manage'))
        );

        return hasAdminRole || hasAdminRoleNew || hasPermission;
      }

      // For non-admin items, check if user has the specific permission
      const hasPermission = userPermissions?.some(
        (permission) =>
          permission.resource === item.permission.resource &&
          (permission.actions.includes(item.permission.action) ||
            permission.actions.includes('manage'))
      );

      // If no permissions are loaded yet, show all items
      return userPermissions ? hasPermission : true;
    });

    setMenuItems(filteredMenuItems);
  }, [currentUser, userPermissions]);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="PharmaSync Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              PharmaSync
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-full py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="px-4 mt-8">
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <span className="mr-3 text-gray-500">
                  <FiKey className="h-5 w-5" />
                </span>
                My Profile
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 z-20 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-primary-600 rounded-full text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiMenu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
