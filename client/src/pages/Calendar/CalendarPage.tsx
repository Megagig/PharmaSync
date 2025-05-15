import React, { useState } from 'react';
import AppointmentCalendar from '@/components/domain/Calendar/AppointmentCalendar';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { formatDate } from '@/utils/date.utils';

const CalendarPage: React.FC = () => {
  const { appointments, isLoading } = useSelector((state: RootState) => state.appointments);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<string>('all');

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filter === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return appointmentDate >= today && appointmentDate < tomorrow;
      } else if (filter === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return appointmentDate >= today && appointmentDate < nextWeek;
      } else if (filter === 'month') {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return appointmentDate >= today && appointmentDate < nextMonth;
      }
      
      return appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments & Follow-ups</h1>
        <div className="flex space-x-2">
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setView('calendar')}
          >
            Calendar View
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            onClick={() => setView('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <Card>
          <div className="p-4">
            <AppointmentCalendar height={800} />
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
                <div className="flex space-x-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'today' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant={filter === 'week' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('week')}
                  >
                    This Week
                  </Button>
                  <Button
                    variant={filter === 'month' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('month')}
                  >
                    This Month
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming appointments found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Patient
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {upcomingAppointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(new Date(appointment.startTime))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(appointment.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' - '}
                              {new Date(appointment.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.type === 'follow_up'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.type === 'initial_consultation'
                                  ? 'bg-blue-100 text-blue-800'
                                  : appointment.type === 'medication_review'
                                  ? 'bg-orange-100 text-orange-800'
                                  : appointment.type === 'counseling'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {appointment.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.status === 'scheduled'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : appointment.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {appointment.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {appointment.description || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
