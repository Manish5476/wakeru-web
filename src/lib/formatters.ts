import { ExpenseCategory } from '../types/expense.types';

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'TBD';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const formatDateShort = formatShortDate;

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Dates TBD';
  if (!endDate || startDate === endDate) return formatDate(startDate);
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${startDate} - ${endDate}`;
    }
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  stay: {
    label: 'Stay & Accommodation',
    emoji: '🏨',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  food: {
    label: 'Food & Dining',
    emoji: '🍽️',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  transport: {
    label: 'Travel & Transport',
    emoji: '🚗',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  activity: {
    label: 'Activities & Tours',
    emoji: '🏄',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  shopping: {
    label: 'Shopping & Gear',
    emoji: '🛍️',
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  entertainment: {
    label: 'Nightlife & Events',
    emoji: '🎉',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
  groceries: {
    label: 'Groceries & Supplies',
    emoji: '🛒',
    color: '#14B8A6',
    bg: '#F0FDFA',
  },
  other: {
    label: 'General Expense',
    emoji: '💳',
    color: '#64748B',
    bg: '#F1F5F9',
  },
};

export function getCategoryMeta(category?: string): {
  label: string;
  emoji: string;
  color: string;
  bg: string;
} {
  if (category && (category as ExpenseCategory) in CATEGORY_META) {
    return CATEGORY_META[category as ExpenseCategory];
  }
  return CATEGORY_META.other;
}
