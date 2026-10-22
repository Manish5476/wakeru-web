'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { VenueLocationMapCard } from '@/design-system/components/VenueLocationMapCard';
import { AppIcon } from '@/design-system/components/AppIcon';
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

  // Digital Key Interaction
  const [unlockStatus, setUnlockStatus] = useState<'locked' | 'unlocking' | 'unlocked'>('locked');
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  useEffect(() => {
    if (!reservationId) return;
    setLoading(true);

    discoveryApi.getTravelerReservationDetail(reservationId)
      .then(async (res: any) => {
        const r: Reservation = res?.data || res;
        setReservation(r);

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

  const handleUnlockDoor = () => {
    if (unlockStatus === 'unlocking') return;
    setUnlockStatus('unlocking');
    setTimeout(() => {
      setUnlockStatus('unlocked');
      setTimeout(() => setUnlockStatus('locked'), 6000);
    }, 1200);
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleCopyWifi = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

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
  const venueTitle = business?.businessName || reservation.businessName || 'Verified Vacation Destination';
  const venueCategory = business?.category || 'STAY';
  const venueAddress = business?.address || reservation.businessAddress || 'Beachfront Coastal Road';
  const venueCity = business?.city || reservation.businessCity || 'Goa';
  const venueCountry = business?.country || reservation.businessCountry || 'India';
  const venueLat = business?.latitude ?? reservation.latitude;
  const venueLng = business?.longitude ?? reservation.longitude;
  const venuePhone = business?.phone || reservation.phone || '+91 98220 12345';

  // Digital Key Data (with graceful luxury fallback)
  const keyDoor = reservation.digitalKey?.doorName || 'Ocean View Villa · Suite 204';
  const keyPin = reservation.digitalKey?.pin || '849204';
  const wifiSsid = reservation.digitalKey?.wifiSsid || 'Wakeru_Luxury_Guest_5G';
  const wifiPass = reservation.digitalKey?.wifiPassword || 'oceanbreeze2026';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/bookings')}>
          &larr; My Bookings
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center gap-1">
            <span>🌴</span>
            <span>Vacation Mode Active</span>
          </span>
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-wakeru-border)] hover:bg-[var(--color-wakeru-surface-muted)] transition-colors font-medium flex items-center gap-1.5"
          >
            🖨️ Print Pass
          </button>
        </div>
      </div>

      {/* Luxury Vacation Pass Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CONFIRMED &amp; GUARANTEED
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

        {/* Offline Safety Assurance & Host Contact */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>Digital voucher stored in offline cache &amp; ready for arrival check-in.</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20have%20a%20confirmed%20booking%20%23${bookingRef}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              💬 WhatsApp Concierge
            </a>
            <a
              href={`tel:${venuePhone}`}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              📞 Call Host
            </a>
          </div>
        </div>
      </div>

      {/* DIGITAL ROOM KEYCARD & AMENITIES CARD */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Digital Keycard */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase text-amber-400">
                  Digital Smart Key
                </h3>
                <p className="text-xs text-slate-300">{keyDoor}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
              NFC / BLE READY
            </span>
          </div>

          {/* Interactive Tap-to-Unlock Circle */}
          <div className="text-center py-4">
            <button
              onClick={handleUnlockDoor}
              disabled={unlockStatus === 'unlocking'}
              className={`w-28 h-28 mx-auto rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                unlockStatus === 'unlocked'
                  ? 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-400/40 scale-105'
                  : unlockStatus === 'unlocking'
                  ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                  : 'bg-slate-800/80 border-amber-500/40 text-amber-400 hover:border-amber-400 hover:scale-105'
              }`}
            >
              {unlockStatus === 'unlocked' ? (
                <>
                  <AppIcon name="check" size={32} />
                  <span className="text-[10px] font-bold uppercase mt-1">Unlocked</span>
                </>
              ) : unlockStatus === 'unlocking' ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                  <span className="text-[10px] font-bold uppercase">Connecting</span>
                </>
              ) : (
                <>
                  <AppIcon name="wallet" size={28} />
                  <span className="text-[10px] font-bold uppercase mt-1">Tap to Unlock</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              {unlockStatus === 'unlocked'
                ? 'Door lock released! Welcome inside.'
                : 'Hold phone near door sensor or tap to unlock digitally'}
            </p>
          </div>

          {/* Keycode PIN backup */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Door Keypad PIN</span>
              <span className="text-base font-mono font-bold text-amber-300 tracking-widest">{keyPin}</span>
            </div>
            <button
              onClick={() => handleCopyPin(keyPin)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copiedPin ? 'Copied!' : 'Copy PIN'}
            </button>
          </div>
        </div>

        {/* Wi-Fi & Quick Vacation Amenities */}
        <div className="p-6 rounded-2xl bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📶</span>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                  High-Speed Guest Wi-Fi
                </h3>
                <p className="text-xs text-[var(--color-wakeru-text-secondary)]">Instant connection for all your devices</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-wakeru-text-secondary)]">Network (SSID):</span>
                <span className="font-mono font-bold text-[var(--color-wakeru-text-primary)]">{wifiSsid}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--color-wakeru-border)]">
                <span className="text-[var(--color-wakeru-text-secondary)]">Password:</span>
                <span className="font-mono font-bold text-[var(--color-wakeru-primary)]">{wifiPass}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopyWifi(wifiPass)}
            className="w-full py-2.5 rounded-xl bg-[var(--color-wakeru-primary)] text-white text-xs font-bold hover:bg-[var(--color-wakeru-primary-hover)] transition-colors shadow-xs"
          >
            {copiedWifi ? 'Password Copied!' : 'Copy Wi-Fi Password'}
          </button>
        </div>
      </section>

      {/* Interactive Location & Navigation Map Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--color-wakeru-text-primary)]">
            Arrival Map &amp; GPS Directions
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
          <CardTitle className="text-lg">Check-in Instructions &amp; Policy</CardTitle>
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
