import { ISplit, SplitType, IExpenseLineItem } from '@/types/expense.types';

export interface UserSplitDraft {
  userId: string;
  userName: string;
  selected: boolean;
  customAmount?: number;
  percentage?: number;
  shares?: number;
}

/**
 * Distributes a total amount across selected members according to SplitType,
 * ensuring the sum of splits strictly matches the total amount to the penny.
 */
export function calculateSplits(
  totalAmount: number,
  users: UserSplitDraft[],
  splitType: SplitType,
): ISplit[] {
  const selected = users.filter(u => u.selected);
  if (selected.length === 0 || totalAmount <= 0) {
    return [];
  }

  const roundedTotal = Math.round(totalAmount * 100) / 100;

  if (splitType === 'EQUAL') {
    const baseShareMinor = Math.floor((roundedTotal * 100) / selected.length);
    let remainder = Math.round(roundedTotal * 100) - baseShareMinor * selected.length;

    return selected.map(u => {
      let minor = baseShareMinor;
      if (remainder > 0) {
        minor += 1;
        remainder -= 1;
      }
      return {
        userId: u.userId,
        userName: u.userName,
        amount: minor / 100,
        paid: false,
      };
    });
  }

  if (splitType === 'EXACT') {
    return selected.map(u => ({
      userId: u.userId,
      userName: u.userName,
      amount: Math.round((u.customAmount || 0) * 100) / 100,
      paid: false,
    }));
  }

  if (splitType === 'PERCENTAGE') {
    let runningTotalMinor = 0;
    const splits = selected.map((u, idx) => {
      if (idx === selected.length - 1) {
        const minor = Math.round(roundedTotal * 100) - runningTotalMinor;
        return {
          userId: u.userId,
          userName: u.userName,
          amount: minor / 100,
          percentage: u.percentage || 0,
          paid: false,
        };
      }
      const pct = u.percentage || 0;
      const minor = Math.round((roundedTotal * 100 * pct) / 100);
      runningTotalMinor += minor;
      return {
        userId: u.userId,
        userName: u.userName,
        amount: minor / 100,
        percentage: pct,
        paid: false,
      };
    });
    return splits;
  }

  if (splitType === 'SHARES') {
    const totalShares = selected.reduce((sum, u) => sum + (u.shares || 1), 0);
    if (totalShares <= 0) return [];

    let runningTotalMinor = 0;
    const splits = selected.map((u, idx) => {
      const shares = u.shares || 1;
      if (idx === selected.length - 1) {
        const minor = Math.round(roundedTotal * 100) - runningTotalMinor;
        return {
          userId: u.userId,
          userName: u.userName,
          amount: minor / 100,
          shares,
          paid: false,
        };
      }
      const minor = Math.round((roundedTotal * 100 * shares) / totalShares);
      runningTotalMinor += minor;
      return {
        userId: u.userId,
        userName: u.userName,
        amount: minor / 100,
        shares,
        paid: false,
      };
    });
    return splits;
  }

  return calculateSplits(totalAmount, users, 'EQUAL');
}

export function calculateEqualSplits(
  totalAmount: number,
  selectedUserIds: string[],
  members: Array<{ userId: string; name?: string }>,
): ISplit[] {
  const drafts: UserSplitDraft[] = members.map(m => ({
    userId: m.userId,
    userName: m.name || m.userId,
    selected: selectedUserIds.includes(m.userId),
  }));
  return calculateSplits(totalAmount, drafts, 'EQUAL');
}

export function calculateExactSplits(
  totalAmount: number,
  exactAmounts: Record<string, number>,
  members: Array<{ userId: string; name?: string }>,
): ISplit[] {
  const drafts: UserSplitDraft[] = members.map(m => ({
    userId: m.userId,
    userName: m.name || m.userId,
    selected: (exactAmounts[m.userId] || 0) > 0,
    customAmount: exactAmounts[m.userId] || 0,
  }));
  return calculateSplits(totalAmount, drafts, 'EXACT');
}

export function calculatePercentageSplits(
  totalAmount: number,
  percentages: Record<string, number>,
  members: Array<{ userId: string; name?: string }>,
): ISplit[] {
  const drafts: UserSplitDraft[] = members.map(m => ({
    userId: m.userId,
    userName: m.name || m.userId,
    selected: (percentages[m.userId] || 0) > 0,
    percentage: percentages[m.userId] || 0,
  }));
  return calculateSplits(totalAmount, drafts, 'PERCENTAGE');
}

export function calculateSharesSplits(
  totalAmount: number,
  shares: Record<string, number>,
  members: Array<{ userId: string; name?: string }>,
): ISplit[] {
  const drafts: UserSplitDraft[] = members.map(m => ({
    userId: m.userId,
    userName: m.name || m.userId,
    selected: (shares[m.userId] || 0) > 0,
    shares: shares[m.userId] || 1,
  }));
  return calculateSplits(totalAmount, drafts, 'SHARES');
}

/**
 * Calculates member splits based on itemized line item assignments
 */
export function calculateItemizedSplits(
  lineItems: IExpenseLineItem[],
  members?: Array<{ userId: string; name?: string }>,
  taxAmount: number = 0,
  tipAmount: number = 0,
): ISplit[] {
  const memberTotals = new Map<string, number>();

  let subtotal = 0;
  for (const item of lineItems) {
    subtotal += item.amount;
    const assignees = item.assignedUserIds;
    if (assignees.length > 0) {
      const share = item.amount / assignees.length;
      for (const uid of assignees) {
        memberTotals.set(uid, (memberTotals.get(uid) || 0) + share);
      }
    }
  }

  const extraRatio = subtotal > 0 ? (taxAmount + tipAmount) / subtotal : 0;

  const splits: ISplit[] = [];
  memberTotals.forEach((baseShare, userId) => {
    const totalWithTaxTip = baseShare * (1 + extraRatio);
    const memberName = members?.find(m => m.userId === userId)?.name;
    splits.push({
      userId,
      userName: memberName || userId,
      amount: Math.round(totalWithTaxTip * 100) / 100,
      paid: false,
    });
  });

  return splits;
}
