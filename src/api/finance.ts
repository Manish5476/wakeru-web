import apiClient, { ApiResponse } from './client';
import { Transaction, Budget, Bill, Goal, LendingRecord, FinanceOverviewData } from '@/types/finance.types';

export const financeApi = {
  // ────────────────── DASHBOARD & KPI ──────────────────
  getDashboard: async (params?: { month?: string; includeTripExpenses?: boolean }): Promise<ApiResponse<any>> => {
    return apiClient.get('/finance/dashboard', { params });
  },

  getOverview: async (month?: string): Promise<ApiResponse<FinanceOverviewData>> => {
    return apiClient.get('/finance/overview', { params: month ? { month } : undefined });
  },

  getAnalytics: async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
    return apiClient.get('/finance/analytics', { params });
  },

  getSpendingTrends: async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
    return apiClient.get('/finance/trends', { params });
  },

  getSpendingStreak: async (): Promise<ApiResponse<{ currentStreak: number; longestStreak: number; isActive: boolean }>> => {
    return apiClient.get('/finance/streak');
  },

  // ────────────────── TRANSACTIONS ──────────────────
  getTransactions: async (params?: Record<string, any>): Promise<ApiResponse<{ transactions: Transaction[]; pagination?: any; totalAmount?: number }>> => {
    return apiClient.get('/finance/transactions', { params });
  },

  getTransactionById: async (id: string): Promise<ApiResponse<{ transaction: Transaction }>> => {
    return apiClient.get(`/finance/transactions/${id}`);
  },

  createTransaction: async (data: Partial<Transaction>): Promise<ApiResponse<{ transaction: Transaction }>> => {
    return apiClient.post('/finance/transactions', data);
  },

  updateTransaction: async (id: string, data: Partial<Transaction>): Promise<ApiResponse<{ transaction: Transaction }>> => {
    return apiClient.put(`/finance/transactions/${id}`, data);
  },

  deleteTransaction: async (id: string, permanent = false): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/finance/transactions/${id}`, { params: { permanent } });
  },

  // ────────────────── BUDGET ──────────────────
  getBudget: async (params?: { month?: string; includeTripExpenses?: boolean }): Promise<ApiResponse<{ budget: Budget }>> => {
    return apiClient.get('/finance/budget', { params });
  },

  setBudget: async (data: {
    month: string;
    totalBudget: number;
    categoryBudgets: { category: string; amount: number; color?: string }[];
  }): Promise<ApiResponse<{ budget: Budget }>> => {
    return apiClient.post('/finance/budget', data);
  },

  updateBudget: async (id: string, data: Partial<Budget>): Promise<ApiResponse<{ budget: Budget }>> => {
    return apiClient.put(`/finance/budget/${id}`, data);
  },

  deleteBudget: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/finance/budget/${id}`);
  },

  getBudgetCategories: async (): Promise<ApiResponse<any[]>> => {
    return apiClient.get('/finance/budget/categories');
  },

  // ────────────────── BILLS & SUBSCRIPTIONS ──────────────────
  getBills: async (params?: Record<string, any>): Promise<ApiResponse<{ bills: Bill[] }>> => {
    return apiClient.get('/finance/bills', { params });
  },

  createBill: async (data: Partial<Bill>): Promise<ApiResponse<{ bill: Bill }>> => {
    return apiClient.post('/finance/bills', data);
  },

  payBill: async (id: string, data?: { paidAmount?: number; date?: string }): Promise<ApiResponse<{ bill: Bill }>> => {
    return apiClient.post(`/finance/bills/${id}/pay`, data);
  },

  deleteBill: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/finance/bills/${id}`);
  },

  // ────────────────── GOALS & SAVINGS ──────────────────
  getGoals: async (params?: Record<string, any>): Promise<ApiResponse<{ goals: Goal[] }>> => {
    return apiClient.get('/finance/goals', { params });
  },

  createGoal: async (data: Partial<Goal>): Promise<ApiResponse<{ goal: Goal }>> => {
    return apiClient.post('/finance/goals', data);
  },

  contributeToGoal: async (id: string, data: { amount: number; date?: string }): Promise<ApiResponse<{ goal: Goal }>> => {
    return apiClient.post(`/finance/goals/${id}/contribute`, data);
  },

  deleteGoal: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/finance/goals/${id}`);
  },

  // ────────────────── LENDING & BORROWING ──────────────────
  getLendingList: async (params?: Record<string, any>): Promise<ApiResponse<{ lending: LendingRecord[]; pagination?: any }>> => {
    return apiClient.get('/finance/lending', { params });
  },

  getLendingSummary: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/finance/lending/summary');
  },

  createLending: async (data: Partial<LendingRecord>): Promise<ApiResponse<{ record: LendingRecord }>> => {
    return apiClient.post('/finance/lending', data);
  },

  recordRepayment: async (id: string, data: { amount: number; paymentMethod?: string; notes?: string }): Promise<ApiResponse<any>> => {
    return apiClient.post(`/finance/lending/${id}/repay`, data);
  },
};
