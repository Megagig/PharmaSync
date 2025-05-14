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
import userReducer from './slices/userSlice';
import activityLogReducer from './slices/activityLogSlice';
import scheduleReducer from './slices/scheduleSlice';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';

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
    users: userReducer,
    activityLogs: activityLogReducer,
    schedule: scheduleReducer,
    notifications: notificationReducer,
    messages: messageReducer,
    // Add other reducers here as they are created
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
