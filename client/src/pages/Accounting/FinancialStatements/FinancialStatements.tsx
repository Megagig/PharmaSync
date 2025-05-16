import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  fetchBalanceSheet,
  fetchIncomeStatement,
  fetchCashFlowStatement,
} from '@/store/slices/accountingSlice';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Tabs from '@/components/common/Tabs/Tabs';
import { formatCurrency } from '@/utils/formatters';

const FinancialStatements = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { balanceSheet, incomeStatement, cashFlowStatement, isLoading, error } = useSelector(
    (state: RootState) => state.accounting
  );

  const [activeTab, setActiveTab] = useState('balance-sheet');
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (activeTab === 'balance-sheet') {
      dispatch(fetchBalanceSheet(asOfDate) as any);
    } else if (activeTab === 'income-statement') {
      dispatch(fetchIncomeStatement({ startDate, endDate }) as any);
    } else if (activeTab === 'cash-flow') {
      dispatch(fetchCashFlowStatement({ startDate, endDate }) as any);
    }
  }, [dispatch, activeTab, asOfDate, startDate, endDate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'asOfDate') {
      setAsOfDate(value);
    } else if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Implementation would depend on the structure of each statement
    alert('Export functionality to be implemented');
  };

  // Mock data for UI development - replace with actual data when API is ready
  const mockBalanceSheet = {
    asOfDate: asOfDate,
    assets: [
      { name: 'Cash and Cash Equivalents', amount: 50000 },
      { name: 'Accounts Receivable', amount: 25000 },
      { name: 'Inventory', amount: 75000 },
      { name: 'Property, Plant and Equipment', amount: 150000 },
      { name: 'Less: Accumulated Depreciation', amount: -30000 },
    ],
    liabilities: [
      { name: 'Accounts Payable', amount: 35000 },
      { name: 'Short-term Loans', amount: 20000 },
      { name: 'Long-term Debt', amount: 100000 },
    ],
    equity: [
      { name: 'Common Stock', amount: 50000 },
      { name: 'Retained Earnings', amount: 65000 },
    ],
    totalAssets: 270000,
    totalLiabilities: 155000,
    totalEquity: 115000,
  };

  const mockIncomeStatement = {
    startDate: startDate,
    endDate: endDate,
    revenue: [
      { name: 'Sales Revenue', amount: 200000 },
      { name: 'Service Revenue', amount: 50000 },
    ],
    expenses: [
      { name: 'Cost of Goods Sold', amount: 100000 },
      { name: 'Salaries and Wages', amount: 60000 },
      { name: 'Rent Expense', amount: 15000 },
      { name: 'Utilities Expense', amount: 5000 },
      { name: 'Depreciation Expense', amount: 10000 },
      { name: 'Other Expenses', amount: 8000 },
    ],
    totalRevenue: 250000,
    totalExpenses: 198000,
    netIncome: 52000,
  };

  const mockCashFlowStatement = {
    startDate: startDate,
    endDate: endDate,
    operatingActivities: [
      { name: 'Net Income', amount: 52000 },
      { name: 'Depreciation', amount: 10000 },
      { name: 'Increase in Accounts Receivable', amount: -5000 },
      { name: 'Decrease in Inventory', amount: 8000 },
      { name: 'Increase in Accounts Payable', amount: 3000 },
    ],
    investingActivities: [
      { name: 'Purchase of Equipment', amount: -20000 },
    ],
    financingActivities: [
      { name: 'Repayment of Loans', amount: -15000 },
      { name: 'Dividends Paid', amount: -10000 },
    ],
    netCashFromOperating: 68000,
    netCashFromInvesting: -20000,
    netCashFromFinancing: -25000,
    netChangeInCash: 23000,
    beginningCash: 27000,
    endingCash: 50000,
  };

  // Use mock data for now, replace with actual data when API is ready
  const currentBalanceSheet = balanceSheet || mockBalanceSheet;
  const currentIncomeStatement = incomeStatement || mockIncomeStatement;
  const currentCashFlowStatement = cashFlowStatement || mockCashFlowStatement;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Statements</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'balance-sheet', label: 'Balance Sheet' },
          { id: 'income-statement', label: 'Income Statement' },
          { id: 'cash-flow', label: 'Cash Flow Statement' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <div className="mt-6">
        {activeTab === 'balance-sheet' && (
          <div>
            <Card className="mb-6">
              <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Balance Sheet</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As of Date
                  </label>
                  <input
                    type="date"
                    name="asOfDate"
                    value={asOfDate}
                    onChange={handleDateChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Assets</h3>
                  <div className="space-y-2">
                    {currentBalanceSheet.assets.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 font-semibold flex justify-between">
                      <span>Total Assets</span>
                      <span>{formatCurrency(currentBalanceSheet.totalAssets)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Liabilities & Equity</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium">Liabilities</h4>
                    {currentBalanceSheet.liabilities.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="font-medium flex justify-between">
                      <span>Total Liabilities</span>
                      <span>{formatCurrency(currentBalanceSheet.totalLiabilities)}</span>
                    </div>

                    <div className="border-t pt-2">
                      <h4 className="font-medium">Equity</h4>
                      {currentBalanceSheet.equity.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="font-medium flex justify-between">
                        <span>Total Equity</span>
                        <span>{formatCurrency(currentBalanceSheet.totalEquity)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-2 font-semibold flex justify-between">
                      <span>Total Liabilities & Equity</span>
                      <span>
                        {formatCurrency(
                          currentBalanceSheet.totalLiabilities + currentBalanceSheet.totalEquity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'income-statement' && (
          <div>
            <Card className="mb-6">
              <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Income Statement</h2>
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                    <div className="space-y-2">
                      {currentIncomeStatement.revenue.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium flex justify-between">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(currentIncomeStatement.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Expenses</h3>
                    <div className="space-y-2">
                      {currentIncomeStatement.expenses.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium flex justify-between">
                        <span>Total Expenses</span>
                        <span>{formatCurrency(currentIncomeStatement.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-bold text-lg flex justify-between">
                      <span>Net Income</span>
                      <span>{formatCurrency(currentIncomeStatement.netIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'cash-flow' && (
          <div>
            <Card className="mb-6">
              <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cash Flow Statement</h2>
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={handleDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Operating Activities</h3>
                    <div className="space-y-2">
                      {currentCashFlowStatement.operatingActivities.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium flex justify-between">
                        <span>Net Cash from Operating Activities</span>
                        <span>{formatCurrency(currentCashFlowStatement.netCashFromOperating)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Investing Activities</h3>
                    <div className="space-y-2">
                      {currentCashFlowStatement.investingActivities.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium flex justify-between">
                        <span>Net Cash from Investing Activities</span>
                        <span>{formatCurrency(currentCashFlowStatement.netCashFromInvesting)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Financing Activities</h3>
                    <div className="space-y-2">
                      {currentCashFlowStatement.financingActivities.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium flex justify-between">
                        <span>Net Cash from Financing Activities</span>
                        <span>{formatCurrency(currentCashFlowStatement.netCashFromFinancing)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="font-medium flex justify-between">
                      <span>Net Change in Cash</span>
                      <span>{formatCurrency(currentCashFlowStatement.netChangeInCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash at Beginning of Period</span>
                      <span>{formatCurrency(currentCashFlowStatement.beginningCash)}</span>
                    </div>
                    <div className="font-bold text-lg flex justify-between">
                      <span>Cash at End of Period</span>
                      <span>{formatCurrency(currentCashFlowStatement.endingCash)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialStatements;
