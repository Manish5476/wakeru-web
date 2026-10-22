import { ITrip } from '@/types/trip.types';
import { ITravelPlan } from '@/types/travelPlan.types';
import { IExpense } from '@/types/expense.types';
import { INITIAL_TRIPS, INITIAL_TRAVEL_PLAN, INITIAL_EXPENSES } from '@/lib/mockTripsData';
import { MOCK_BUSINESSES } from '@/api/discover';
import { Business, BookingRequest, Reservation } from '@/types/api';

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorRole: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface DemandVelocityItem {
  destination: string;
  region: string;
  searchVolume: number;
  growthRatePct: number;
  averageBudget: number;
  avgGroupSize: number;
  popularCategory: string;
}

// In-memory data store for server-side Next.js route handlers
class ServerDatabase {
  public trips: ITrip[] = JSON.parse(JSON.stringify(INITIAL_TRIPS));
  public travelPlans: Record<string, ITravelPlan> = {
    trip_goa_2026: JSON.parse(JSON.stringify(INITIAL_TRAVEL_PLAN)),
  };
  public expenses: IExpense[] = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
  public businesses: Business[] = JSON.parse(JSON.stringify(MOCK_BUSINESSES));

  public bookings: BookingRequest[] = [
    {
      id: 'req_101',
      bookingReference: 'WKR-101',
      businessId: 'biz_anjuna_villa',
      businessName: 'Anjuna Beachfront Sunset Villa & Spa',
      serviceId: 'srv_villa_full',
      serviceName: 'Full Private Ocean Villa (4 Suites)',
      travelerHash: 'usr_me',
      status: 'REQUESTED',
      priceSnapshotMinor: 9600000,
      currency: 'INR',
      bookingDate: '2026-11-14',
      createdAt: '2026-10-21T14:30:00Z',
    },
    {
      id: 'req_102',
      bookingReference: 'WKR-102',
      businessId: 'biz_anjuna_villa',
      businessName: 'Anjuna Beachfront Sunset Villa & Spa',
      serviceId: 'srv_villa_full',
      serviceName: 'Full Private Ocean Villa (4 Suites)',
      travelerHash: 'usr_rohan',
      status: 'ACCEPTED',
      priceSnapshotMinor: 12000000,
      currency: 'INR',
      bookingDate: '2026-12-24',
      createdAt: '2026-10-18T09:15:00Z',
    },
    {
      id: 'req_103',
      bookingReference: 'WKR-103',
      businessId: 'biz_anjuna_villa',
      businessName: 'Anjuna Beachfront Sunset Villa & Spa',
      serviceId: 'srv_chef_tasting',
      serviceName: 'Goan Coastal Seafood BBQ & Tasting',
      travelerHash: 'usr_elena',
      status: 'DECLINED',
      priceSnapshotMinor: 1400000,
      currency: 'INR',
      bookingDate: '2026-10-15',
      rejectionReason: 'Fully booked for this date/time',
      createdAt: '2026-10-12T11:45:00Z',
    },
  ];

  public reservations: Reservation[] = [
    {
      id: 'res_201',
      bookingRequestId: 'req_102',
      bookingReference: 'WKR-102',
      businessId: 'biz_anjuna_villa',
      businessName: 'Anjuna Beachfront Sunset Villa & Spa',
      serviceName: 'Full Private Ocean Villa (4 Suites)',
      status: 'CONFIRMED',
      priceMinor: 9600000,
      currency: 'INR',
      bookingDate: '2026-11-14',
      vendorConfirmedAt: '2026-10-19T10:00:00Z',
      digitalKey: {
        code: 'PASS-VILLA-78921',
        pin: '849201',
        doorName: 'Main Ocean Gate & Master Villa Entrance',
        wifiSsid: 'AnjunaVilla_HighSpeed_5G',
        wifiPassword: 'SunsetRetreat2026!',
        validUntil: '2026-11-18T11:00:00Z',
      },
    },
  ];

