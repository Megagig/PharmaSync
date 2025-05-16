import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Layout
import Layout from '@/components/layout/Layout';

// Landing Page
import LandingPage from '@/pages/Landing/LandingPage';

// Auth pages
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import Logout from '@/features/auth/pages/Logout';

// Main pages
import Dashboard from '@/pages/Dashboard';
import ComprehensiveDashboard from '@/pages/dashboard/ComprehensiveDashboard';

// Patient pages
import PatientList from '@/pages/Patients/PatientList';
import PatientDetail from '@/pages/Patients/PatientDetail';
import CreatePatient from '@/pages/Patients/CreatePatient';
import EditPatient from '@/pages/Patients/EditPatient';
import AddAllergy from '@/pages/Patients/AddAllergy';
import AddMedicalCondition from '@/pages/Patients/AddMedicalCondition';
import AddMedicationHistory from '@/pages/Patients/AddMedicationHistory';
import EditMedicationHistory from '@/pages/Patients/EditMedicationHistory';
import AddClinicalAssessment from '@/pages/Patients/AddClinicalAssessment';
import AddLaboratoryFinding from '@/pages/Patients/AddLaboratoryFinding';
import AddDrugTherapyProblem from '@/pages/Patients/AddDrugTherapyProblem';
import AddCarePlan from '@/pages/Patients/AddCarePlan';
import AddSoapNote from '@/pages/Patients/AddSoapNote';

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
import ProductList from '@/pages/Inventory/Products/ProductList';
import ProductForm from '@/pages/Inventory/Products/ProductForm';
import ProductInventory from '@/pages/Inventory/Products/ProductInventory';
import ProductHistory from '@/pages/Inventory/Products/ProductHistory';
import StockLevelsList from '@/pages/Inventory/StockLevels/StockLevelsList';
import PriceManagementList from '@/pages/Inventory/PriceManagement/PriceManagementList';
import ExpiryTrackingList from '@/pages/Inventory/ExpiryTracking/ExpiryTrackingList';
import PurchasesList from '@/pages/Inventory/Purchases/PurchasesList';
import CreatePurchase from '@/pages/Inventory/Purchases/CreatePurchase';
import CustomersList from '@/pages/Inventory/Customers/CustomersList';
import SuppliersList from '@/pages/Inventory/Suppliers/SuppliersList';
import LocationList from '@/pages/Inventory/Locations/LocationList';
import InventoryReportsList from '@/pages/Inventory/Reports/InventoryReportsList';

// Sales pages
import SalesList from '@/pages/Sales/SalesList';
import CreateSale from '@/pages/Sales/CreateSale';
import SaleDetail from '@/pages/Sales/SaleDetail';
import SaleReceipt from '@/pages/Sales/SaleReceipt';

// Invoice pages
import InvoicesList from '@/pages/Invoices/InvoicesList';
import CreateInvoice from '@/pages/Invoices/CreateInvoice';
import InvoiceDetail from '@/pages/Invoices/InvoiceDetail';
import InvoicePrint from '@/pages/Invoices/InvoicePrint';

// Payment pages
import PaymentsList from '@/pages/Payments/PaymentsList';
import CreatePayment from '@/pages/Payments/CreatePayment';
import PaymentDetail from '@/pages/Payments/PaymentDetail';
import PaymentReceipt from '@/pages/Payments/PaymentReceipt';

// Return pages
import ReturnsList from '@/pages/Returns/ReturnsList';
import CreateReturn from '@/pages/Returns/CreateReturn';
import ReturnDetail from '@/pages/Returns/ReturnDetail';

// Customer pages
import CustomerDetail from '@/pages/Customers/CustomerDetail';
import CustomerCredit from '@/pages/Customers/CustomerCredit';

// Invoice pages
import BatchInvoice from '@/pages/Invoices/BatchInvoice';

// Reminder pages
import RemindersList from '@/pages/Reminders/RemindersList';
import CreateReminder from '@/pages/Reminders/CreateReminder';
import ReminderDetail from '@/pages/Reminders/ReminderDetail';

