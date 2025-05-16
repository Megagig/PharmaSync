import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { createBudget } from '@/store/slices/budgetSlice';
import { BudgetPeriod, BudgetStatus } from '@/types/budget.types';
import { ExpenseCategory } from '@/types/expense.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';
import TextArea from '@/components/common/TextArea/TextArea';
import Table from '@/components/common/Table/Table';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

const CreateBudget = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isLoading, error } = useSelector((state: RootState) => state.budgets);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    period: BudgetPeriod.MONTHLY,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: BudgetStatus.DRAFT,
    location: '',
    notes: '',
  });

  const [budgetItems, setBudgetItems] = useState<
    {
      category: ExpenseCategory;
      subcategory?: string;
      amount: string;
      notes?: string;
    }[]
  >([]);

  const [newItem, setNewItem] = useState({
    category: ExpenseCategory.OTHER,
    subcategory: '',
    amount: '',
    notes: '',
  });

  const [locations, setLocations] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch locations
    api.get('/locations?limit=100').then((response) => {
      setLocations(response.data.data);
    });

    // Set default end date based on period
    updateEndDate(formData.period, formData.startDate);
  }, []);

  const updateEndDate = (period: BudgetPeriod, startDate: string) => {
    if (!startDate) return;

    const start = new Date(startDate);
    let end = new Date(start);

    switch (period) {
      case BudgetPeriod.MONTHLY:
        end.setMonth(start.getMonth() + 1);
        end.setDate(0); // Last day of the month
        break;
      case BudgetPeriod.QUARTERLY:
        end.setMonth(start.getMonth() + 3);
        end.setDate(0); // Last day of the quarter
        break;
      case BudgetPeriod.YEARLY:
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1); // Last day of the year
        break;
      case BudgetPeriod.CUSTOM:
        // Don't change the end date for custom period
        return;
    }

    setFormData((prev) => ({
      ...prev,
      endDate: end.toISOString().split('T')[0],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'period') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      updateEndDate(value as BudgetPeriod, formData.startDate);
    } else if (name === 'startDate') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      updateEndDate(formData.period, value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Only allow numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setNewItem((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddItem = () => {
    if (!newItem.category || !newItem.amount) {
      showToast('Category and amount are required', 'error');
      return;
    }

    setBudgetItems((prev) => [
      ...prev,
      {
        ...newItem,
        amount: newItem.amount,
      },
    ]);

    // Reset new item form
    setNewItem({
      category: ExpenseCategory.OTHER,
      subcategory: '',
      amount: '',
      notes: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    setBudgetItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.startDate || !formData.endDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (budgetItems.length === 0) {
      showToast('Please add at least one budget item', 'error');
      return;
    }

    // Prepare data for submission
    const budgetData = {
      ...formData,
      items: budgetItems.map((item) => ({
        category: item.category,
        subcategory: item.subcategory || undefined,
        amount: parseFloat(item.amount),
        notes: item.notes || undefined,
      })),
      location: formData.location || undefined,
    };

    dispatch(createBudget(budgetData))
      .unwrap()
      .then((response) => {
        showToast('Budget created successfully', 'success');
        navigate(`/budgets/${response._id}`);
      })
      .catch((err) => {
        showToast(err || 'Failed to create budget', 'error');
      });
  };

  const budgetItemsColumns = [
    {
      header: 'Category',
      accessor: 'category',
      cell: (row: any) => (
        <span className="capitalize">
          {row.category.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Subcategory',
      accessor: 'subcategory',
      cell: (row: any) => row.subcategory || 'N/A',
    },
    {
      header: 'Amount (₦)',
      accessor: 'amount',
      cell: (row: any) => row.amount,
    },
    {
      header: 'Notes',
      accessor: 'notes',
      cell: (row: any) => row.notes || 'N/A',
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any, index: number) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleRemoveItem(index)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Budget</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/budgets')}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
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

                <Select
                  label="Period"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  required
                >
                  {Object.values(BudgetPeriod).map((period) => (
                    <option key={period} value={period}>
                      {period.charAt(0).toUpperCase() + period.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </Select>

                <DatePicker
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      startDate: date,
                    }));
                    updateEndDate(formData.period, date);
                  }}
                  required
                />

                <DatePicker
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: date,
                    }))
                  }
                  required
                  disabled={formData.period !== BudgetPeriod.CUSTOM}
                />

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
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Budget Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Select
                  label="Category"
                  name="category"
                  value={newItem.category}
                  onChange={handleNewItemChange}
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
                  value={newItem.subcategory}
                  onChange={handleNewItemChange}
                />

                <Input
                  label="Amount (₦)"
                  name="amount"
                  value={newItem.amount}
                  onChange={handleNewItemChange}
                  required
                />

                <Input
                  label="Notes"
                  name="notes"
                  value={newItem.notes}
                  onChange={handleNewItemChange}
                />
              </div>

              <div className="flex justify-end mb-6">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </div>

              <Table
                columns={budgetItemsColumns}
                data={budgetItems}
                isLoading={false}
                error={null}
              />

              {budgetItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No budget items added yet. Add at least one item to create a budget.
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={budgetItems.length === 0}
            >
              Create Budget
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateBudget;
