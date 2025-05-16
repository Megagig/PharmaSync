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
const ComprehensiveDashboard = lazy(
  () => import('@/pages/dashboard/ComprehensiveDashboard')
);

// Patient Pages
const PatientList = lazy(() => import('@/pages/patients/PatientList'));
const PatientDetail = lazy(() => import('@/pages/patients/PatientDetail'));
const AddMedicationHistory = lazy(
  () => import('@/pages/patients/AddMedicationHistory')
);
const EditMedicationHistory = lazy(
  () => import('@/pages/patients/EditMedicationHistory')
);
const DeleteMedicationHistory = lazy(
  () => import('@/pages/patients/DeleteMedicationHistory')
);
const AddClinicalAssessment = lazy(
  () => import('@/pages/patients/AddClinicalAssessment')
);
const EditClinicalAssessment = lazy(
  () => import('@/pages/patients/EditClinicalAssessment')
);
const DeleteClinicalAssessment = lazy(
  () => import('@/pages/patients/DeleteClinicalAssessment')
);
const AddLaboratoryFinding = lazy(
  () => import('@/pages/patients/AddLaboratoryFinding')
);
const EditLaboratoryFinding = lazy(
  () => import('@/pages/patients/EditLaboratoryFinding')
);
const DeleteLaboratoryFinding = lazy(
  () => import('@/pages/patients/DeleteLaboratoryFinding')
);
const AddDrugTherapyProblem = lazy(
  () => import('@/pages/patients/AddDrugTherapyProblem')
);
const EditDrugTherapyProblem = lazy(
  () => import('@/pages/patients/EditDrugTherapyProblem')
);
const DeleteDrugTherapyProblem = lazy(
  () => import('@/pages/patients/DeleteDrugTherapyProblem')
);
const AddCarePlan = lazy(() => import('@/pages/patients/AddCarePlan'));
const EditCarePlan = lazy(() => import('@/pages/patients/EditCarePlan'));
const DeleteCarePlan = lazy(() => import('@/pages/patients/DeleteCarePlan'));
const AddSoapNote = lazy(() => import('@/pages/patients/AddSoapNote'));
const EditSoapNote = lazy(() => import('@/pages/patients/EditSoapNote'));
const DeleteSoapNote = lazy(() => import('@/pages/patients/DeleteSoapNote'));

// Medication Pages
const MedicationList = lazy(() => import('@/pages/medications/MedicationList'));
const MedicationDetail = lazy(
  () => import('@/pages/medications/MedicationDetail')
);

// Prescription Pages
const PrescriptionList = lazy(
  () => import('@/pages/prescriptions/PrescriptionList')
);
const PrescriptionDetail = lazy(
  () => import('@/pages/prescriptions/PrescriptionDetail')
);

// Dispensing Pages
const DispensingList = lazy(() => import('@/pages/dispensings/DispensingList'));
const DispensingDetail = lazy(
  () => import('@/pages/dispensings/DispensingDetail')
);

// Inventory Pages
const InventoryList = lazy(() => import('@/pages/inventory/InventoryList'));
const InventoryDetail = lazy(() => import('@/pages/inventory/InventoryDetail'));

// Supplier Pages
const SupplierList = lazy(() => import('@/pages/suppliers/SupplierList'));
const SupplierDetail = lazy(() => import('@/pages/suppliers/SupplierDetail'));

// Purchase Order Pages
const PurchaseOrderList = lazy(
  () => import('@/pages/purchase-orders/PurchaseOrderList')
);
const PurchaseOrderDetail = lazy(
  () => import('@/pages/purchase-orders/PurchaseOrderDetail')
);

// Report Pages
const ReportList = lazy(() => import('@/pages/reports/ReportList'));
const ReportDetail = lazy(() => import('@/pages/reports/ReportDetail'));
const ReportingDashboard = lazy(
  () => import('@/pages/Reports/ReportingDashboard')
);

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
const ActivityLogList = lazy(
  () => import('@/pages/activity-logs/ActivityLogList')
);

// Schedule Pages
const ScheduleCalendar = lazy(
  () => import('@/pages/schedule/ScheduleCalendar')
);

// Calendar Pages
const CalendarPage = lazy(() => import('@/pages/Calendar/CalendarPage'));

// Notification Pages
const NotificationList = lazy(
  () => import('@/pages/notifications/NotificationList')
);

