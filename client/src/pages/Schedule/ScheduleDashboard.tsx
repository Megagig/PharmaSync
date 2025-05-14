import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchShifts } from '@/store/slices/scheduleSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { ShiftType } from '@/types/schedule.types';
import { formatDateToISO } from '@/utils/date.utils';

const ScheduleDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { shifts, isLoading, error } = useSelector((state: RootState) => state.schedule);
  const { users } = useSelector((state: RootState) => state.users);
  const { currentUser } = useSelector((state: RootState) => state.auth);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    loadShifts();
  }, [dispatch, currentDate, viewMode]);

  const loadShifts = () => {
    const startDate = getStartDate();
    const endDate = getEndDate();
    
    dispatch(
      fetchShifts({
        startDate: formatDateToISO(startDate),
        endDate: formatDateToISO(endDate),
        limit: 100,
      })
    );
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
    } else {
      date.setDate(1);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
    }
    return date;
  };

  const getDaysInRange = () => {
    const days = [];
    const startDate = getStartDate();
    const endDate = getEndDate();
    
    const currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getShiftColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case ShiftType.MORNING:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case ShiftType.AFTERNOON:
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case ShiftType.EVENING:
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case ShiftType.NIGHT:
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case ShiftType.FULL_DAY:
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const formatShiftTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const isCurrentUserShift = (userId: string) => {
    return currentUser?.id === userId;
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = () => {
    const startDate = getStartDate();
    const endDate = getEndDate();
    
    if (viewMode === 'week') {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    } else {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Schedule</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/schedule/time-off')}>
            Time Off Requests
          </Button>
          <Button variant="primary" onClick={() => navigate('/schedule/shifts/new')}>
            Add Shift
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex space-x-2 mb-4 sm:mb-0">
              <Button variant="outline" onClick={navigatePrevious} size="sm">
                Previous
              </Button>
              <Button variant="outline" onClick={navigateToday} size="sm">
                Today
              </Button>
              <Button variant="outline" onClick={navigateNext} size="sm">
                Next
              </Button>
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">
              {formatDateRange()}
            </h2>
            
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'week' ? 'primary' : 'outline'}
                onClick={() => setViewMode('week')}
                size="sm"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'primary' : 'outline'}
                onClick={() => setViewMode('month')}
                size="sm"
              >
                Month
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading schedule...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <div key={day} className="p-2 text-center font-medium bg-gray-100 rounded-t-md">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {getDaysInRange().map((date) => (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[150px] p-2 border rounded-md ${
                      isToday(date) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="text-right text-sm font-medium mb-2">
                      {date.getDate()}
                    </div>
                    <div className="space-y-2">
                      {getShiftsForDay(date).map((shift) => (
                        <div
                          key={shift.id}
                          className={`p-1 text-xs border rounded ${getShiftColor(shift.shiftType)} ${
                            isCurrentUserShift(typeof shift.user === 'string' ? shift.user : shift.user.id)
                              ? 'border-2'
                              : ''
                          }`}
                          onClick={() => navigate(`/schedule/shifts/${shift.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="font-medium">
                            {typeof shift.user === 'string'
                              ? getUserName(shift.user)
                              : `${shift.user.firstName} ${shift.user.lastName}`}
                          </div>
                          <div>
                            {shift.shiftType.charAt(0).toUpperCase() + shift.shiftType.slice(1)}
                          </div>
                          <div>{formatShiftTime(shift.startTime, shift.endTime)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScheduleDashboard;
