import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  fetchAccounts,
} from '@/store/slices/accountingSlice';
import {
  JournalEntryType,
  JournalEntryFormData,
  JournalEntryItem,
} from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import TextArea from '@/components/common/TextArea/TextArea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/formatters';

const JournalEntryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentJournalEntry, accounts, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<JournalEntryFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    type: JournalEntryType.MANUAL,
    items: [
      {
        account: '',
        description: '',
        debit: 0,
        credit: 0,
      },
      {
        account: '',
        description: '',
        debit: 0,
        credit: 0,
      },
    ],
    isRecurring: false,
    recurringInterval: '',
    recurringEndDate: '',
    notes: '',
  });

  const [totals, setTotals] = useState({
    debit: 0,
    credit: 0,
    isBalanced: true,
  });

  useEffect(() => {
    // Load accounts for dropdown
    dispatch(fetchAccounts({ limit: 100 }) as any);

    if (isEditMode && id) {
      dispatch(fetchJournalEntryById(id) as any);
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentJournalEntry) {
      const items = currentJournalEntry.items.map((item) => ({
        account: typeof item.account === 'object' ? item.account._id : item.account,
        description: item.description || '',
        debit: item.debit,
        credit: item.credit,
      }));

      setFormData({
        date: new Date(currentJournalEntry.date).toISOString().split('T')[0],
        description: currentJournalEntry.description,
        reference: currentJournalEntry.reference || '',
        type: currentJournalEntry.type,
        items,
        isRecurring: currentJournalEntry.isRecurring,
        recurringInterval: currentJournalEntry.recurringInterval || '',
        recurringEndDate: currentJournalEntry.recurringEndDate
          ? new Date(currentJournalEntry.recurringEndDate).toISOString().split('T')[0]
          : '',
        notes: currentJournalEntry.notes || '',
      });
    }
  }, [currentJournalEntry, isEditMode]);

  useEffect(() => {
    // Calculate totals and check if balanced
    const debitTotal = formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.debit.toString()) || 0),
      0
    );
    const creditTotal = formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.credit.toString()) || 0),
      0
    );

    setTotals({
      debit: debitTotal,
      credit: creditTotal,
      isBalanced: Math.abs(debitTotal - creditTotal) < 0.001, // Allow for small floating point differences
    });
  }, [formData.items]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleItemChange = (
    index: number,
    field: keyof JournalEntryItem,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    
    if (field === 'debit' || field === 'credit') {
      // If entering a debit, clear the credit and vice versa
      if (field === 'debit' && parseFloat(value.toString()) > 0) {
        updatedItems[index].credit = 0;
      } else if (field === 'credit' && parseFloat(value.toString()) > 0) {
        updatedItems[index].debit = 0;
      }
      
      updatedItems[index][field] = parseFloat(value.toString()) || 0;
    } else {
      updatedItems[index][field as 'account' | 'description'] = value as string;
    }
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          account: '',
          description: '',
          debit: 0,
          credit: 0,
        },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.items.length <= 2) {
      showToast('Journal entry must have at least two line items', 'error');
      return;
    }
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!totals.isBalanced) {
      showToast('Debits and credits must balance', 'error');
      return;
    }

    // Validate that all accounts are selected
    const hasEmptyAccounts = formData.items.some((item) => !item.account);
    if (hasEmptyAccounts) {
      showToast('All line items must have an account selected', 'error');
      return;
    }

    try {
      if (isEditMode) {
        await dispatch(
          updateJournalEntry({ id: id!, updateData: formData }) as any
        );
        showToast('Journal entry updated successfully', 'success');
      } else {
        await dispatch(createJournalEntry(formData) as any);
        showToast('Journal entry created successfully', 'success');
      }
      navigate('/accounting/journal-entries');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Journal Entry' : 'Create Journal Entry'}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate('/accounting/journal-entries')}
        >
          Back to Journal Entries
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Entry Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Invoice number, check number, etc."
              />
              <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {Object.values(JournalEntryType).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-4">
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Line Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={item.account}
                          onChange={(e) =>
                            handleItemChange(index, 'account', e.target.value)
                          }
                          required
                        >
                          <option value="">Select Account</option>
                          {accounts.map((account) => (
                            <option key={account._id} value={account._id}>
                              {account.accountNumber} - {account.name}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.debit || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'debit', e.target.value)
                          }
                          placeholder="0.00"
                          className="text-right"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.credit || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'credit', e.target.value)
                          }
                          placeholder="0.00"
                          className="text-right"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="px-6 py-4 text-right">
                      Totals
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(totals.debit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(totals.credit)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {totals.isBalanced ? (
                        <span className="text-green-600">Balanced ✓</span>
                      ) : (
                        <span className="text-red-600">Unbalanced ✗</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="mb-4">
              <div className="flex items-center">
                <Checkbox
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                  This is a recurring journal entry
                </label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Select
                  label="Recurring Interval"
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleInputChange}
                  required={formData.isRecurring}
                >
                  <option value="">Select Interval</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Select>
                <Input
                  label="End Date"
                  name="recurringEndDate"
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={handleInputChange}
                  required={formData.isRecurring}
                />
              </div>
            )}

            <div>
              <TextArea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/accounting/journal-entries')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!totals.isBalanced}
          >
            {isEditMode ? 'Update Journal Entry' : 'Create Journal Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
