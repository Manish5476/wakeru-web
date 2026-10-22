export type SplitType =
  | 'EQUAL'
  | 'EXACT'
  | 'PERCENTAGE'
  | 'SHARES'
  | 'ITEMIZED';

export type ExpenseCategory =
  | 'stay'
  | 'food'
  | 'transport'
  | 'activity'
  | 'shopping'
  | 'entertainment'
  | 'groceries'
  | 'other';

export interface ISplit {
  userId: string;
  userName?: string;
  amount: number;
  percentage?: number;
  shares?: number;
  paid?: boolean;
  paidAt?: string;
}

export interface IPayer {
  userId: string;
  userName?: string;
  amount: number;
}

export interface IExpenseLineItem {
  id: string;
  name: string;
  amount: number;
  quantity?: number;
  assignedUserIds: string[];
}

export interface IExpense {
  _id: string;
  id?: string;
  tripId: string;
  stopId?: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  paidBy: string; // primary payer userId
  paidByName?: string;
  payers?: IPayer[]; // multi-payer breakdown
  splitType: SplitType;
  splits: ISplit[];
  lineItems?: IExpenseLineItem[];
  receiptUrl?: string;
  notes?: string;
  exchangeRate?: number;
  convertedAmountBase?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  myTotalPaid: number;
  myTotalShare: number;
  myNetBalance: number;
}
