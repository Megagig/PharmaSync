import React, { useState, useEffect } from 'react';
import { formatDateToISO, formatDateTimeToISO } from '@/utils/date.utils';
import Button from '@/components/common/Button/Button';
import { IPatient } from '@/types/patient.types';

interface AppointmentFormProps {
  initialData?: any;
  selectedDate?: Date | null;
  patients: IPatient[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  selectedDate,
  patients,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    patientId: '',
    startTime: '',
    endTime: '',
    type: 'follow_up',
    status: 'scheduled',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        patientId: initialData.patientId || '',
        startTime: formatDateTimeToISO(new Date(initialData.startTime)) || '',
        endTime: formatDateTimeToISO(new Date(initialData.endTime)) || '',
        type: initialData.type || 'follow_up',
        status: initialData.status || 'scheduled',
        description: initialData.description || '',
      });
    } else if (selectedDate) {
      // Set default times for a new appointment
      const startDate = new Date(selectedDate);
      startDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
      
      const endDate = new Date(selectedDate);
      endDate.setHours(10, 0, 0, 0); // Default to 10:00 AM (1 hour appointment)
      
      setFormData({
        ...formData,
        startTime: formatDateTimeToISO(startDate),
        endTime: formatDateTimeToISO(endDate),
      });
    }
  }, [initialData, selectedDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // If changing the patient, update the title
    if (name === 'patientId') {
      const patient = patients.find((p) => p._id === value);
      if (patient) {
        const appointmentType = formData.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        setFormData({
          ...formData,
          patientId: value,
          title: `${appointmentType} - ${patient.firstName} ${patient.lastName}`,
        });
      }
    }

    // If changing the type, update the title
    if (name === 'type') {
      const patient = patients.find((p) => p._id === formData.patientId);
      if (patient) {
        const appointmentType = value.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        setFormData({
          ...formData,
          type: value,
          title: `${appointmentType} - ${patient.firstName} ${patient.lastName}`,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
          Patient *
        </label>
        <select
          id="patientId"
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            required
          >
            <option value="follow_up">Follow-up</option>
            <option value="initial_consultation">Initial Consultation</option>
            <option value="medication_review">Medication Review</option>
            <option value="counseling">Counseling</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            required
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;
