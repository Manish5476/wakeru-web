'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { VenueLocationMapCard } from '@/design-system/components/VenueLocationMapCard';
import { discoveryApi } from '@/api/discover';
import { Reservation, Business } from '@/types/api';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params?.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reservationId) return;
    setLoading(true);

    discoveryApi.getTravelerReservationDetail(reservationId)
      .then(async (res: any) => {
        const r: Reservation = res?.data || res;
        setReservation(r);

        // If businessId is present, fetch full business coordinates & details
        if (r?.businessId) {
          try {
            const bRes: any = await discoveryApi.getBusinessDetail(r.businessId);
            setBusiness(bRes?.data || bRes);
          } catch (e) {
            console.warn('Could not load extra business detail for reservation', e);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load reservation', err);
        setError('Failed to load reservation details.');
      })
      .finally(() => setLoading(false));
  }, [reservationId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        <Card className="animate-pulse h-96 bg-[var(--color-wakeru-surface-muted)]"></Card>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="text-center py-20 text-red-500">
            <span className="text-4xl block mb-2">⚠️</span>
            <h2 className="text-xl font-bold mb-1">{error || 'Reservation not found.'}</h2>
            <p className="text-sm text-[var(--color-wakeru-text-secondary)] mb-6">
              The requested voucher does not exist or has expired.
            </p>
            <Button variant="secondary" onClick={() => router.push('/bookings')}>
              &larr; Back to My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookingRef = reservation.bookingReference || reservation.bookingRequestId || reservation.id;
  const venueTitle = business?.businessName || reservation.businessName || 'Verified Experience Destination';
  const venueCategory = business?.category || 'STAY';
  const venueAddress = business?.address || reservation.businessAddress || 'Local Address Confirmed';
  const venueCity = business?.city || reservation.businessCity || 'Goa';
  const venueCountry = business?.country || reservation.businessCountry || 'India';
  const venueLat = business?.latitude ?? reservation.latitude;
  const venueLng = business?.longitude ?? reservation.longitude;
  const venuePhone = business?.phone || reservation.phone;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/bookings')}>
          &larr; My Bookings
        </Button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-wakeru-border)] hover:bg-[var(--color-wakeru-surface-muted)] transition-colors font-medium flex items-center gap-1.5"
          >
            🖨️ Print Pass
          </button>
        </div>
      </div>

      {/* Luxury Pass Card Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CONFIRMED & GUARANTEED
              </span>
              <span className="text-xs text-slate-400 font-mono">
                PASS #{bookingRef.substring(0, 12)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {venueTitle}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              📍 {venueAddress}, {venueCity}, {venueCountry}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Reservation Code
            </div>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400 tracking-wider">
              {bookingRef}
            </div>
          </div>
        </div>

        {/* Voucher Key Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Status</span>
            <span className="text-sm font-bold text-emerald-400">
              {reservation.status}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Service</span>
            <span className="text-sm font-bold text-slate-100 truncate block">
              {reservation.serviceName || 'Direct Booking'}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Date</span>
            <span className="text-sm font-bold text-slate-100">
              {reservation.bookingDate ? new Date(reservation.bookingDate).toLocaleDateString() : 'Confirmed'}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">Confirmed At</span>
            <span className="text-sm font-bold text-slate-100">
              {reservation.vendorConfirmedAt ? new Date(reservation.vendorConfirmedAt).toLocaleDateString() : 'Instant'}
            </span>
          </div>
        </div>

        {/* Offline Safety Assurance */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Digital voucher stored in offline cache & ready for arrival check-in.</span>
          </div>
          {venuePhone && (
            <a
              href={`tel:${venuePhone}`}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 shrink-0"
            >
              📞 Call Host
            </a>
          )}
        </div>
      </div>

      {/* Interactive Location & Navigation Map Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-wakeru-text-primary)]">
            Arrival Map & GPS Directions
          </h2>
          <span className="text-xs text-[var(--color-wakeru-text-secondary)]">
            Open in Google Maps or tap Fullscreen Map
          </span>
        </div>

        <VenueLocationMapCard
          venueName={venueTitle}
          category={venueCategory}
          address={venueAddress}
          city={venueCity}
          country={venueCountry}
          latitude={venueLat}
          longitude={venueLng}
          googleMapsUrl={business?.googleMapsUrl || reservation.googleMapsUrl}
          phone={venuePhone}
          cardTitle="Confirmed Arrival Destination"
          isConfirmedBooking={true}
          bookingRef={bookingRef}
          rating={business?.rating}
          reviewCount={business?.reviewCount}
        />
      </section>

      {/* Check-in Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Check-in Instructions & Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--color-wakeru-text-secondary)]">
          <p>
            • Present this digital voucher or state booking code <strong className="text-[var(--color-wakeru-text-primary)] font-mono">{bookingRef}</strong> upon arrival at the venue.
          </p>
          <p>
            • Valid government-issued photo ID is required for identity verification during check-in.
          </p>
          <p>
            • In case of flight delays or late arrival, please notify the host directly via phone or WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

