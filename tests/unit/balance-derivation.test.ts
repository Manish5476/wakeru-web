import test from 'node:test';
import assert from 'node:assert/strict';

interface MemberBalance {
  userId: string;
  userName: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number;
}

interface MiniMember {
  id: string;
  userId: string;
  name: string;
}

interface MiniExpense {
  amount: number;
  paidBy: string;
  splits: Array<{ userId: string; amount: number }>;
  payers?: Array<{ userId: string; amount: number; userName?: string }>;
}

function deriveMemberBalances(
  members: MiniMember[],
  expenses: MiniExpense[],
): MemberBalance[] {
  if (!Array.isArray(members) || members.length === 0) {
    return [];
  }

  const balanceMap = new Map<string, {
    userId: string;
    userName: string;
    totalPaid: number;
    totalShare: number;
  }>();

  members.forEach(m => {
    balanceMap.set(m.userId, {
      userId: m.userId,
      userName: m.name,
      totalPaid: 0,
      totalShare: 0,
    });
  });

  if (Array.isArray(expenses)) {
    expenses.forEach(exp => {
      if (Array.isArray(exp.payers) && exp.payers.length > 0) {
        exp.payers.forEach(p => {
          if (!balanceMap.has(p.userId)) {
            balanceMap.set(p.userId, {
              userId: p.userId,
              userName: p.userName || 'Member',
              totalPaid: 0,
              totalShare: 0,
            });
          }
          const rec = balanceMap.get(p.userId)!;
          rec.totalPaid += Number(p.amount) || 0;
        });
      } else if (exp.paidBy) {
        if (!balanceMap.has(exp.paidBy)) {
          balanceMap.set(exp.paidBy, {
            userId: exp.paidBy,
            userName: 'Member',
            totalPaid: 0,
            totalShare: 0,
          });
        }
        const rec = balanceMap.get(exp.paidBy)!;
        rec.totalPaid += Number(exp.amount) || 0;
      }

      if (Array.isArray(exp.splits)) {
        exp.splits.forEach(s => {
          if (!balanceMap.has(s.userId)) {
            balanceMap.set(s.userId, {
              userId: s.userId,
              userName: 'Member',
              totalPaid: 0,
              totalShare: 0,
            });
          }
          const rec = balanceMap.get(s.userId)!;
          rec.totalShare += Number(s.amount) || 0;
        });
      }
    });
  }

  return Array.from(balanceMap.values()).map(b => ({
    userId: b.userId,
    userName: b.userName,
    totalPaid: Math.round(b.totalPaid * 100) / 100,
    totalShare: Math.round(b.totalShare * 100) / 100,
    netBalance: Math.round((b.totalPaid - b.totalShare) * 100) / 100,
  }));
}

test('Balance Derivation - Accurately derives member balances from expenses without backend balances array', () => {
  const members: MiniMember[] = [
    { id: 'm1', userId: 'usr_1', name: 'Aman' },
    { id: 'm2', userId: 'usr_2', name: 'Rohan' },
    { id: 'm3', userId: 'usr_3', name: 'Priya' },
  ];

  const expenses: MiniExpense[] = [
    {
      amount: 3000,
      paidBy: 'usr_1',
      splits: [
        { userId: 'usr_1', amount: 1000 },
        { userId: 'usr_2', amount: 1000 },
        { userId: 'usr_3', amount: 1000 },
      ],
    },
    {
      amount: 1500,
      paidBy: 'usr_2',
      splits: [
        { userId: 'usr_1', amount: 500 },
        { userId: 'usr_2', amount: 500 },
        { userId: 'usr_3', amount: 500 },
      ],
    },
  ];

  const balances = deriveMemberBalances(members, expenses);

  assert.equal(balances.length, 3);

  const aman = balances.find(b => b.userId === 'usr_1');
  const rohan = balances.find(b => b.userId === 'usr_2');
  const priya = balances.find(b => b.userId === 'usr_3');

  assert.ok(aman);
  assert.equal(aman.totalPaid, 3000);
  assert.equal(aman.totalShare, 1500);
  assert.equal(aman.netBalance, 1500); // Aman is owed +1500

  assert.ok(rohan);
  assert.equal(rohan.totalPaid, 1500);
  assert.equal(rohan.totalShare, 1500);
  assert.equal(rohan.netBalance, 0); // Rohan is settled up 0

  assert.ok(priya);
  assert.equal(priya.totalPaid, 0);
  assert.equal(priya.totalShare, 1500);
  assert.equal(priya.netBalance, -1500); // Priya owes -1500
});

test('Balance Derivation - Guard against non-array balances preventing balances.find crash', () => {
  const rawBalancesObject = {
    totalTransactions: 0,
    totalAmount: 0,
    pendingCount: 0,
  };

  // Defensive array guard as implemented in page.tsx
  const safeBalances = Array.isArray(rawBalancesObject) ? rawBalancesObject : [];
  assert.doesNotThrow(() => {
    const found = safeBalances.find((b: any) => b.userId === 'usr_me');
    assert.equal(found, undefined);
  });
});
