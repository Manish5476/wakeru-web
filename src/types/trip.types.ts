export type TripRole = 'owner' | 'organizer' | 'editor' | 'member' | 'viewer';
export type TripVisibility = 'private' | 'shared' | 'public';
export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface ITripMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: TripRole;
  joinedAt: string;
  upiId?: string;
}

export interface IStop {
  _id?: string;
  id?: string;
  name: string;
  emoji?: string;
  country?: string;
  location?: {
    lat: number;
    lng: number;
    formattedAddress?: string;
  };
  currency?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  notes?: string;
  clientOperationId?: string;
}

export interface ITrip {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
  currency: string;
  budget?: number;
  spentBase?: number;
  coverImage?: string;
  emoji?: string;
  visibility: TripVisibility;
  status: TripStatus;
  ownerId: string;
  members: ITripMember[];
  stops?: IStop[];
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripStats {
  activeTripsCount: number;
  totalSpentBase: number;
  totalCountries: number;
  totalTravelers: number;
}

export interface TripSummary {
  tripId: string;
  totalSpent: number;
  currency: string;
  budgetHealth: 'HEALTHY' | 'WARNING' | 'EXCEEDED';
  budgetPercentage: number;
  userBalance: number; // positive = owed money, negative = owes money
  memberCount: number;
  expenseCount: number;
}
