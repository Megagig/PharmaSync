import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import medicationReducer from './slices/medicationSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import dispensingReducer from './slices/dispensingSlice';
import supplierReducer from './slices/supplierSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';
import inventoryReducer from './slices/inventorySlice';
import reportsReducer from './slices/reportsSlice';
import reportReducer from './slices/reportSlice';
import reportingReducer from './slices/reportingSlice';
import comprehensiveReportsReducer from './slices/comprehensiveReportsSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import activityLogReducer from './slices/activityLogSlice';
import scheduleReducer from './slices/scheduleSlice';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';
import dashboardReducer from './slices/dashboardSlice';
import appointmentReducer from './slices/appointmentSlice';
import salesReducer from './slices/salesSlice';
import invoicesReducer from './slices/invoicesSlice';
import paymentsReducer from './slices/paymentsSlice';
import returnsReducer from './slices/returnsSlice';
import creditReducer from './slices/creditSlice';
import remindersReducer from './slices/remindersSlice';
import customersReducer from './slices/customersSlice';
import posReducer from './slices/posSlice';
import expenseReducer from './slices/expenseSlice';
import budgetReducer from './slices/budgetSlice';
import accountingReducer from './slices/accountingSlice';
import rxnavReducer from './slices/rxnavSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    medications: medicationReducer,
    prescriptions: prescriptionReducer,
    dispensings: dispensingReducer,
    suppliers: supplierReducer,
    purchaseOrders: purchaseOrderReducer,
    inventory: inventoryReducer,
    reports: reportsReducer,
    report: reportReducer,
    comprehensiveReports: comprehensiveReportsReducer,
    users: userReducer,
    roles: roleReducer,
    activityLogs: activityLogReducer,
    schedule: scheduleReducer,
    notifications: notificationReducer,
    messages: messageReducer,
    dashboard: dashboardReducer,
    appointments: appointmentReducer,
    reporting: reportingReducer,
    sales: salesReducer,
    invoices: invoicesReducer,
    payments: paymentsReducer,
    returns: returnsReducer,
    credit: creditReducer,
    reminders: remindersReducer,
    customers: customersReducer,
    pos: posReducer,
    expenses: expenseReducer,
    budgets: budgetReducer,
    accounting: accountingReducer,
    rxnav: rxnavReducer,
    // Add other reducers here as they are created
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