// Reports pages
import ReportsDashboard from '@/pages/Reports/ReportsDashboard';
import SalesReport from '@/pages/Reports/SalesReport';
import InventoryReport from '@/pages/Reports/InventoryReport';
import PrescriptionReport from '@/pages/Reports/PrescriptionReport';
import PatientReport from '@/pages/Reports/PatientReport';
import ReportingDashboard from '@/pages/Reports/ReportingDashboard';

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

// Calendar pages
import CalendarPage from '@/pages/Calendar/CalendarPage';

// Notification pages
import NotificationList from '@/pages/Notifications/NotificationList';
import NotificationPreferences from '@/pages/Notifications/NotificationPreferences';

// Message pages
import ConversationList from '@/pages/Messages/ConversationList';
import ConversationDetail from '@/pages/Messages/ConversationDetail';

// Report pages
import ReportDashboard from '@/pages/Reports/ReportDashboard';
import ReportGenerator from '@/pages/Reports/ReportGenerator';
import ReportConfigurations from '@/pages/Reports/ReportConfigurations';
import ReportsModule from '@/pages/Reports/ReportsModule';
import PatientReports from '@/pages/Reports/PatientReports';
import MedicationReports from '@/pages/Reports/MedicationReports';
import InventoryReports from '@/pages/Reports/InventoryReports';
import SalesReports from '@/pages/Reports/SalesReports';
import FinancialReports from '@/pages/Reports/FinancialReports';
import AdministrativeReports from '@/pages/Reports/AdministrativeReports';
import Settings from '@/pages/Settings/Settings';

// POS pages
import PosSessionsList from '@/pages/POS/Sessions/PosSessionsList';
import CreatePosSession from '@/pages/POS/Sessions/CreatePosSession';
import PosSessionDetail from '@/pages/POS/Sessions/PosSessionDetail';
import PosTerminal from '@/pages/POS/Terminal/PosTerminal';
import PosTransactionsList from '@/pages/POS/Transactions/PosTransactionsList';
import PosTransactionDetail from '@/pages/POS/Transactions/PosTransactionDetail';
import PosTransactionReceipt from '@/pages/POS/Transactions/PosTransactionReceipt';

// Accounting pages
import AccountingDashboard from '@/pages/Accounting/AccountingDashboard';
import AccountsList from '@/pages/Accounting/Accounts/AccountsList';
import AccountForm from '@/pages/Accounting/Accounts/AccountForm';
import AccountDetail from '@/pages/Accounting/Accounts/AccountDetail';
import JournalEntriesList from '@/pages/Accounting/JournalEntries/JournalEntriesList';
import JournalEntryForm from '@/pages/Accounting/JournalEntries/JournalEntryForm';
import JournalEntryDetail from '@/pages/Accounting/JournalEntries/JournalEntryDetail';
import GeneralLedgerList from '@/pages/Accounting/GeneralLedger/GeneralLedgerList';
import TrialBalance from '@/pages/Accounting/GeneralLedger/TrialBalance';
import FinancialStatements from '@/pages/Accounting/FinancialStatements/FinancialStatements';
import TaxConfigurationsList from '@/pages/Accounting/Taxes/TaxConfigurationsList';
import TaxConfigurationForm from '@/pages/Accounting/Taxes/TaxConfigurationForm';
import TaxConfigurationDetail from '@/pages/Accounting/Taxes/TaxConfigurationDetail';
import FinancialPeriodsList from '@/pages/Accounting/FinancialPeriods/FinancialPeriodsList';
import FinancialPeriodForm from '@/pages/Accounting/FinancialPeriods/FinancialPeriodForm';
import FinancialPeriodDetail from '@/pages/Accounting/FinancialPeriods/FinancialPeriodDetail';
import AccountingSettings from '@/pages/Accounting/Settings/AccountingSettings';
import FinanceDashboard from '@/pages/Finance/FinanceDashboard';
import ExpensesList from '@/pages/Finance/Expenses/ExpensesList';
import ExpenseForm from '@/pages/Finance/Expenses/ExpenseForm';
import BudgetsList from '@/pages/Finance/Budgets/BudgetsList';
import BudgetForm from '@/pages/Finance/Budgets/BudgetForm';
import FinanceReports from '@/pages/Finance/Reports/FinanceReports';

