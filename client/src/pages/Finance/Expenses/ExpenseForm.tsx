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

const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentExpense, isLoading: expensesLoading, error: expensesError } = useSelector(
    (state: RootState) => state.expenses
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<ExpenseFormData>>({
    title: '',
    amount: 0,
    category: ExpenseCategory.OTHER,
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: ExpenseStatus.PENDING,
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchExpenseById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentExpense) {
      setFormData({
        title: currentExpense.title,
        amount: currentExpense.amount,
        category: currentExpense.category,
        subcategory: currentExpense.subcategory || '',
        date: currentExpense.date.split('T')[0],
        notes: currentExpense.notes || '',
        status: currentExpense.status,
      });
    }
  }, [currentExpense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? 0 : parseFloat(value) 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is changed
    if (formErrors[name as keyof ExpenseFormData]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ExpenseFormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const errors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }

    if (formData.amount && formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create a minimal object with just the required fields
      const minimalData = {
        title: formData.title?.trim(),
        amount: parseFloat(formData.amount?.toString() || '0'),
        category: formData.category,
        date: formData.date,
        createdBy: user?.id,
        status: ExpenseStatus.PENDING,
      };

      console.log('Sending minimal data:', minimalData);
      
      const response = await fetch(
        `http://localhost:5000/api/expenses${isEditMode ? `/${id}` : ''}`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(minimalData),
        }
      );

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
    } catch (err) {
      console.error('Error saving expense:', err);
      setFormErrors({
        ...formErrors,
        general: 'Failed to save expense. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (expensesLoading && isEditMode) {
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

      {expensesError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {expensesError}
        </div>
      )}

      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formErrors.general}
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
                value={formData.title || ''}
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
                value={formData.amount || 0}
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
                value={formData.category || ''}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  formErrors.category ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              >
                {Object.values(ExpenseCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
              )}
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
                value={formData.subcategory || ''}
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
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  formErrors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
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
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/expenses')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExpenseForm;
