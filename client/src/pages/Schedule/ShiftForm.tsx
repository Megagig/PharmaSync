import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '@/store/store';
import {
  fetchShiftById,
  createShift,
  updateShift,
  deleteShift,
  clearCurrentShift,
} from '@/store/slices/scheduleSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { ShiftType, RecurrenceType, ScheduleShiftFormData } from '@/types/schedule.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';

const ShiftForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentShift, isLoading, error } = useSelector((state: RootState) => state.schedule);
  const { users } = useSelector((state: RootState) => state.users);

  const [formData, setFormData] = useState<ScheduleShiftFormData>({
    user: '',
    shiftType: ShiftType.MORNING,
    startTime: '',
    endTime: '',
    notes: '',
    isRecurring: false,
    recurrenceType: RecurrenceType.NONE,
    recurrenceEndDate: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    
    if (isEditMode && id) {
      dispatch(fetchShiftById(id));
    }

    return () => {
      dispatch(clearCurrentShift());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentShift && isEditMode) {
      setFormData({
        user: typeof currentShift.user === 'string' ? currentShift.user : currentShift.user.id,
        shiftType: currentShift.shiftType,
        startTime: new Date(currentShift.startTime).toISOString().slice(0, 16),
        endTime: new Date(currentShift.endTime).toISOString().slice(0, 16),
        notes: currentShift.notes || '',
        isRecurring: currentShift.isRecurring,
        recurrenceType: currentShift.recurrenceType || RecurrenceType.NONE,
        recurrenceEndDate: currentShift.recurrenceEndDate
          ? new Date(currentShift.recurrenceEndDate).toISOString().slice(0, 10)
          : '',
      });
    }
  }, [currentShift, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && id) {
        await dispatch(updateShift({ id, updateData: formData }));
      } else {
        await dispatch(createShift(formData));
      }
      
      navigate('/schedule');
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await dispatch(deleteShift(id));
      navigate('/schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Shift' : 'Create New Shift'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/schedule')}>
          Back to Schedule
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  Staff Member *
                </label>
                <div className="mt-1">
                  <select
                    id="user"
                    name="user"
                    className="form-select"
                    value={formData.user}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700">
                  Shift Type *
                </label>
                <div className="mt-1">
                  <select
                    id="shiftType"
                    name="shiftType"
                    className="form-select"
                    value={formData.shiftType}
                    onChange={handleChange}
                    required
                  >
                    {Object.values(ShiftType).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    className="form-input"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    className="form-input"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="form-textarea"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                    Recurring Shift
                  </label>
                </div>
              </div>

              {formData.isRecurring && (
                <>
                  <div className="sm:col-span-3">
                    <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700">
                      Recurrence Pattern
                    </label>
                    <div className="mt-1">
                      <select
                        id="recurrenceType"
                        name="recurrenceType"
                        className="form-select"
                        value={formData.recurrenceType}
                        onChange={handleChange}
                        required={formData.isRecurring}
                      >
                        {Object.values(RecurrenceType).filter((type) => type !== RecurrenceType.NONE).map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="recurrenceEndDate"
                        name="recurrenceEndDate"
                        className="form-input"
                        value={formData.recurrenceEndDate}
                        onChange={handleChange}
                        required={formData.isRecurring}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {isEditMode && (
                <Button
                  variant="danger"
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Shift
                </Button>
              )}
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate('/schedule')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
              >
                {isEditMode ? 'Update Shift' : 'Create Shift'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete this shift? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete Shift
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShiftForm;