const NotFound = () => <div>404 - Page Not Found</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Logout route */}
      <Route path="/logout" element={<Logout />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/business-dashboard"
            element={<ComprehensiveDashboard />}
          />

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
          <Route
            path="/patients/:id/medication-history/new"
            element={<AddMedicationHistory />}
          />
          <Route
            path="/patients/:id/medication-history/:medicationId/edit"
            element={<EditMedicationHistory />}
          />
          <Route
            path="/patients/:id/clinical-assessments/new"
            element={<AddClinicalAssessment />}
          />
          <Route
            path="/patients/:id/laboratory-findings/new"
            element={<AddLaboratoryFinding />}
          />
          <Route
            path="/patients/:id/drug-therapy-problems/new"
            element={<AddDrugTherapyProblem />}
          />
          <Route
            path="/patients/:id/care-plans/new"
            element={<AddCarePlan />}
          />
          <Route
            path="/patients/:id/soap-notes/new"
            element={<AddSoapNote />}
          />

          {/* Medications */}
          <Route path="/medications" element={<MedicationList />} />
          <Route path="/medications/new" element={<CreateMedication />} />
          <Route path="/medications/:id" element={<MedicationDetail />} />
          <Route path="/medications/:id/edit" element={<EditMedication />} />
          <Route path="/medications/edit/:id" element={<EditMedication />} />
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

          {/* Sales & Invoicing */}
          <Route path="/sales" element={<SalesList />} />
          <Route path="/sales/new" element={<CreateSale />} />
          <Route path="/sales/:id" element={<SaleDetail />} />
          <Route path="/sales/:id/receipt" element={<SaleReceipt />} />

          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/invoices/new" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/print" element={<InvoicePrint />} />

          <Route path="/payments" element={<PaymentsList />} />
          <Route path="/payments/new" element={<CreatePayment />} />
          <Route path="/payments/:id" element={<PaymentDetail />} />
          <Route path="/payments/:id/receipt" element={<PaymentReceipt />} />

          <Route path="/returns" element={<ReturnsList />} />
          <Route path="/returns/new" element={<CreateReturn />} />
          <Route path="/returns/:id" element={<ReturnDetail />} />

          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/credit" element={<CustomerCredit />} />

          <Route path="/invoices/batch" element={<BatchInvoice />} />

          <Route path="/reminders" element={<RemindersList />} />
          <Route path="/reminders/new" element={<CreateReminder />} />
          <Route path="/reminders/:id" element={<ReminderDetail />} />

          {/* Inventory Management */}
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/inventory/adjust" element={<InventoryAdjustment />} />
          <Route path="/inventory/movement" element={<InventoryMovement />} />
          <Route path="/inventory/products" element={<ProductList />} />
          <Route path="/inventory/products/new" element={<ProductForm />} />
          <Route path="/inventory/products/:id" element={<ProductForm />} />
          <Route
            path="/inventory/products/:id/inventory"
            element={<ProductInventory />}
          />
          <Route
            path="/inventory/products/:id/history"
            element={<ProductHistory />}
          />
          <Route path="/inventory/stock-levels" element={<StockLevelsList />} />
          <Route
            path="/inventory/price-management"
            element={<PriceManagementList />}
          />
          <Route
            path="/inventory/expiry-tracking"
            element={<ExpiryTrackingList />}
          />
          <Route path="/inventory/purchases" element={<PurchasesList />} />
          <Route
            path="/inventory/purchases/create"
            element={<CreatePurchase />}
          />
          <Route path="/inventory/customers" element={<CustomersList />} />
          <Route path="/inventory/suppliers" element={<SuppliersList />} />
          <Route
            path="/suppliers"
            element={<Navigate to="/inventory/suppliers" replace />}
          />
          <Route path="/inventory/locations" element={<LocationList />} />
          <Route path="/inventory/reports" element={<InventoryReportsList />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsModule />} />
          <Route path="/reports/patient" element={<PatientReports />} />
          <Route path="/reports/medication" element={<MedicationReports />} />
          <Route path="/reports/inventory" element={<InventoryReports />} />
          <Route path="/reports/sales" element={<SalesReports />} />
          <Route path="/reports/financial" element={<FinancialReports />} />
          <Route
            path="/reports/administrative"
            element={<AdministrativeReports />}
          />

          {/* Legacy Reports - Keeping for backward compatibility */}
          <Route path="/reports-old" element={<ReportsDashboard />} />
          <Route path="/reports-old/sales" element={<SalesReport />} />
          <Route path="/reports-old/inventory" element={<InventoryReport />} />
          <Route
            path="/reports-old/prescriptions"
            element={<PrescriptionReport />}
          />
          <Route path="/reports-old/patients" element={<PatientReport />} />
          <Route path="/reporting" element={<ReportingDashboard />} />

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

          {/* Calendar */}
          <Route path="/calendar" element={<CalendarPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationList />} />
          <Route
            path="/notifications/preferences"
            element={<NotificationPreferences />}
          />

          {/* Messages */}
          <Route path="/messages" element={<ConversationList />} />
          <Route path="/messages/:id" element={<ConversationDetail />} />

          {/* Report Generator */}
          <Route path="/report-generator" element={<ReportDashboard />} />
          <Route path="/report-generator/new" element={<ReportGenerator />} />
          <Route
            path="/report-generator/configurations"
            element={<ReportConfigurations />}
          />
          <Route
            path="/report-generator/edit/:id"
            element={<ReportGenerator />}
          />
          <Route path="/report-generator/view" element={<ReportGenerator />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* POS Module */}
          <Route path="/pos/sessions" element={<PosSessionsList />} />
          <Route path="/pos/sessions/new" element={<CreatePosSession />} />
          <Route path="/pos/sessions/:id" element={<PosSessionDetail />} />
          <Route path="/pos/terminal" element={<PosTerminal />} />
          <Route path="/pos/transactions" element={<PosTransactionsList />} />
          <Route
            path="/pos/transactions/:id"
            element={<PosTransactionDetail />}
          />
          <Route
            path="/pos/transactions/:id/receipt"
            element={<PosTransactionReceipt />}
          />

          {/* Finance Module */}
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/finance/reports" element={<FinanceReports />} />
          <Route path="/expenses" element={<ExpensesList />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />
          <Route path="/expenses/:id" element={<ExpenseForm />} />
          <Route path="/budgets" element={<BudgetsList />} />
          <Route path="/budgets/new" element={<BudgetForm />} />
          <Route path="/budgets/:id" element={<BudgetForm />} />

          {/* Accounting Module */}
          <Route path="/accounting" element={<AccountingDashboard />} />
          <Route path="/accounting/accounts" element={<AccountsList />} />
          <Route path="/accounting/accounts/new" element={<AccountForm />} />
          <Route path="/accounting/accounts/:id" element={<AccountDetail />} />
          <Route
            path="/accounting/accounts/:id/edit"
            element={<AccountForm />}
          />
          <Route
            path="/accounting/journal-entries"
            element={<JournalEntriesList />}
          />
          <Route
            path="/accounting/journal-entries/new"
            element={<JournalEntryForm />}
          />
          <Route
            path="/accounting/journal-entries/:id"
            element={<JournalEntryDetail />}
          />
          <Route
            path="/accounting/journal-entries/:id/edit"
            element={<JournalEntryForm />}
          />
          <Route
            path="/accounting/general-ledger"
            element={<GeneralLedgerList />}
          />
          <Route
            path="/accounting/general-ledger/trial-balance"
            element={<TrialBalance />}
          />
          <Route
            path="/accounting/financial-statements"
            element={<FinancialStatements />}
          />
          <Route path="/accounting/taxes" element={<TaxConfigurationsList />} />
          <Route
            path="/accounting/taxes/new"
            element={<TaxConfigurationForm />}
          />
          <Route
            path="/accounting/taxes/:id"
            element={<TaxConfigurationDetail />}
          />
          <Route
            path="/accounting/taxes/:id/edit"
            element={<TaxConfigurationForm />}
          />
          <Route
            path="/accounting/financial-periods"
            element={<FinancialPeriodsList />}
          />
          <Route
            path="/accounting/financial-periods/new"
            element={<FinancialPeriodForm />}
          />
          <Route
            path="/accounting/financial-periods/:id"
            element={<FinancialPeriodDetail />}
          />
          <Route
            path="/accounting/financial-periods/:id/edit"
            element={<FinancialPeriodForm />}
          />
          <Route path="/accounting/settings" element={<AccountingSettings />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
