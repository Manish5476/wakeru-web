import test from 'node:test';
import assert from 'node:assert/strict';

interface Budget {
  category: string;
  limit: number;
  spent: number;
}

interface LendingRecord {
  type: 'LENT' | 'BORROWED';
  amount: number;
  status: 'PENDING' | 'SETTLED';
}

function calculateBudgetStatus(budget: Budget): {
  percent: number;
  status: 'healthy' | 'warning' | 'danger';
} {
  const percent = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
  let status: 'healthy' | 'warning' | 'danger' = 'healthy';
  if (percent >= 100) {
    status = 'danger';
  } else if (percent >= 80) {
    status = 'warning';
  }
  return { percent, status };
}

function calculateLendingNet(records: LendingRecord[]): {
  totalLent: number;
  totalBorrowed: number;
  netPending: number;
} {
  let totalLent = 0;
  let totalBorrowed = 0;

  for (const r of records) {
    if (r.status === 'PENDING') {
      if (r.type === 'LENT') {
        totalLent += r.amount;
      } else {
        totalBorrowed += r.amount;
      }
    }
  }

  return {
    totalLent,
    totalBorrowed,
    netPending: totalLent - totalBorrowed,
  };
}

test('Finance Engine - Budget Health: Healthy (< 80%)', () => {
  const budget: Budget = { category: 'Dining', limit: 10000, spent: 5000 };
  const res = calculateBudgetStatus(budget);
  assert.strictEqual(res.percent, 50);
  assert.strictEqual(res.status, 'healthy');
});

test('Finance Engine - Budget Health: Warning (80% - 99%)', () => {
  const budget: Budget = { category: 'Flights', limit: 20000, spent: 17000 };
  const res = calculateBudgetStatus(budget);
  assert.strictEqual(res.percent, 85);
  assert.strictEqual(res.status, 'warning');
});

test('Finance Engine - Budget Health: Danger (>= 100%)', () => {
  const budget: Budget = { category: 'Activities', limit: 5000, spent: 5500 };
  const res = calculateBudgetStatus(budget);
  assert.strictEqual(res.percent, 110);
  assert.strictEqual(res.status, 'danger');
});

test('Finance Engine - Lending & IOUs net balance calculation', () => {
  const records: LendingRecord[] = [
    { type: 'LENT', amount: 1500, status: 'PENDING' },
    { type: 'LENT', amount: 2000, status: 'PENDING' },
    { type: 'BORROWED', amount: 800, status: 'PENDING' },
    { type: 'BORROWED', amount: 500, status: 'SETTLED' }, // Settled excluded from pending
  ];

  const net = calculateLendingNet(records);
  assert.strictEqual(net.totalLent, 3500);
  assert.strictEqual(net.totalBorrowed, 800);
  assert.strictEqual(net.netPending, 2700);
});
