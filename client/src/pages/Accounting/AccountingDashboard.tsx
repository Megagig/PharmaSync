import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { fetchAccounts, fetchTrialBalance } from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { formatCurrency } from '@/utils/formatters';
import { AccountType } from '@/types/accounting.types';

const AccountingDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accounts, trialBalance, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    dispatch(fetchAccounts({ limit: 5 }) as any);
    dispatch(fetchTrialBalance(asOfDate) as any);
  }, [dispatch, asOfDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAsOfDate(e.target.value);
  };

  const getAccountTypeTotal = (type: AccountType) => {
    if (!trialBalance) return 0;
    
    return trialBalance.trialBalance
      .filter(item => item.account.type === type)
      .reduce((sum, item) => {
        if (type === AccountType.ASSET || type === AccountType.EXPENSE) {
          return sum + item.debit - item.credit;
        } else {
          return sum + item.credit - item.debit;
        }
      }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h1>
        <div className="flex space-x-2">
          <input
            type="date"
            value={asOfDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/accounting/journal-entries/new')}
          >
            New Journal Entry
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Assets</h3>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(getAccountTypeTotal(AccountType.ASSET))}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Liabilities</h3>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(getAccountTypeTotal(AccountType.LIABILITY))}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Equity</h3>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(getAccountTypeTotal(AccountType.EQUITY))}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Net Income</h3>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(
                getAccountTypeTotal(AccountType.REVENUE) -
                getAccountTypeTotal(AccountType.EXPENSE)
              )}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Recent Accounts</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/accounting/accounts')}
              >
                View All
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : accounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accounts.map((account) => (
                      <tr
                        key={account._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/accounting/accounts/${account._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {account.accountNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {account.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {account.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(account.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No accounts found. <a href="/accounting/accounts/new" className="text-primary-600 hover:underline">Create one</a>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Trial Balance</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/accounting/general-ledger/trial-balance')}
              >
                View Full
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : trialBalance ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Debit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trialBalance.trialBalance.slice(0, 5).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.account.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.debit > 0 ? formatCurrency(item.debit) : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.credit > 0 ? formatCurrency(item.credit) : ''}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(trialBalance.totalDebit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(trialBalance.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {trialBalance.isBalanced ? (
                    <span className="text-green-600">Trial balance is balanced ✓</span>
                  ) : (
                    <span className="text-red-600">Trial balance is not balanced ✗</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No trial balance data available
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/accounting/accounts')}
              >
                Chart of Accounts
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/accounting/journal-entries')}
              >
                Journal Entries
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/accounting/general-ledger')}
              >
                General Ledger
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/accounting/financial-statements')}
              >
                Financial Statements
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial Periods</h3>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/accounting/financial-periods')}
            >
              Manage Financial Periods
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Tax Management</h3>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/accounting/taxes')}
            >
              Manage Tax Configurations
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
