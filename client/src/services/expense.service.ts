import api from './api';
import { Expense, ExpenseFormData, ExpenseUpdateData, ExpenseSummary } from '../types/expense.types';

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
    const response = await api.post('/expenses', expenseData);
    return response.data.data;
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
  }
}

export default new ExpenseService();
