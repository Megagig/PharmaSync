import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/store/slices/appointmentSlice';
import { fetchPatients } from '@/store/slices/patientSlice';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { formatDate } from '@/utils/date.utils';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import AppointmentForm from './AppointmentForm';

interface AppointmentCalendarProps {
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  height?: string | number;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  initialView = 'dayGridMonth',
  height = 'auto',
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, isLoading } = useSelector((state: RootState) => state.appointments);
  const { patients } = useSelector((state: RootState) => state.patients);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchPatients({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (appointments) {
      const formattedEvents = appointments.map((appointment) => ({
        id: appointment._id,
        title: appointment.title,
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        extendedProps: {
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          description: appointment.description,
          type: appointment.type,
          status: appointment.status,
        },
        backgroundColor: getEventColor(appointment.type),
        borderColor: getEventColor(appointment.type),
      }));
      setEvents(formattedEvents);
    }
  }, [appointments]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'follow_up':
        return '#4CAF50'; // Green
      case 'initial_consultation':
        return '#2196F3'; // Blue
      case 'medication_review':
        return '#FF9800'; // Orange
      case 'counseling':
        return '#9C27B0'; // Purple
      default:
        return '#607D8B'; // Blue Grey
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start);
    setSelectedAppointment(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointment = appointments.find((a) => a._id === clickInfo.event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
      setIsViewMode(true);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    setIsViewMode(false);
  };

  const handleSaveAppointment = (appointmentData: any) => {
    if (selectedAppointment) {
      // Update existing appointment
      dispatch(updateAppointment({
        id: selectedAppointment._id,
        appointmentData: {
          ...appointmentData,
          patientName: getPatientName(appointmentData.patientId),
        },
      }));
    } else {
      // Create new appointment
      dispatch(createAppointment({
        ...appointmentData,
        patientName: getPatientName(appointmentData.patientId),
      }));
    }
    handleCloseModal();
  };

  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      dispatch(deleteAppointment(selectedAppointment._id));
      handleCloseModal();
    }
  };

  const handleEditClick = () => {
    setIsViewMode(false);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p._id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
    handleCloseModal();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          initialView={initialView}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height={height}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          isViewMode
            ? selectedAppointment?.title || 'Appointment Details'
            : selectedAppointment
            ? 'Edit Appointment'
            : 'New Appointment'
        }
      >
        {isViewMode ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Patient</h3>
              <p 
                className="text-base text-primary-600 cursor-pointer hover:underline"
                onClick={() => handlePatientClick(selectedAppointment.patientId)}
              >
                {selectedAppointment?.patientName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="text-base text-gray-900">
                {formatDate(new Date(selectedAppointment?.startTime))} - {' '}
                {new Date(selectedAppointment?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="text-base text-gray-900">
                {selectedAppointment?.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="text-base text-gray-900">
                {selectedAppointment?.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </p>
            </div>
            {selectedAppointment?.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-base text-gray-900">{selectedAppointment.description}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleEditClick}>
                Edit
              </Button>
              <Button variant="danger" onClick={handleDeleteAppointment}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <AppointmentForm
            initialData={selectedAppointment}
            selectedDate={selectedDate}
            patients={patients}
            onSave={handleSaveAppointment}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