  public leads = [
    {
      id: 'lead_1',
      businessId: 'biz_anjuna_villa',
      travelerName: 'Pooja Reddy',
      travelerPhone: '+91 97401 22390',
      travelerEmail: 'pooja.r@outlook.com',
      source: 'TripSplit Discover',
      message: 'Looking for a private villa for a 3-day bachelorette retreat in mid November. Is early check-in possible?',
      interestedDates: 'Nov 14 - Nov 17, 2026',
      partySize: 7,
      status: 'HOT',
      createdAt: '2026-10-21T18:00:00Z',
    },
    {
      id: 'lead_2',
      businessId: 'biz_anjuna_villa',
      travelerName: 'Siddharth Roy',
      travelerPhone: '+91 98200 44123',
      travelerEmail: 'siddharth.roy@fintech.co',
      source: 'Instagram Ad Campaign',
      message: 'Can we book just the chef seafood tasting experience without staying at the villa?',
      interestedDates: 'Nov 20, 2026',
      partySize: 4,
      status: 'CONTACTED',
      createdAt: '2026-10-20T11:20:00Z',
    },
  ];

  public auditLogs: AuditLog[] = [
    {
      id: 'log_01',
      action: 'BOOKING_ACCEPT',
      actorId: 'ven_anjuna_host',
      actorRole: 'VENDOR',
      targetId: 'req_102',
      details: 'Vendor accepted booking for 8 guests (Dec 24 - Dec 28, 2026)',
      createdAt: '2026-10-21T14:32:00Z',
    },
    {
      id: 'log_02',
      action: 'VERIFICATION_APPROVED',
      actorId: 'admin_usr_01',
      actorRole: 'ADMIN',
      targetId: 'biz_anjuna_villa',
      details: 'Administrator verified business licenses and GST credentials.',
      createdAt: '2026-10-20T16:45:00Z',
    },
    {
      id: 'log_03',
      action: 'EXPENSE_CREATE',
      actorId: 'usr_me',
      actorRole: 'TRAVELER',
      targetId: 'exp_01',
      details: 'Logged shared villa rental payment (INR 42,000) split across 4 members.',
      createdAt: '2026-10-20T12:00:00Z',
    },
    {
      id: 'log_04',
      action: 'SMART_KEY_GENERATE',
      actorId: 'system',
      actorRole: 'SYSTEM',
      targetId: 'res_201',
      details: 'Automated IoT smart lock pass issued for Anjuna Beachfront Villa.',
      createdAt: '2026-10-19T10:05:00Z',
    },
  ];

  public demandVelocity: DemandVelocityItem[] = [
    {
      destination: 'Goa',
      region: 'West Coast',
      searchVolume: 142500,
      growthRatePct: 28.4,
      averageBudget: 65000,
      avgGroupSize: 5.4,
      popularCategory: 'Villas & Beach Lounges',
    },
    {
      destination: 'Manali & Kasol',
      region: 'North Himalayas',
      searchVolume: 98200,
      growthRatePct: 21.2,
      averageBudget: 42000,
      avgGroupSize: 4.8,
      popularCategory: 'Mountain Cabins & Treks',
    },
    {
      destination: 'Jaipur & Udaipur',
      region: 'Rajasthan',
      searchVolume: 87400,
      growthRatePct: 17.8,
      averageBudget: 55000,
      avgGroupSize: 4.2,
      popularCategory: 'Heritage Haveli Stays',
    },
    {
      destination: 'Pondicherry',
      region: 'Tamil Nadu Coast',
      searchVolume: 64100,
      growthRatePct: 15.3,
      averageBudget: 38000,
      avgGroupSize: 3.8,
      popularCategory: 'French Quarter Boutique Stays',
    },
    {
      destination: 'Munnar & Wayanad',
      region: 'Kerala Hills',
      searchVolume: 58900,
      growthRatePct: 19.6,
      averageBudget: 46000,
      avgGroupSize: 4.5,
      popularCategory: 'Tea Plantation Bungalows',
    },
  ];
}

// Global singleton to persist state in dev hot-reloads
const globalForDb = globalThis as unknown as { serverDb?: ServerDatabase };
export const db = globalForDb.serverDb || new ServerDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.serverDb = db;
