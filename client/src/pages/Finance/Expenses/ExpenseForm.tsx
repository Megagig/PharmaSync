import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchExpenseById } from '@/store/slices/expenseSlice';
import {
  ExpenseCategory,
  ExpenseFormData,
  RecurrenceInterval,
  ExpenseStatus,
} from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';

const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentExpense, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const isEditMode = !!id;

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    amount: 0,
    category: ExpenseCategory.OTHER,
    subcategory: '',
    date: new Date().toISOString().split('T')[0], // Use ISO format: YYYY-MM-DD
    notes: '',
    // Hidden fields with default values
    dueDate: '',
    supplier: '',
    location: '',
    isRecurring: false,
    recurrenceInterval: RecurrenceInterval.NONE,
    recurrenceEndDate: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchExpenseById(id) as any);
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentExpense) {
      // Format dates to ISO format (YYYY-MM-DD)
      const formatToISODate = (
        dateString: string | Date | undefined
      ): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      };

      // Handle supplier and location which might be objects or strings
      const getSupplierValue = () => {
        if (!currentExpense.supplier) return '';
        if (typeof currentExpense.supplier === 'string')
          return currentExpense.supplier;
        if (
          typeof currentExpense.supplier === 'object' &&
          currentExpense.supplier._id
        )
          return currentExpense.supplier._id;
        return '';
      };

      const getLocationValue = () => {
        if (!currentExpense.location) return '';
        if (typeof currentExpense.location === 'string')
          return currentExpense.location;
        if (
          typeof currentExpense.location === 'object' &&
          currentExpense.location._id
        )
          return currentExpense.location._id;
        return '';
      };

      setFormData({
        title: currentExpense.title,
        description: currentExpense.description || '',
        amount: currentExpense.amount,
        category: currentExpense.category,
        subcategory: currentExpense.subcategory || '',
        date: formatToISODate(currentExpense.date),
        dueDate: currentExpense.dueDate
          ? formatToISODate(currentExpense.dueDate)
          : '',
        supplier: getSupplierValue(),
        location: getLocationValue(),
        notes: currentExpense.notes || '',
        isRecurring: currentExpense.isRecurring,
        recurrenceInterval: currentExpense.recurrenceInterval,
        recurrenceEndDate: currentExpense.recurrenceEndDate
          ? formatToISODate(currentExpense.recurrenceEndDate)
          : '',
      });
    }
  }, [isEditMode, currentExpense]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      const parsedValue = value === '' ? 0 : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(parsedValue) ? 0 : parsedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (
      formData.isRecurring &&
      formData.recurrenceInterval === RecurrenceInterval.NONE
    ) {
      errors.recurrenceInterval =
        'Recurrence interval is required for recurring expenses';
    }

    if (formData.isRecurring && !formData.recurrenceEndDate) {
      errors.recurrenceEndDate =
        'Recurrence end date is required for recurring expenses';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Function to convert date from MM/DD/YYYY to YYYY-MM-DD
      const formatDateForBackend = (dateString: string): string => {
        if (!dateString) return '';

        // Check if the date is already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }

        // Handle MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // parts[0] = month, parts[1] = day, parts[2] = year
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(
            2,
            '0'
          )}`;
        }

        // If we can't parse it, create a new date and format it
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }

        // Return today's date as fallback
        return new Date().toISOString().split('T')[0];
      };

      // Format the data to match the backend expectations
      const formattedData = {
        // Only include the essential fields
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formatDateForBackend(formData.date),
        // Optional fields
        description:
          formData.description && formData.description.trim() !== ''
            ? formData.description
            : undefined,
        subcategory:
          formData.subcategory && formData.subcategory.trim() !== ''
            ? formData.subcategory
            : undefined,
        notes:
          formData.notes && formData.notes.trim() !== ''
            ? formData.notes
            : undefined,
        // Recurring expense fields
        isRecurring: formData.isRecurring || false,
        recurrenceInterval: formData.isRecurring
          ? formData.recurrenceInterval
          : undefined,
        recurrenceEndDate:
          formData.isRecurring && formData.recurrenceEndDate
            ? formatDateForBackend(formData.recurrenceEndDate)
            : undefined,
        // Required by backend but not shown to user
        status: ExpenseStatus.PENDING,
        createdBy: user?.id,
      };

      // Log the data being sent to the backend
      console.log('Sending expense data to backend:', formattedData);

      // Use formattedData directly - it already has all the required fields
      const finalData = {
        ...formData, // Include all form data for type compatibility
        ...formattedData, // Override with formatted values
      };

      console.log('Final expense data:', finalData);

      try {
        // Create a minimal object with just the required fields in the exact format expected by the server
        const minimalData = {
          title: formData.title.trim(),
          amount: parseFloat(formData.amount.toString()),
          category: formData.category.toString(),
          date: formData.date,
          createdBy: user?.id,
        };

        console.log('Sending minimal data:', minimalData);

        // Use axios directly to bypass any potential transformations
        const response = await fetch('http://localhost:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(minimalData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to save expense');
        }

        const data = await response.json();
        console.log('Success response:', data);

        if (data && data.data && data.data._id) {
          navigate(`/expenses/${data.data._id}`);
        } else {
          navigate('/expenses');
        }
      } catch (error) {
        console.error('Error saving expense:', error);
        // Show error to user
        alert('Failed to save expense. Please check the form and try again.');
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Expense' : 'Create Expense'}
        </h1>
        <Card>
          <div className="p-4">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Expense' : 'Create Expense'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/expenses')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  formErrors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount (₦) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`block w-full px-3 py-2 border ${
                  formErrors.amount ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                {Object.values(ExpenseCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="subcategory"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subcategory
              </label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                pattern="\d{4}-\d{2}-\d{2}" // Enforce YYYY-MM-DD format
                placeholder="YYYY-MM-DD"
                className={`block w-full px-3 py-2 border ${
                  formErrors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
              )}
            </div>

            {/* Due Date, Supplier, and Location fields removed */}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange(e)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRecurring"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                This is a recurring expense
              </label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label
                    htmlFor="recurrenceInterval"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recurrence Interval *
                  </label>
                  <select
                    id="recurrenceInterval"
                    name="recurrenceInterval"
                    value={formData.recurrenceInterval}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      formErrors.recurrenceInterval
                        ? 'border-red-300'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  >
                    {Object.values(RecurrenceInterval).map((interval) => (
                      <option key={interval} value={interval}>
                        {interval === RecurrenceInterval.NONE
                          ? 'Select Interval'
                          : interval.charAt(0).toUpperCase() +
                            interval.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.recurrenceInterval && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.recurrenceInterval}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="recurrenceEndDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recurrence End Date *
                  </label>
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    name="recurrenceEndDate"
                    value={formData.recurrenceEndDate}
                    onChange={handleChange}
                    pattern="\d{4}-\d{2}-\d{2}" // Enforce YYYY-MM-DD format
                    placeholder="YYYY-MM-DD"
                    className={`block w-full px-3 py-2 border ${
                      formErrors.recurrenceEndDate
                        ? 'border-red-300'
                        : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  {formErrors.recurrenceEndDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.recurrenceEndDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/expenses')}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                ? 'Update Expense'
                : 'Create Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExpenseForm;
