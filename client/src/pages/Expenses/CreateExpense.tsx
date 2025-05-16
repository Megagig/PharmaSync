import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createExpense } from '@/store/slices/expenseSlice';
import { ExpenseCategory, ExpenseStatus, RecurrenceInterval } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import TextArea from '@/components/common/TextArea/TextArea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

const CreateExpense = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.expenses);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: ExpenseCategory.OTHER,
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    supplier: '',
    location: '',
    notes: '',
    isRecurring: false,
    recurrenceInterval: RecurrenceInterval.NONE,
    recurrenceEndDate: '',
  });

  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch suppliers
    api.get('/suppliers?limit=100').then((response) => {
      setSuppliers(response.data.data);
    });

    // Fetch locations
    api.get('/locations?limit=100').then((response) => {
      setLocations(response.data.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'amount') {
      // Only allow numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.amount || !formData.date) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Prepare data for submission
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      supplier: formData.supplier || undefined,
      location: formData.location || undefined,
      dueDate: formData.dueDate || undefined,
      recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : undefined,
      recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : undefined,
    };

    dispatch(createExpense(expenseData))
      .unwrap()
      .then((response) => {
        showToast('Expense created successfully', 'success');
        navigate(`/expenses/${response._id}`);
      })
      .catch((err) => {
        showToast(err || 'Failed to create expense', 'error');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/expenses')}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Amount (₦)"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {Object.values(ExpenseCategory).map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </Select>

            <Input
              label="Subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
            />

            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(date) => handleDateChange(date, 'date')}
              required
            />

            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(date) => handleDateChange(date, 'dueDate')}
            />

            <Select
              label="Supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </Select>

            <Select
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                </option>
              ))}
            </Select>

            <div className="md:col-span-2">
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <TextArea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Checkbox
                label="Is this a recurring expense?"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
              />
            </div>

            {formData.isRecurring && (
              <>
                <Select
                  label="Recurrence Interval"
                  name="recurrenceInterval"
                  value={formData.recurrenceInterval}
                  onChange={handleChange}
                  required={formData.isRecurring}
                >
                  {Object.values(RecurrenceInterval).filter(interval => interval !== RecurrenceInterval.NONE).map((interval) => (
                    <option key={interval} value={interval}>
                      {interval.replace(/_/g, ' ').toLowerCase()}
                    </option>
                  ))}
                </Select>

                <DatePicker
                  label="Recurrence End Date"
                  value={formData.recurrenceEndDate}
                  onChange={(date) => handleDateChange(date, 'recurrenceEndDate')}
                />
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Create Expense
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default CreateExpense;
