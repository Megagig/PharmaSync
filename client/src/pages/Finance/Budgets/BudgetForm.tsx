import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchBudgetById } from '@/store/slices/budgetSlice';
import { BudgetPeriod, BudgetFormData } from '@/types/budget.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatDate } from '@/utils/date.utils';

const BudgetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBudget, isLoading, error } = useSelector(
    (state: RootState) => state.budgets
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const isEditMode = !!id;

  const [formData, setFormData] = useState<BudgetFormData>({
    title: '',
    description: '',
    period: BudgetPeriod.MONTHLY,
    startDate: new Date().toISOString().split('T')[0], // Use ISO format: YYYY-MM-DD
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split('T')[0], // Use ISO format: YYYY-MM-DD
    items: [
      {
        category: 'inventory',
        amount: 0,
      },
    ],
    location: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<
    Record<number, Record<string, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchBudgetById(id) as any);
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentBudget) {
      // Format dates to ISO format (YYYY-MM-DD)
      const formatToISODate = (
        dateString: string | Date | undefined
      ): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      };

      // Handle location which might be an object or string
      const getLocationValue = () => {
        if (!currentBudget.location) return '';
        if (typeof currentBudget.location === 'string')
          return currentBudget.location;
        if (
          typeof currentBudget.location === 'object' &&
          currentBudget.location._id
        )
          return currentBudget.location._id;
        return '';
      };

      setFormData({
        title: currentBudget.title,
        description: currentBudget.description || '',
        period: currentBudget.period,
        startDate: formatToISODate(currentBudget.startDate),
        endDate: formatToISODate(currentBudget.endDate),
        items: currentBudget.items.map((item) => ({
          category: item.category,
          subcategory: item.subcategory,
          amount: item.amount,
          notes: item.notes,
        })),
        location: getLocationValue(),
        notes: currentBudget.notes || '',
      });
    }
  }, [isEditMode, currentBudget]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
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

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    const updatedItems = [...formData.items];

    if (type === 'number') {
      const parsedValue = value === '' ? 0 : parseFloat(value);
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: isNaN(parsedValue) ? 0 : parsedValue,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear error when field is changed
    if (itemErrors[index] && itemErrors[index][name]) {
      setItemErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [name]: '',
        },
      }));
    }
  };

  const addBudgetItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          category: 'inventory',
          amount: 0,
        },
      ],
    }));
  };

  const removeBudgetItem = (index: number) => {
    if (formData.items.length === 1) {
      return; // Keep at least one item
    }

    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Remove errors for this item
    if (itemErrors[index]) {
      const updatedItemErrors = { ...itemErrors };
      delete updatedItemErrors[index];
      setItemErrors(updatedItemErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const newItemErrors: Record<number, Record<string, string>> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      errors.endDate = 'End date must be after start date';
    }

    // Validate budget items
    formData.items.forEach((item, index) => {
      const itemError: Record<string, string> = {};

      if (!item.category.trim()) {
        itemError.category = 'Category is required';
      }

      if (item.amount <= 0) {
        itemError.amount = 'Amount must be greater than 0';
      }

      if (Object.keys(itemError).length > 0) {
        newItemErrors[index] = itemError;
      }
    });

    setFormErrors(errors);
    setItemErrors(newItemErrors);

    return (
      Object.keys(errors).length === 0 &&
      Object.keys(newItemErrors).length === 0
    );
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
        ...formData,
        // Convert dates to YYYY-MM-DD format
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatDateForBackend(formData.endDate),
        // Add the user ID as createdBy (required by the backend)
        createdBy: user?.id,
        // Set status to DRAFT by default
        status: 'draft',
        // Format items to ensure they match the backend expectations
        items: formData.items.map((item) => ({
          category: item.category,
          subcategory:
            item.subcategory && item.subcategory.trim() !== ''
              ? item.subcategory
              : undefined,
          amount: item.amount,
          notes:
            item.notes && item.notes.trim() !== '' ? item.notes : undefined,
        })),
        // Remove empty strings for optional fields
        location:
          formData.location && formData.location.trim() !== ''
            ? formData.location
            : undefined,
        description:
          formData.description && formData.description.trim() !== ''
            ? formData.description
            : undefined,
        notes:
          formData.notes && formData.notes.trim() !== ''
            ? formData.notes
            : undefined,
      };

      // Log the data being sent to the backend
      console.log('Sending budget data to backend:', formattedData);

      // Make sure required fields are present and valid
      const finalData = {
        title: formattedData.title || '',
        period: formattedData.period || 'monthly',
        startDate: formattedData.startDate,
        endDate: formattedData.endDate,
        status: formattedData.status,
        createdBy: formattedData.createdBy,
        items: formattedData.items.map((item) => ({
          category: item.category || 'other',
          amount: typeof item.amount === 'number' ? item.amount : 0,
          subcategory: item.subcategory,
          notes: item.notes,
        })),
        // Include other fields
        description: formattedData.description,
        location: formattedData.location,
        notes: formattedData.notes,
      };

      console.log('Final budget data:', finalData);

      try {
        // Create a minimal object with just the required fields in the exact format expected by the server
        const minimalData = {
          title: formData.title.trim(),
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
          items: formData.items.map((item) => ({
            category: item.category.trim(),
            amount: parseFloat(item.amount.toString()),
            subcategory: item.subcategory || '',
            notes: item.notes || '',
          })),
          createdBy: user?.id,
        };

        console.log('Sending minimal budget data:', minimalData);

        // Use fetch directly to bypass any potential transformations
        const response = await fetch('http://localhost:5000/api/budgets', {
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
          throw new Error(errorData.message || 'Failed to save budget');
        }

        const data = await response.json();
        console.log('Success response:', data);

        if (data && data.data && data.data._id) {
          navigate(`/budgets/${data.data._id}`);
        } else {
          navigate('/budgets');
        }
      } catch (error) {
        console.error('Error saving budget:', error);
        // Show error to user
        alert('Failed to save budget. Please check the form and try again.');
      }
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalBudget = (): number => {
    return formData.items.reduce(
      (total, item) => total + (item.amount || 0),
      0
    );
  };

  if (isLoading && isEditMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Budget' : 'Create Budget'}
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
          {isEditMode ? 'Edit Budget' : 'Create Budget'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/budgets')}>
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
                htmlFor="period"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Budget Period *
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                {Object.values(BudgetPeriod).map((period) => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                pattern="\d{4}-\d{2}-\d{2}" // Enforce YYYY-MM-DD format
                placeholder="YYYY-MM-DD"
                className={`block w-full px-3 py-2 border ${
                  formErrors.startDate ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.startDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                pattern="\d{4}-\d{2}-\d{2}" // Enforce YYYY-MM-DD format
                placeholder="YYYY-MM-DD"
                className={`block w-full px-3 py-2 border ${
                  formErrors.endDate ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {formErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.endDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Budget Items
              </h3>
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-gray-700">
                  Total Budget:{' '}
                  <span className="font-bold">
                    ₦{calculateTotalBudget().toLocaleString()}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={addBudgetItem}
                >
                  Add Item
                </Button>
              </div>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Item {index + 1}
                  </h4>
                  <Button
                    variant="text"
                    size="sm"
                    type="button"
                    onClick={() => removeBudgetItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor={`category-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <input
                      type="text"
                      id={`category-${index}`}
                      name="category"
                      value={item.category}
                      onChange={(e) => handleItemChange(index, e)}
                      className={`block w-full px-3 py-2 border ${
                        itemErrors[index]?.category
                          ? 'border-red-300'
                          : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {itemErrors[index]?.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {itemErrors[index].category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`subcategory-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subcategory
                    </label>
                    <input
                      type="text"
                      id={`subcategory-${index}`}
                      name="subcategory"
                      value={item.subcategory || ''}
                      onChange={(e) => handleItemChange(index, e)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`amount-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount (₦) *
                    </label>
                    <input
                      type="number"
                      id={`amount-${index}`}
                      name="amount"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, e)}
                      min="0"
                      step="0.01"
                      className={`block w-full px-3 py-2 border ${
                        itemErrors[index]?.amount
                          ? 'border-red-300'
                          : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {itemErrors[index]?.amount && (
                      <p className="mt-1 text-sm text-red-600">
                        {itemErrors[index].amount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`notes-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id={`notes-${index}`}
                    name="notes"
                    rows={2}
                    value={item.notes || ''}
                    onChange={(e) => handleItemChange(index, e)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            ))}
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
              onClick={() => navigate('/budgets')}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                ? 'Update Budget'
                : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BudgetForm;
