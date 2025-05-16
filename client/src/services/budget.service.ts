import api from './api';
import {
  Budget,
  BudgetFormData,
  BudgetUpdateData,
  BudgetSummary,
} from '../types/budget.types';

class BudgetService {
  /**
   * Get all budgets with pagination and filtering
   */
  async getBudgets(
    page = 1,
    limit = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: Budget[]; meta: any }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/budgets?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(id: string): Promise<Budget> {
    const response = await api.get(`/budgets/${id}`);
    return response.data.data;
  }

  /**
   * Create new budget
   */
  async createBudget(budgetData: BudgetFormData): Promise<Budget> {
    try {
      console.log(
        'Budget service sending data:',
        JSON.stringify(budgetData, null, 2)
      );
      const response = await api.post('/budgets', budgetData);
      console.log('Budget service received response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Budget service createBudget error:', error);
      throw error;
    }
  }

  /**
   * Update budget
   */
  async updateBudget(
    id: string,
    updateData: BudgetUpdateData
  ): Promise<Budget> {
    const response = await api.patch(`/budgets/${id}`, updateData);
    return response.data.data;
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  }

  /**
   * Activate budget
   */
  async activateBudget(id: string): Promise<Budget> {
    const response = await api.patch(`/budgets/${id}/activate`);
    return response.data.data;
  }

  /**
   * Close budget
   */
  async closeBudget(id: string): Promise<Budget> {
    const response = await api.patch(`/budgets/${id}/close`);
    return response.data.data;
  }

  /**
   * Update budget actuals
   */
  async updateBudgetActuals(id: string): Promise<Budget> {
    const response = await api.patch(`/budgets/${id}/actuals`);
    return response.data.data;
  }

  /**
   * Get budget summary
   */
  async getBudgetSummary(): Promise<BudgetSummary> {
    try {
      const response = await api.get('/budgets/summary');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      // Return mock data for development
      return this.getMockBudgetSummary();
    }
  }

  /**
   * Get mock budget summary for development
   */
  private getMockBudgetSummary(): BudgetSummary {
    return {
      totalBudgeted: 5000000,
      totalSpent: 3250000,
      budgetUtilization: 65,
      budgetsByCategory: [
        {
          category: 'Inventory',
          budgeted: 2500000,
          actual: 1800000,
          utilization: 72,
        },
        {
          category: 'Salaries',
          budgeted: 1500000,
          actual: 1200000,
          utilization: 80,
        },
        {
          category: 'Rent',
          budgeted: 500000,
          actual: 500000,
          utilization: 100,
        },
        {
          category: 'Utilities',
          budgeted: 300000,
          actual: 250000,
          utilization: 83,
        },
        {
          category: 'Marketing',
          budgeted: 200000,
          actual: 150000,
          utilization: 75,
        },
      ],
      budgetsByPeriod: [
        { period: 'Jan 2023', budgeted: 400000, actual: 380000 },
        { period: 'Feb 2023', budgeted: 400000, actual: 390000 },
        { period: 'Mar 2023', budgeted: 400000, actual: 420000 },
        { period: 'Apr 2023', budgeted: 400000, actual: 370000 },
        { period: 'May 2023', budgeted: 400000, actual: 350000 },
      ],
      activeBudgets: 2,
      closedBudgets: 5,
    };
  }
}

export default new BudgetService();
