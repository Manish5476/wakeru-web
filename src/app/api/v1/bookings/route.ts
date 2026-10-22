import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { BookingRequest } from '@/types/api';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  // Filter bookings for the user or return all for admin
  let userBookings = db.bookings;
  if (auth.user.role === 'TRAVELER') {
    userBookings = db.bookings.filter(
      b => b.travelerHash === auth.user.id || b.travelerHash === 'usr_me'
    );
  }

  return jsonSuccess({ bookings: userBookings });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  try {
    const data = await req.json();
    const newId = `req_${Date.now()}`;
    const priceMinor = Number(data.priceSnapshotMinor || (data.totalPrice ? data.totalPrice * 100 : 500000));

    const newBooking: BookingRequest = {
      id: newId,
      bookingReference: `WKR-${Math.floor(1000 + Math.random() * 9000)}`,
      businessId: data.businessId,
      businessName: data.businessName || 'Selected Venue',
      serviceId: data.serviceId,
      serviceName: data.serviceName || 'Standard Reservation',
      travelerHash: auth.user.id,
      bookingDate: data.bookingDate || data.checkInDate || new Date().toISOString().split('T')[0],
      priceSnapshotMinor: priceMinor,
      currency: data.currency || 'INR',
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    };

    db.bookings.unshift(newBooking);

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BOOKING_CREATE',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: newId,
      details: `Traveler requested booking at "${newBooking.businessName}"`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({ booking: newBooking }, 201);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Invalid booking request', 400);
  }
}
