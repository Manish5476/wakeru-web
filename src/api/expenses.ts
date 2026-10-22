import { fetchClient } from './client';
import { IExpense, ExpenseSummary, ExpenseCategory, ISplit } from '@/types/expense.types';
import { INITIAL_EXPENSES } from '@/lib/mockTripsData';

const STORAGE_KEY = 'tripsplit_web_expenses';

function getStoredExpenses(): IExpense[] {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_EXPENSES;
}

function saveStoredExpenses(expenses: IExpense[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {}
}

export const expensesApi = {
  getTripExpenses: async (
    tripId: string,
    currentUserId: string = 'usr_me',
  ): Promise<{ expenses: IExpense[]; summary: ExpenseSummary }> => {
    try {
      const res = await fetchClient<{ expenses: IExpense[]; summary: ExpenseSummary }>(
        `/trips/${tripId}/expenses`,
      );
      if (res?.expenses && Array.isArray(res.expenses)) {
        return res;
      }
    } catch {}

    const all = getStoredExpenses();
    const tripExpenses = all.filter(e => e.tripId === tripId);

    const initialCategory: Record<ExpenseCategory, number> = {
      stay: 0,
      food: 0,
      transport: 0,
      activity: 0,
      shopping: 0,
      entertainment: 0,
      groceries: 0,
      other: 0,
    };

    let totalAmount = 0;
    let myTotalPaid = 0;
    let myTotalShare = 0;

    tripExpenses.forEach(exp => {
      totalAmount += exp.amount;
      if (exp.category && initialCategory[exp.category] !== undefined) {
        initialCategory[exp.category] += exp.amount;
      } else {
        initialCategory.other += exp.amount;
      }

      // Check primary payer or multi-payers
      if (exp.payers && exp.payers.length > 0) {
        const myPayer = exp.payers.find(p => p.userId === currentUserId);
        if (myPayer) myTotalPaid += myPayer.amount;
      } else if (exp.paidBy === currentUserId) {
        myTotalPaid += exp.amount;
      }

      // Check splits
      const mySplit = exp.splits.find(s => s.userId === currentUserId);
      if (mySplit) {
        myTotalShare += mySplit.amount;
      }
    });

    return {
      expenses: tripExpenses,
      summary: {
        totalAmount,
        categoryBreakdown: initialCategory,
        myTotalPaid,
        myTotalShare,
        myNetBalance: myTotalPaid - myTotalShare,
      },
    };
  },

  getExpense: async (expenseId: string): Promise<{ expense: IExpense }> => {
    try {
      const res = await fetchClient<{ expense: IExpense }>(`/expenses/${expenseId}`);
      if (res?.expense) return res;
    } catch {}

    const all = getStoredExpenses();
    const found = all.find(e => e._id === expenseId || e.id === expenseId);
    if (found) return { expense: found };
    throw new Error('Expense not found');
  },

  create: async (data: Partial<IExpense>): Promise<{ expense: IExpense }> => {
    try {
      const res = await fetchClient<{ expense: IExpense }>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.expense) {
        const all = getStoredExpenses();
        saveStoredExpenses([res.expense, ...all]);
        return res;
      }
    } catch {}

    const newExpense: IExpense = {
      _id: `exp_${Date.now()}`,
      id: `exp_${Date.now()}`,
      tripId: data.tripId || '',
      stopId: data.stopId,
      title: data.title || 'Untitled Expense',
      amount: data.amount || 0,
      currency: data.currency || 'INR',
      category: data.category || 'other',
      date: data.date || new Date().toISOString().split('T')[0],
      paidBy: data.paidBy || 'usr_me',
      paidByName: data.paidByName || 'You (Alex)',
      payers: data.payers,
      splitType: data.splitType || 'EQUAL',
      splits: data.splits || [],
      lineItems: data.lineItems,
      receiptUrl: data.receiptUrl,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = getStoredExpenses();
    saveStoredExpenses([newExpense, ...all]);
    return { expense: newExpense };
  },

  update: async (expenseId: string, data: Partial<IExpense>): Promise<{ expense: IExpense }> => {
    try {
      const res = await fetchClient<{ expense: IExpense }>(`/expenses/${expenseId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (res?.expense) return res;
    } catch {}

    const all = getStoredExpenses();
    const idx = all.findIndex(e => e._id === expenseId || e.id === expenseId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredExpenses(all);
      return { expense: all[idx] };
    }
    throw new Error('Expense not found');
  },

  delete: async (expenseId: string): Promise<{ success: boolean }> => {
    try {
      await fetchClient(`/expenses/${expenseId}`, { method: 'DELETE' });
    } catch {}

    const all = getStoredExpenses();
    const filtered = all.filter(e => e._id !== expenseId && e.id !== expenseId);
    saveStoredExpenses(filtered);
    return { success: true };
  },

  markSplitPaid: async (
    expenseId: string,
    userId: string,
    paid: boolean,
  ): Promise<{ expense: IExpense }> => {
    const all = getStoredExpenses();
    const exp = all.find(e => e._id === expenseId || e.id === expenseId);
    if (!exp) throw new Error('Expense not found');

    exp.splits = exp.splits.map(s =>
      s.userId === userId
        ? { ...s, paid, paidAt: paid ? new Date().toISOString() : undefined }
        : s,
    );
    exp.updatedAt = new Date().toISOString();
    saveStoredExpenses(all);
    return { expense: exp };
  },
};
