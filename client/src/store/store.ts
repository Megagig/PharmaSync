import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import medicationReducer from './slices/medicationSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import dispensingReducer from './slices/dispensingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    medications: medicationReducer,
    prescriptions: prescriptionReducer,
    dispensings: dispensingReducer,
    // Add other reducers here as they are created
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
