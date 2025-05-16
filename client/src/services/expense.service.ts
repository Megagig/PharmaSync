import api from './api';
import {
  Expense,
  ExpenseFormData,
  ExpenseUpdateData,
  ExpenseSummary,
} from '../types/expense.types';

class ExpenseService {
  /**
   * Get all expenses with pagination and filtering
   */
  async getExpenses(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: Expense[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/expenses?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  }

  /**
   * Create new expense
   */
  async createExpense(expenseData: ExpenseFormData): Promise<Expense> {
    try {
      console.log(
        'Expense service sending data:',
        JSON.stringify(expenseData, null, 2)
      );
      const response = await api.post('/expenses', expenseData);
      console.log('Expense service received response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Expense service createExpense error:', error);
      throw error;
    }
  }

  /**
   * Update expense
   */
  async updateExpense(
    id: string,
    updateData: ExpenseUpdateData
  ): Promise<Expense> {
    const response = await api.patch(`/expenses/${id}`, updateData);
    return response.data.data;
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  }

  /**
   * Approve expense
   */
  async approveExpense(id: string): Promise<Expense> {
    const response = await api.patch(`/expenses/${id}/approve`);
    return response.data.data;
  }

  /**
   * Reject expense
   */
  async rejectExpense(id: string, rejectionReason: string): Promise<Expense> {
    const response = await api.patch(`/expenses/${id}/reject`, {
      rejectionReason,
    });
    return response.data.data;
  }

  /**
   * Mark expense as paid
   */
  async markExpenseAsPaid(
    id: string,
    paymentData: {
      paymentMethod: string;
      paymentDate?: string;
      paymentReference?: string;
    }
  ): Promise<Expense> {
    const response = await api.patch(`/expenses/${id}/pay`, paymentData);
    return response.data.data;
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseSummary> {
    try {
      const queryParams = new URLSearchParams();

      if (startDate) {
        queryParams.append('startDate', startDate);
      }

      if (endDate) {
        queryParams.append('endDate', endDate);
      }

      const response = await api.get(
        `/expenses/summary?${queryParams.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      // Return mock data for development
      return this.getMockExpenseSummary();
    }
  }

  /**
   * Get mock expense summary for development
   */
  private getMockExpenseSummary(): ExpenseSummary {
    return {
      totalExpenses: 750000,
      pendingExpenses: 120000,
      approvedExpenses: 580000,
      rejectedExpenses: 50000,
      paidExpenses: 580000,
      expensesByCategory: [
        { category: 'inventory', amount: 450000 },
        { category: 'salary', amount: 180000 },
        { category: 'rent', amount: 60000 },
        { category: 'utilities', amount: 35000 },
        { category: 'other', amount: 25000 },
      ],
      expensesByMonth: [
        { month: 'Jan 2023', amount: 120000 },
        { month: 'Feb 2023', amount: 135000 },
        { month: 'Mar 2023', amount: 145000 },
        { month: 'Apr 2023', amount: 125000 },
        { month: 'May 2023', amount: 115000 },
        { month: 'Jun 2023', amount: 110000 },
      ],
      topSuppliers: [
        { supplier: 'Pharma Wholesale Ltd', amount: 250000 },
        { supplier: 'Medical Supplies Inc', amount: 150000 },
        { supplier: 'Healthcare Products', amount: 100000 },
        { supplier: 'Lab Equipment Co', amount: 80000 },
        { supplier: 'Office Supplies Ltd', amount: 50000 },
      ],
    };
  }
}

export default new ExpenseService();