// Message Pages
const MessageList = lazy(() => import('@/pages/messages/MessageList'));
const MessageDetail = lazy(() => import('@/pages/messages/MessageDetail'));

// Expense Management Pages
const ExpensesList = lazy(() => import('@/pages/Expenses/ExpensesList'));
const ExpenseDetail = lazy(() => import('@/pages/Expenses/ExpenseDetail'));
const CreateExpense = lazy(() => import('@/pages/Expenses/CreateExpense'));

// Budget Management Pages
const BudgetsList = lazy(() => import('@/pages/Budgets/BudgetsList'));
const BudgetDetail = lazy(() => import('@/pages/Budgets/BudgetDetail'));
const CreateBudget = lazy(() => import('@/pages/Budgets/CreateBudget'));

// Finance Dashboard
const FinanceDashboard = lazy(() => import('@/pages/Finance/FinanceDashboard'));

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
            <Route
              path="/business-dashboard"
              element={<ComprehensiveDashboard />}
            />

            {/* Patient Routes */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route
              path="/patients/:id/medication-history/add"
              element={<AddMedicationHistory />}
            />
            <Route
              path="/patients/:id/medication-history/:medicationId/edit"
              element={<EditMedicationHistory />}
            />
            <Route
              path="/patients/:id/medication-history/:medicationId/delete"
              element={<DeleteMedicationHistory />}
            />
            <Route
              path="/patients/:id/clinical-assessments/add"
              element={<AddClinicalAssessment />}
            />
            <Route
              path="/patients/:id/clinical-assessments/:assessmentId/edit"
              element={<EditClinicalAssessment />}
            />
            <Route
              path="/patients/:id/clinical-assessments/:assessmentId/delete"
              element={<DeleteClinicalAssessment />}
            />
            <Route
              path="/patients/:id/laboratory-findings/add"
              element={<AddLaboratoryFinding />}
            />
            <Route
              path="/patients/:id/laboratory-findings/:findingId/edit"
              element={<EditLaboratoryFinding />}
            />
            <Route
              path="/patients/:id/laboratory-findings/:findingId/delete"
              element={<DeleteLaboratoryFinding />}
            />
            <Route
              path="/patients/:id/drug-therapy-problems/add"
              element={<AddDrugTherapyProblem />}
            />
            <Route
              path="/patients/:id/drug-therapy-problems/:problemId/edit"
              element={<EditDrugTherapyProblem />}
            />
            <Route
              path="/patients/:id/drug-therapy-problems/:problemId/delete"
              element={<DeleteDrugTherapyProblem />}
            />
            <Route
              path="/patients/:id/care-plans/add"
              element={<AddCarePlan />}
            />
            <Route
              path="/patients/:id/care-plans/:planId/edit"
              element={<EditCarePlan />}
            />
            <Route
              path="/patients/:id/care-plans/:planId/delete"
              element={<DeleteCarePlan />}
            />
            <Route
              path="/patients/:id/soap-notes/add"
              element={<AddSoapNote />}
            />
            <Route
              path="/patients/:id/soap-notes/:noteId/edit"
              element={<EditSoapNote />}
            />
            <Route
              path="/patients/:id/soap-notes/:noteId/delete"
              element={<DeleteSoapNote />}
            />

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
            <Route
              path="/purchase-orders/:id"
              element={<PurchaseOrderDetail />}
            />

            {/* Report Routes */}
            <Route path="/reports" element={<ReportList />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/reporting" element={<ReportingDashboard />} />

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

            {/* Calendar Routes */}
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Notification Routes */}
            <Route path="/notifications" element={<NotificationList />} />

            {/* Message Routes */}
            <Route path="/messages" element={<MessageList />} />
            <Route path="/messages/:id" element={<MessageDetail />} />

            {/* Expense Management Routes */}
            <Route path="/expenses" element={<ExpensesList />} />
            <Route path="/expenses/new" element={<CreateExpense />} />
            <Route path="/expenses/:id" element={<ExpenseDetail />} />

            {/* Budget Management Routes */}
            <Route path="/budgets" element={<BudgetsList />} />
            <Route path="/budgets/new" element={<CreateBudget />} />
            <Route path="/budgets/:id" element={<BudgetDetail />} />

            {/* Finance Dashboard */}
            <Route path="/finance/reports" element={<FinanceDashboard />} />

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
