import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Layout
import Layout from '@/components/layout/Layout';

// Auth pages
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';

// Main pages
import Dashboard from '@/pages/Dashboard';

// Patient pages
import PatientList from '@/pages/Patients/PatientList';
import PatientDetail from '@/pages/Patients/PatientDetail';
import CreatePatient from '@/pages/Patients/CreatePatient';
import EditPatient from '@/pages/Patients/EditPatient';
import AddAllergy from '@/pages/Patients/AddAllergy';
import AddMedicalCondition from '@/pages/Patients/AddMedicalCondition';

// Medication pages
import MedicationList from '@/pages/Medications/MedicationList';
import MedicationDetail from '@/pages/Medications/MedicationDetail';
import CreateMedication from '@/pages/Medications/CreateMedication';
import EditMedication from '@/pages/Medications/EditMedication';
import AddInventoryItem from '@/pages/Medications/AddInventoryItem';

// Prescription pages
import PrescriptionList from '@/pages/Prescriptions/PrescriptionList';
import PrescriptionDetail from '@/pages/Prescriptions/PrescriptionDetail';
import CreatePrescription from '@/pages/Prescriptions/CreatePrescription';
import DispenseMedication from '@/pages/Prescriptions/DispenseMedication';

// Dispensing pages
import DispensingList from '@/pages/Dispensing/DispensingList';
import DispensingDetail from '@/pages/Dispensing/DispensingDetail';
import CreateDispensing from '@/pages/Dispensing/CreateDispensing';
import Receipt from '@/pages/Dispensing/Receipt';

// Inventory pages
import InventoryDashboard from '@/pages/Inventory/InventoryDashboard';
import InventoryAdjustment from '@/pages/Inventory/InventoryAdjustment';
import InventoryMovement from '@/pages/Inventory/InventoryMovement';

// Reports pages
import ReportsDashboard from '@/pages/Reports/ReportsDashboard';
import SalesReport from '@/pages/Reports/SalesReport';
import InventoryReport from '@/pages/Reports/InventoryReport';
import PrescriptionReport from '@/pages/Reports/PrescriptionReport';
import PatientReport from '@/pages/Reports/PatientReport';

// User Management pages
import UserList from '@/pages/UserManagement/UserList';
import UserForm from '@/pages/UserManagement/UserForm';
import UserDetail from '@/pages/UserManagement/UserDetail';
import UserProfile from '@/pages/UserManagement/UserProfile';

// Activity Log pages
import ActivityLogList from '@/pages/ActivityLogs/ActivityLogList';
import ActivityLogDetail from '@/pages/ActivityLogs/ActivityLogDetail';
import ActivityLogStats from '@/pages/ActivityLogs/ActivityLogStats';

// Schedule pages
import ScheduleDashboard from '@/pages/Schedule/ScheduleDashboard';
import ShiftForm from '@/pages/Schedule/ShiftForm';
import TimeOffRequestList from '@/pages/Schedule/TimeOffRequestList';

// Notification pages
import NotificationList from '@/pages/Notifications/NotificationList';
import NotificationPreferences from '@/pages/Notifications/NotificationPreferences';

// Message pages
import ConversationList from '@/pages/Messages/ConversationList';
import ConversationDetail from '@/pages/Messages/ConversationDetail';
const Settings = () => <div>Settings Page</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Patients */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<CreatePatient />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/edit" element={<EditPatient />} />
          <Route path="/patients/:id/allergies/new" element={<AddAllergy />} />
          <Route
            path="/patients/:id/conditions/new"
            element={<AddMedicalCondition />}
          />

          {/* Medications */}
          <Route path="/medications" element={<MedicationList />} />
          <Route path="/medications/new" element={<CreateMedication />} />
          <Route path="/medications/:id" element={<MedicationDetail />} />
          <Route path="/medications/:id/edit" element={<EditMedication />} />
          <Route
            path="/medications/:id/inventory/add"
            element={<AddInventoryItem />}
          />

          {/* Prescriptions */}
          <Route path="/prescriptions" element={<PrescriptionList />} />
          <Route path="/prescriptions/new" element={<CreatePrescription />} />
          <Route path="/prescriptions/:id" element={<PrescriptionDetail />} />
          <Route
            path="/prescriptions/:id/dispense"
            element={<DispenseMedication />}
          />

          {/* Dispensing */}
          <Route path="/dispensing" element={<DispensingList />} />
          <Route path="/dispensing/new" element={<CreateDispensing />} />
          <Route path="/dispensing/:id" element={<DispensingDetail />} />
          <Route path="/dispensing/:id/receipt" element={<Receipt />} />

          {/* Inventory */}
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/inventory/adjust" element={<InventoryAdjustment />} />
          <Route path="/inventory/movement" element={<InventoryMovement />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/reports/inventory" element={<InventoryReport />} />
          <Route
            path="/reports/prescriptions"
            element={<PrescriptionReport />}
          />
          <Route path="/reports/patients" element={<PatientReport />} />

          {/* User Management */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Activity Logs */}
          <Route path="/activity-logs" element={<ActivityLogList />} />
          <Route path="/activity-logs/:id" element={<ActivityLogDetail />} />
          <Route path="/activity-logs/stats" element={<ActivityLogStats />} />
          <Route
            path="/activity-logs/user/:userId"
            element={<ActivityLogList />}
          />
          <Route path="/activity-logs/me" element={<ActivityLogList />} />

          {/* Schedule */}
          <Route path="/schedule" element={<ScheduleDashboard />} />
          <Route path="/schedule/shifts/new" element={<ShiftForm />} />
          <Route path="/schedule/shifts/:id" element={<ShiftForm />} />
          <Route path="/schedule/time-off" element={<TimeOffRequestList />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationList />} />
          <Route
            path="/notifications/preferences"
            element={<NotificationPreferences />}
          />

          {/* Messages */}
          <Route path="/messages" element={<ConversationList />} />
          <Route path="/messages/:id" element={<ConversationDetail />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
