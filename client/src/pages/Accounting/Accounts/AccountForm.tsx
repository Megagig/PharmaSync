import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchAccountById,
  createAccount,
  updateAccount,
  fetchAccounts,
} from '@/store/slices/accountingSlice';
import {
  AccountType,
  AccountCategory,
  AccountStatus,
  AccountFormData,
} from '@/types/accounting.types';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Select from '@/components/common/Select/Select';
import TextArea from '@/components/common/TextArea/TextArea';
import Checkbox from '@/components/common/Checkbox/Checkbox';
import { useToast } from '@/hooks/useToast';

const AccountForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentAccount, accounts, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<AccountFormData>({
    accountNumber: '',
    name: '',
    description: '',
    type: AccountType.ASSET,
    category: AccountCategory.CURRENT_ASSET,
    parentAccount: '',
    isSubAccount: false,
    status: AccountStatus.ACTIVE,
    openingBalance: 0,
    notes: '',
  });

  const [parentAccounts, setParentAccounts] = useState<{ _id: string; accountNumber: string; name: string }[]>([]);

  useEffect(() => {
    // Load parent accounts for dropdown
    dispatch(fetchAccounts({ filters: { isSubAccount: false } }) as any);

    if (isEditMode && id) {
      dispatch(fetchAccountById(id) as any);
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentAccount) {
      setFormData({
        accountNumber: currentAccount.accountNumber,
        name: currentAccount.name,
        description: currentAccount.description || '',
        type: currentAccount.type,
        category: currentAccount.category,
        parentAccount: typeof currentAccount.parentAccount === 'object' 
          ? currentAccount.parentAccount._id 
          : currentAccount.parentAccount || '',
        isSubAccount: currentAccount.isSubAccount,
        status: currentAccount.status,
        openingBalance: currentAccount.openingBalance,
        notes: currentAccount.notes || '',
      });
    }
  }, [currentAccount, isEditMode]);

  useEffect(() => {
    // Filter accounts that can be parents (not sub-accounts themselves)
    if (accounts.length > 0) {
      const filtered = accounts.filter(
        (account) => !account.isSubAccount && account._id !== id
      );
      setParentAccounts(filtered);
    }
  }, [accounts, id]);

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as AccountType;
    let category = formData.category;

    // Update category based on selected type
    switch (type) {
      case AccountType.ASSET:
        category = AccountCategory.CURRENT_ASSET;
        break;
      case AccountType.LIABILITY:
        category = AccountCategory.CURRENT_LIABILITY;
        break;
      case AccountType.EQUITY:
        category = AccountCategory.EQUITY_GENERAL;
        break;
      case AccountType.REVENUE:
        category = AccountCategory.SALES_REVENUE;
        break;
      case AccountType.EXPENSE:
        category = AccountCategory.OPERATING_EXPENSE;
        break;
    }

    setFormData((prev) => ({ ...prev, type, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        const { accountNumber, ...updateData } = formData;
        await dispatch(
          updateAccount({ id: id!, updateData }) as any
        );
        showToast('Account updated successfully', 'success');
      } else {
        await dispatch(createAccount(formData) as any);
        showToast('Account created successfully', 'success');
      }
      navigate('/accounting/accounts');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const getCategoriesForType = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET:
        return [
          AccountCategory.CURRENT_ASSET,
          AccountCategory.FIXED_ASSET,
          AccountCategory.INVENTORY,
          AccountCategory.BANK,
          AccountCategory.CASH,
          AccountCategory.ACCOUNTS_RECEIVABLE,
          AccountCategory.OTHER_ASSET,
        ];
      case AccountType.LIABILITY:
        return [
          AccountCategory.CURRENT_LIABILITY,
          AccountCategory.LONG_TERM_LIABILITY,
          AccountCategory.ACCOUNTS_PAYABLE,
          AccountCategory.CREDIT_CARD,
          AccountCategory.OTHER_LIABILITY,
        ];
      case AccountType.EQUITY:
        return [
          AccountCategory.EQUITY_GENERAL,
          AccountCategory.RETAINED_EARNINGS,
          AccountCategory.OWNER_EQUITY,
        ];
      case AccountType.REVENUE:
        return [
          AccountCategory.SALES_REVENUE,
          AccountCategory.SERVICE_REVENUE,
          AccountCategory.INTEREST_REVENUE,
          AccountCategory.OTHER_REVENUE,
        ];
      case AccountType.EXPENSE:
        return [
          AccountCategory.COST_OF_GOODS_SOLD,
          AccountCategory.OPERATING_EXPENSE,
          AccountCategory.PAYROLL_EXPENSE,
          AccountCategory.TAX_EXPENSE,
          AccountCategory.INTEREST_EXPENSE,
          AccountCategory.DEPRECIATION_EXPENSE,
          AccountCategory.OTHER_EXPENSE,
        ];
      default:
        return [];
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Account' : 'Create New Account'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/accounting/accounts')}>
          Back to Accounts
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
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                disabled={isEditMode}
              />
              <Input
                label="Account Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Account Type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
              >
                {Object.values(AccountType).map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                label="Account Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {getCategoriesForType(formData.type).map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </Select>
              <div className="flex items-center mt-4">
                <Checkbox
                  id="isSubAccount"
                  name="isSubAccount"
                  checked={formData.isSubAccount}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isSubAccount" className="ml-2 text-sm text-gray-700">
                  This is a sub-account
                </label>
              </div>
              {formData.isSubAccount && (
                <Select
                  label="Parent Account"
                  name="parentAccount"
                  value={formData.parentAccount}
                  onChange={handleInputChange}
                  required={formData.isSubAccount}
                >
                  <option value="">Select Parent Account</option>
                  {parentAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.accountNumber} - {account.name}
                    </option>
                  ))}
                </Select>
              )}
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {Object.values(AccountStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>
              <Input
                label="Opening Balance"
                name="openingBalance"
                type="number"
                step="0.01"
                value={formData.openingBalance.toString()}
                onChange={handleNumberChange}
                disabled={isEditMode}
              />
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
            <div className="mt-6">
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
            onClick={() => navigate('/accounting/accounts')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditMode ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
