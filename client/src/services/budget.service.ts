import api from './api';
import { Budget, BudgetFormData, BudgetUpdateData, BudgetSummary } from '../types/budget.types';

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
    const response = await api.post('/budgets', budgetData);
    return response.data.data;
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
    const response = await api.get('/budgets/summary');
    return response.data.data;
  }
}

export default new BudgetService();
