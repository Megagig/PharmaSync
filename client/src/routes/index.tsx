import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoadingScreen from '@/components/common/LoadingScreen/LoadingScreen';

// Auth Pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));

// Dashboard Pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

// Patient Pages
const PatientList = lazy(() => import('@/pages/patients/PatientList'));
const PatientDetail = lazy(() => import('@/pages/patients/PatientDetail'));

// Medication Pages
const MedicationList = lazy(() => import('@/pages/medications/MedicationList'));
const MedicationDetail = lazy(() => import('@/pages/medications/MedicationDetail'));

// Prescription Pages
const PrescriptionList = lazy(() => import('@/pages/prescriptions/PrescriptionList'));
const PrescriptionDetail = lazy(() => import('@/pages/prescriptions/PrescriptionDetail'));

// Dispensing Pages
const DispensingList = lazy(() => import('@/pages/dispensings/DispensingList'));
const DispensingDetail = lazy(() => import('@/pages/dispensings/DispensingDetail'));

// Inventory Pages
const InventoryList = lazy(() => import('@/pages/inventory/InventoryList'));
const InventoryDetail = lazy(() => import('@/pages/inventory/InventoryDetail'));

// Supplier Pages
const SupplierList = lazy(() => import('@/pages/suppliers/SupplierList'));
const SupplierDetail = lazy(() => import('@/pages/suppliers/SupplierDetail'));

// Purchase Order Pages
const PurchaseOrderList = lazy(() => import('@/pages/purchase-orders/PurchaseOrderList'));
const PurchaseOrderDetail = lazy(() => import('@/pages/purchase-orders/PurchaseOrderDetail'));

// Report Pages
const ReportList = lazy(() => import('@/pages/reports/ReportList'));
const ReportDetail = lazy(() => import('@/pages/reports/ReportDetail'));

// User Management Pages
const UserList = lazy(() => import('@/pages/users/UserList'));
const UserDetail = lazy(() => import('@/pages/users/UserDetail'));
const UserRoles = lazy(() => import('@/pages/users/UserRoles'));
const UserProfile = lazy(() => import('@/pages/profile/UserProfile'));

// Role Management Pages
const RoleList = lazy(() => import('@/pages/roles/RoleList'));
const RoleDetail = lazy(() => import('@/pages/roles/RoleDetail'));
const RoleUsers = lazy(() => import('@/pages/roles/RoleUsers'));

// Activity Log Pages
const ActivityLogList = lazy(() => import('@/pages/activity-logs/ActivityLogList'));

// Schedule Pages
const ScheduleCalendar = lazy(() => import('@/pages/schedule/ScheduleCalendar'));

// Notification Pages
const NotificationList = lazy(() => import('@/pages/notifications/NotificationList'));

// Message Pages
const MessageList = lazy(() => import('@/pages/messages/MessageList'));
const MessageDetail = lazy(() => import('@/pages/messages/MessageDetail'));

// Settings Pages
const Settings = lazy(() => import('@/pages/settings/Settings'));

// Error Pages
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const Forbidden = lazy(() => import('@/pages/errors/Forbidden'));
const ServerError = lazy(() => import('@/pages/errors/ServerError'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Patient Routes */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />

            {/* Medication Routes */}
            <Route path="/medications" element={<MedicationList />} />
            <Route path="/medications/:id" element={<MedicationDetail />} />

            {/* Prescription Routes */}
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/prescriptions/:id" element={<PrescriptionDetail />} />

            {/* Dispensing Routes */}
            <Route path="/dispensings" element={<DispensingList />} />
            <Route path="/dispensings/:id" element={<DispensingDetail />} />

            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/:id" element={<InventoryDetail />} />

            {/* Supplier Routes */}
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />

            {/* Purchase Order Routes */}
            <Route path="/purchase-orders" element={<PurchaseOrderList />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />

            {/* Report Routes */}
            <Route path="/reports" element={<ReportList />} />
            <Route path="/reports/:id" element={<ReportDetail />} />

            {/* User Management Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserDetail />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/users/:id/roles" element={<UserRoles />} />
            </Route>

            {/* Role Management Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/roles" element={<RoleList />} />
              <Route path="/roles/new" element={<RoleDetail />} />
              <Route path="/roles/:id" element={<RoleDetail />} />
              <Route path="/roles/:id/users" element={<RoleUsers />} />
            </Route>

            {/* Profile Routes */}
            <Route path="/profile" element={<UserProfile />} />

            {/* Activity Log Routes */}
            <Route path="/activity-logs" element={<ActivityLogList />} />

            {/* Schedule Routes */}
            <Route path="/schedule" element={<ScheduleCalendar />} />

            {/* Notification Routes */}
            <Route path="/notifications" element={<NotificationList />} />

            {/* Message Routes */}
            <Route path="/messages" element={<MessageList />} />
            <Route path="/messages/:id" element={<MessageDetail />} />

            {/* Settings Routes */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
