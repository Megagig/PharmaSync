import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchTaxConfigurationById,
  createTaxConfiguration,
  updateTaxConfiguration,
  fetchAccounts,
} from '@/store/slices/accountingSlice';
import {
  TaxType,
  TaxConfigurationFormData,
  AccountType,
  AccountCategory,
} from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import TextArea from '@/components/common/TextArea/TextArea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';

const TaxConfigurationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentTaxConfiguration, accounts, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<TaxConfigurationFormData>({
    name: '',
    type: TaxType.VAT,
    rate: 0,
    description: '',
    isActive: true,
    isDefault: false,
    accountId: '',
  });

  const [liabilityAccounts, setLiabilityAccounts] = useState<{ _id: string; accountNumber: string; name: string }[]>([]);

  useEffect(() => {
    // Load accounts for dropdown
    dispatch(fetchAccounts({ 
      filters: { 
        type: AccountType.LIABILITY,
        category: AccountCategory.CURRENT_LIABILITY
      } 
    }) as any);

    if (isEditMode && id) {
      dispatch(fetchTaxConfigurationById(id) as any);
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentTaxConfiguration) {
      setFormData({
        name: currentTaxConfiguration.name,
        type: currentTaxConfiguration.type,
        rate: currentTaxConfiguration.rate,
        description: currentTaxConfiguration.description || '',
        isActive: currentTaxConfiguration.isActive,
        isDefault: currentTaxConfiguration.isDefault,
        accountId: typeof currentTaxConfiguration.accountId === 'object' 
          ? currentTaxConfiguration.accountId._id 
          : currentTaxConfiguration.accountId || '',
      });
    }
  }, [currentTaxConfiguration, isEditMode]);

  useEffect(() => {
    // Filter accounts that are liability accounts
    if (accounts.length > 0) {
      const filtered = accounts.filter(
        (account) => account.type === AccountType.LIABILITY
      );
      setLiabilityAccounts(filtered);
    }
  }, [accounts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await dispatch(
          updateTaxConfiguration({ id: id!, updateData: formData }) as any
        );
        showToast('Tax configuration updated successfully', 'success');
      } else {
        await dispatch(createTaxConfiguration(formData) as any);
        showToast('Tax configuration created successfully', 'success');
      }
      navigate('/accounting/taxes');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const formatTaxType = (type: TaxType) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Tax Configuration' : 'Create New Tax Configuration'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/accounting/taxes')}>
          Back to Tax Configurations
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
            <h2 className="text-lg font-semibold mb-4">Tax Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Tax Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Tax Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {Object.values(TaxType).map((type) => (
                  <option key={type} value={type}>
                    {formatTaxType(type)}
                  </option>
                ))}
              </Select>
              <Input
                label="Rate (%)"
                name="rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rate.toString()}
                onChange={handleNumberChange}
                required
              />
              <Select
                label="Tax Account"
                name="accountId"
                value={formData.accountId}
                onChange={handleInputChange}
              >
                <option value="">Select Account</option>
                {liabilityAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountNumber} - {account.name}
                  </option>
                ))}
              </Select>
              <div className="flex items-center mt-4">
                <Checkbox
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex items-center mt-4">
                <Checkbox
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default for this tax type
                </label>
              </div>
            </div>
            <div className="mt-6">
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
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
            onClick={() => navigate('/accounting/taxes')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditMode ? 'Update Tax Configuration' : 'Create Tax Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaxConfigurationForm;
