import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { IExpense, ExpenseCategory, ExpenseSummary } from '@/types/expense.types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  const { id: tripId } = await params;
  const tripExpenses = db.expenses.filter(e => e.tripId === tripId);
  const currentUserId = auth.user.id;

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

    if (exp.paidBy === currentUserId) {
      myTotalPaid += exp.amount;
    }

    const mySplit = exp.splits?.find(s => s.userId === currentUserId);
    if (mySplit) {
      myTotalShare += mySplit.amount;
    }
  });

  const summary: ExpenseSummary = {
    totalAmount,
    categoryBreakdown: initialCategory,
    myTotalPaid,
    myTotalShare,
    myNetBalance: myTotalPaid - myTotalShare,
  };

  return jsonSuccess({ expenses: tripExpenses, summary });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['TRAVELER', 'VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id: tripId } = await params;
  const trip = db.trips.find(t => t.id === tripId || t._id === tripId);

  if (!trip) {
    return jsonError('NOT_FOUND', `Trip with ID "${tripId}" was not found`, 404);
  }

  try {
    const data = await req.json();
    const category: ExpenseCategory = data.category || 'other';

    const newExpense: IExpense = {
      _id: `exp_${Date.now()}`,
      id: `exp_${Date.now()}`,
      tripId,
      title: data.title || 'Untitled Expense',
      amount: Number(data.amount) || 0,
      currency: data.currency || trip.currency || 'INR',
      category,
      date: data.date || new Date().toISOString().split('T')[0],
      paidBy: data.paidBy || auth.user.id,
      paidByName: data.paidByName || auth.user.name,
      splitType: data.splitType || 'EQUAL',
      splits: data.splits || [],
      lineItems: data.lineItems || [],
      notes: data.notes || '',
      receiptUrl: data.receiptUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.expenses.unshift(newExpense);

    // Update trip total spent
    trip.spentBase = (trip.spentBase || 0) + newExpense.amount;

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'EXPENSE_CREATE',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: newExpense.id || newExpense._id,
      details: `Added ${newExpense.currency} ${newExpense.amount} for "${newExpense.title}" in trip "${trip.title}"`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({ expense: newExpense }, 201);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to create expense', 400);
  }
}
