import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;

  const analytics = {
    businessId: id,
    period: 'last_30_days',
    metrics: {
      totalViews: 4180,
      uniqueVisitors: 3120,
      leadInquiries: 38,
      bookingRequests: 14,
      confirmedBookings: 9,
      conversionRatePct: 23.6,
      totalGmvMinor: 48500000,
      currency: 'INR',
    },
    funnel: [
      { stage: 'Catalog Views', count: 4180, dropoffPct: 0 },
      { stage: 'Property Detail Opened', count: 1850, dropoffPct: 55.7 },
      { stage: 'Price Calculator Checked', count: 540, dropoffPct: 70.8 },
      { stage: 'Booking Request Submitted', count: 14, dropoffPct: 97.4 },
      { stage: 'Confirmed & Key Issued', count: 9, dropoffPct: 35.7 },
    ],
  };

  return jsonSuccess({ analytics });
}
