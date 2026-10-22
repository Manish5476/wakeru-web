import test from 'node:test';
import assert from 'node:assert/strict';

// Split calculation engine equivalent to mobile TripSplit & backend
interface SplitParticipant {
  userId: string;
  share?: number;
  percentage?: number;
  exactAmount?: number;
}

function calculateSplits(
  amount: number,
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES',
  participants: SplitParticipant[]
): Record<string, number> {
  const result: Record<string, number> = {};
  const n = participants.length;
  if (n === 0) return result;

  switch (splitType) {
    case 'EQUAL': {
      const baseShare = Math.floor((amount / n) * 100) / 100;
      let remainder = Math.round((amount - baseShare * n) * 100) / 100;
      participants.forEach((p, idx) => {
        // First participant absorbs pennies to prevent rounding leakage
        const add = idx === 0 ? remainder : 0;
        result[p.userId] = Math.round((baseShare + add) * 100) / 100;
      });
      break;
    }
    case 'EXACT': {
      participants.forEach((p) => {
        result[p.userId] = p.exactAmount || 0;
      });
      const total = Object.values(result).reduce((sum, v) => sum + v, 0);
      assert.strictEqual(
        Math.round(total * 100) / 100,
        Math.round(amount * 100) / 100,
        `Exact split total (${total}) must equal expense amount (${amount})`
      );
      break;
    }
    case 'PERCENTAGE': {
      const totalPct = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
      assert.strictEqual(
        Math.round(totalPct),
        100,
        `Percentage split total (${totalPct}) must sum to 100%`
      );
      participants.forEach((p) => {
        result[p.userId] = Math.round(((amount * (p.percentage || 0)) / 100) * 100) / 100;
      });
      break;
    }
    case 'SHARES': {
      const totalShares = participants.reduce((sum, p) => sum + (p.share || 1), 0);
      participants.forEach((p) => {
        const share = p.share || 1;
        result[p.userId] = Math.round(((amount * share) / totalShares) * 100) / 100;
      });
      break;
    }
  }

  return result;
}

// Greedy Min-Cash-Flow algorithm for settlement minimization
interface SettlementTransaction {
  from: string;
  to: string;
  amount: number;
}

function simplifyDebts(balances: Record<string, number>): SettlementTransaction[] {
  // balances: positive means owed to person (creditor), negative means owes others (debtor)
  const netBalances = { ...balances };
  const transactions: SettlementTransaction[] = [];

  const round = (val: number) => Math.round(val * 100) / 100;

  while (true) {
    let maxDebtor = '';
    let maxCreditor = '';
    let minBal = -0.01;
    let maxBal = 0.01;

    for (const [person, bal] of Object.entries(netBalances)) {
      if (bal < minBal) {
        minBal = bal;
        maxDebtor = person;
      }
      if (bal > maxBal) {
        maxBal = bal;
        maxCreditor = person;
      }
    }

    if (!maxDebtor || !maxCreditor) {
      break;
    }

    const settleAmount = round(Math.min(-minBal, maxBal));
    if (settleAmount <= 0) break;

    transactions.push({
      from: maxDebtor,
      to: maxCreditor,
      amount: settleAmount,
    });

    netBalances[maxDebtor] = round(netBalances[maxDebtor] + settleAmount);
    netBalances[maxCreditor] = round(netBalances[maxCreditor] - settleAmount);
  }

  return transactions;
}

test('Split Engine - Equal Split distributes accurately without penny loss', () => {
  const participants = [{ userId: 'user_1' }, { userId: 'user_2' }, { userId: 'user_3' }];
  // 100 / 3 = 33.33 with 0.01 penny absorbed
  const splits = calculateSplits(100.0, 'EQUAL', participants);

  assert.strictEqual(splits['user_1'], 33.34);
  assert.strictEqual(splits['user_2'], 33.33);
  assert.strictEqual(splits['user_3'], 33.33);

  const sum = Object.values(splits).reduce((a, b) => a + b, 0);
  assert.strictEqual(Math.round(sum * 100) / 100, 100.0);
});

test('Split Engine - Exact Split validates matching sum', () => {
  const participants = [
    { userId: 'user_1', exactAmount: 45.5 },
    { userId: 'user_2', exactAmount: 54.5 },
  ];
  const splits = calculateSplits(100.0, 'EXACT', participants);
  assert.strictEqual(splits['user_1'], 45.5);
  assert.strictEqual(splits['user_2'], 54.5);
});

test('Split Engine - Percentage Split validates 100% total', () => {
  const participants = [
    { userId: 'user_1', percentage: 60 },
    { userId: 'user_2', percentage: 40 },
  ];
  const splits = calculateSplits(250.0, 'PERCENTAGE', participants);
  assert.strictEqual(splits['user_1'], 150.0);
  assert.strictEqual(splits['user_2'], 100.0);
});

test('Split Engine - Shares Split divides proportionally', () => {
  const participants = [
    { userId: 'user_1', share: 2 },
    { userId: 'user_2', share: 1 },
    { userId: 'user_3', share: 1 },
  ];
  // 200 total / 4 shares = 50 per share
  const splits = calculateSplits(200.0, 'SHARES', participants);
  assert.strictEqual(splits['user_1'], 100.0);
  assert.strictEqual(splits['user_2'], 50.0);
  assert.strictEqual(splits['user_3'], 50.0);
});

test('Min-Cash-Flow - Reduces 3-way circular debt to minimal payments', () => {
  // Alice owes Bob 100, Bob owes Charlie 100, Charlie owes Alice 50
  // Net: Alice owes 50 (-50), Bob net 0, Charlie is owed 50 (+50)
  const balances = {
    Alice: -50,
    Bob: 0,
    Charlie: 50,
  };

  const txs = simplifyDebts(balances);
  assert.strictEqual(txs.length, 1);
  assert.strictEqual(txs[0].from, 'Alice');
  assert.strictEqual(txs[0].to, 'Charlie');
  assert.strictEqual(txs[0].amount, 50);
});

test('Min-Cash-Flow - Complex 4-party network reduces efficiently', () => {
  // A owes 200 (-200), B owes 100 (-100), C is owed 150 (+150), D is owed 150 (+150)
  const balances = {
    A: -200,
    B: -100,
    C: 150,
    D: 150,
  };

  const txs = simplifyDebts(balances);
  // Greedy matches largest debtor A (-200) with largest creditor C (+150) -> 150
  // Remaining: A (-50), B (-100), D (+150) -> B pays D 100, A pays D 50. Total 3 transactions instead of 6.
  assert.strictEqual(txs.length, 3);
  const totalSettled = txs.reduce((sum, t) => sum + t.amount, 0);
  assert.strictEqual(totalSettled, 300);
});
