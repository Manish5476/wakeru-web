import { IExpense } from '@/types/expense.types';
import { ITripMember } from '@/types/trip.types';
import { ISettlementTransaction, MemberBalance } from '@/types/settlement.types';

/**
 * Calculates net balances for every member in the trip.
 * netBalance > 0 => member is owed money (creditor)
 * netBalance < 0 => member owes money (debtor)
 */
export function calculateMemberBalances(
  members: ITripMember[],
  expenses: IExpense[],
): MemberBalance[] {
  const balanceMap = new Map<
    string,
    { paid: number; share: number; name: string; avatarUrl?: string }
  >();

  // Initialize with all members
  for (const m of members) {
    balanceMap.set(m.userId, {
      paid: 0,
      share: 0,
      name: m.name,
      avatarUrl: m.avatarUrl,
    });
  }

  // Aggregate expenses
  for (const expense of expenses) {
    // Multi-payer vs single payer
    if (expense.payers && expense.payers.length > 0) {
      for (const p of expense.payers) {
        const cur = balanceMap.get(p.userId) || {
          paid: 0,
          share: 0,
          name: p.userName || 'Member',
        };
        cur.paid += p.amount;
        balanceMap.set(p.userId, cur);
      }
    } else if (expense.paidBy) {
      const cur = balanceMap.get(expense.paidBy) || {
        paid: 0,
        share: 0,
        name: expense.paidByName || 'Member',
      };
      cur.paid += expense.amount;
      balanceMap.set(expense.paidBy, cur);
    }

    // Splits
    if (expense.splits && expense.splits.length > 0) {
      for (const s of expense.splits) {
        const cur = balanceMap.get(s.userId) || {
          paid: 0,
          share: 0,
          name: s.userName || 'Member',
        };
        cur.share += s.amount;
        balanceMap.set(s.userId, cur);
      }
    }
  }

  const result: MemberBalance[] = [];
  balanceMap.forEach((val, userId) => {
    const net = Math.round((val.paid - val.share) * 100) / 100;
    result.push({
      userId,
      userName: val.name,
      avatarUrl: val.avatarUrl,
      totalPaid: Math.round(val.paid * 100) / 100,
      totalShare: Math.round(val.share * 100) / 100,
      netBalance: net,
    });
  });

  return result.sort((a, b) => b.netBalance - a.netBalance);
}

/**
 * Greedy minimum cash flow debt simplification algorithm.
 * Transforms N complex pairwise debts into at most N - 1 direct payments.
 */
export function simplifyDebts(
  balances: MemberBalance[],
  currency: string = 'INR',
): ISettlementTransaction[] {
  interface DebtorCreditor {
    userId: string;
    userName: string;
    amount: number;
  }

  const creditors: DebtorCreditor[] = [];
  const debtors: DebtorCreditor[] = [];

  for (const b of balances) {
    const amount = Math.round(b.netBalance * 100) / 100;
    if (amount > 0.01) {
      creditors.push({ userId: b.userId, userName: b.userName, amount });
    } else if (amount < -0.01) {
      debtors.push({
        userId: b.userId,
        userName: b.userName,
        amount: Math.abs(amount),
      });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: ISettlementTransaction[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settleAmount = Math.min(creditor.amount, debtor.amount);
    const rounded = Math.round(settleAmount * 100) / 100;

    if (rounded > 0.01) {
      transactions.push({
        id: `tx_${debtor.userId}_${creditor.userId}_${transactions.length + 1}`,
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: rounded,
        currency,
        status: 'PENDING',
      });
    }

    creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;

    if (creditor.amount <= 0.01) cIdx++;
    if (debtor.amount <= 0.01) dIdx++;
  }

  return transactions;
}
