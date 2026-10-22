export type SettlementStatus =
  | 'PENDING'
  | 'INITIATED'
  | 'CONFIRMED'
  | 'DISPUTED'
  | 'CANCELLED';

export interface ISettlementTransaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toUserUpi?: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  paymentMethod?: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD';
  upiDeepLink?: string;
  transactionRef?: string;
  initiatedAt?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface ISettlement {
  _id: string;
  id?: string;
  tripId: string;
  currency: string;
  transactions: ISettlementTransaction[];
  totalSettlementVolume: number;
  isFullySettled: boolean;
  updatedAt: string;
}

export interface MemberBalance {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = owed money, negative = owes money
}
