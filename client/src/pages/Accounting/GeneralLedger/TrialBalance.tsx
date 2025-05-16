import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchTrialBalance } from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Table from '@/components/common/Table/Table';
import { formatCurrency } from '@/utils/formatters';
import { AccountType } from '@/types/accounting.types';

const TrialBalance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trialBalance, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    dispatch(fetchTrialBalance(asOfDate) as any);
  }, [dispatch, asOfDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAsOfDate(e.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!trialBalance) return;

    // Create CSV content
    const headers = ['Account Number', 'Account Name', 'Type', 'Debit', 'Credit'];
    const rows = trialBalance.trialBalance.map((item) => [
      item.account.accountNumber,
      item.account.name,
      item.account.type,
      item.debit,
      item.credit,
    ]);
    
    // Add total row
    rows.push(['', 'TOTAL', '', trialBalance.totalDebit, trialBalance.totalCredit]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trial_balance_${asOfDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: 'Account Number',
      accessor: 'account.accountNumber',
      cell: (row: any) => row.account.accountNumber,
    },
    {
      header: 'Account Name',
      accessor: 'account.name',
      cell: (row: any) => row.account.name,
    },
    {
      header: 'Type',
      accessor: 'account.type',
      cell: (row: any) => (
        <span className="capitalize">{row.account.type}</span>
      ),
    },
    {
      header: 'Debit',
      accessor: 'debit',
      cell: (row: any) => (row.debit > 0 ? formatCurrency(row.debit) : ''),
    },
    {
      header: 'Credit',
      accessor: 'credit',
      cell: (row: any) => (row.credit > 0 ? formatCurrency(row.credit) : ''),
    },
  ];

  // Group accounts by type for the summary
  const getAccountTypeTotal = (type: AccountType, field: 'debit' | 'credit') => {
    if (!trialBalance) return 0;
    
    return trialBalance.trialBalance
      .filter(item => item.account.type === type)
      .reduce((sum, item) => sum + item[field], 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              As of Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/accounting/general-ledger')}
            >
              Back to General Ledger
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {trialBalance && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Summary by Account Type</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Type
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
                    {Object.values(AccountType).map((type) => (
                      <tr key={type}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(getAccountTypeTotal(type, 'debit'))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(getAccountTypeTotal(type, 'credit'))}
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
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Trial Balance Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">As of Date</p>
                  <p className="font-medium">{new Date(trialBalance.asOfDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Debit</p>
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(trialBalance.totalDebit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Credit</p>
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(trialBalance.totalCredit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difference</p>
                  <p className="font-medium">
                    {formatCurrency(trialBalance.totalDebit - trialBalance.totalCredit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${trialBalance.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {trialBalance.isBalanced ? 'Balanced ✓' : 'Unbalanced ✗'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Trial Balance Detail</h2>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={trialBalance?.trialBalance || []}
              isLoading={isLoading}
              error={error}
            />
            {trialBalance && (
              <table className="min-w-full divide-y divide-gray-200">
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(trialBalance.totalDebit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(trialBalance.totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrialBalance;
