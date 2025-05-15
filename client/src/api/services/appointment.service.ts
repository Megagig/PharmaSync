import api from '../api';
import { Appointment } from '@/store/slices/appointmentSlice';

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments');
  return response.data.data;
};

export const getAppointment = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data.data;
};

export const createAppointment = async (appointmentData: any): Promise<Appointment> => {
  const response = await api.post('/appointments', appointmentData);
  return response.data.data;
};

export const updateAppointment = async (
  id: string,
  appointmentData: any
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}`, appointmentData);
  return response.data.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await api.delete(`/appointments/${id}`);
};
