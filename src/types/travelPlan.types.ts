export interface IItineraryDay {
  dayNumber: number;
  date?: string;
  theme?: string;
  morning?: string;
  afternoon?: string;
  sunset?: string;
  accommodation?: string;
  transport?: string;
  notes?: string;
}

export interface IPackingItem {
  id: string;
  name: string;
  category: 'essentials' | 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medical';
  checked: boolean;
  assignedTo?: string;
  assignedToName?: string;
}

export interface IContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ITravelPlan {
  _id: string;
  tripId: string;
  itinerary: IItineraryDay[];
  packingList: IPackingItem[];
  emergencyContacts: IContact[];
  aiAssistantNotes?: string;
  updatedAt: string;
}
