'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';
import { AppIcon } from '@/design-system/components/AppIcon';
import { VenueLocationMapCard } from '@/design-system/components/VenueLocationMapCard';
import { discoveryApi } from '@/api/discover';
import { tripsApi } from '@/api/trips';
import { Business, BusinessService, BusinessReview, BookingRequest } from '@/types/api';
import { ITrip } from '@/types/trip.types';

export default function BusinessDetailClientPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Trips integration
  const [myTrips, setMyTrips] = useState<ITrip[]>([]);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<BusinessService | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRequest | null>(null);

  // Add to Itinerary Modal State
  const [addToTripModalOpen, setAddToTripModalOpen] = useState(false);
  const [targetTripId, setTargetTripId] = useState('');
  const [itineraryDayTheme, setItineraryDayTheme] = useState('');
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      discoveryApi.getBusinessDetail(businessId).catch(() => null),
      discoveryApi.getBusinessServices(businessId).catch(() => []),
      discoveryApi.getBusinessReviews(businessId).catch(() => []),
      tripsApi.getMyTrips().catch(() => ({ trips: [] })),
    ]).then(([b, s, r, t]) => {
      if (b) {
        setBusiness((b as any).data || b);
      }
      setServices((s as any).data || s);
      setReviews((r as any).data || r);
      if (t?.trips) {
        setMyTrips(t.trips);
        if (t.trips.length > 0) {
          setTargetTripId(t.trips[0]._id || t.trips[0].id || '');
        }
      }
      setLoading(false);
    });
  }, [businessId]);

  const handleOpenBooking = (service?: BusinessService) => {
    setSelectedService(service || (services.length > 0 ? services[0] : null));
    setConfirmedBooking(null);
    setBookingModalOpen(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    try {
      setSubmittingBooking(true);
      const priceMinor = selectedService
        ? (selectedService.basePriceMinor ?? selectedService.priceMinor ?? 500000)
        : 500000;

      const payload = {
        serviceId: selectedService?.id,
        serviceName: selectedService?.serviceName || selectedService?.name || 'Direct Reservation',
        businessName: business.businessName,
        bookingDate,
        guestsCount,
        priceMinor,
        currency: selectedService?.currency || 'INR',
        notes: bookingNotes,
        tripId: selectedTripId || undefined,
      };

      const res = await discoveryApi.createBookingRequest(
        businessId,
        payload,
        `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      );

      setConfirmedBooking(res);
    } catch (err) {
      console.error('Failed to submit booking:', err);
      alert('Failed to request booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleConfirmAddToTrip = async () => {
    if (!targetTripId || !business) return;
    try {
      setAddingToTrip(true);
      const { plan } = await tripsApi.getTravelPlan(targetTripId);
      const nextDayNum = plan.itinerary.length + 1;

      const newDay = {
        dayNumber: nextDayNum,
        theme: itineraryDayTheme || `Visit ${business.businessName}`,
        morning: `Depart for ${business.businessName}`,
        afternoon: `Experience local offerings and dining at ${business.businessName}`,
        sunset: `Leisure time and sunset views around ${business.city}`,
        accommodation: business.category === 'STAY' ? business.businessName : undefined,
      };

      const updated = [...plan.itinerary, newDay];
      await tripsApi.updateTravelPlan(targetTripId, { itinerary: updated });

      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        setAddToTripModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to add to trip itinerary:', err);
    } finally {
      setAddingToTrip(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 animate-pulse bg-[var(--color-wakeru-surface-muted)] h-96 rounded-xl mt-8"></div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-24">
        <h2 className="text-xl font-bold">Business not found</h2>
        <p className="text-[var(--color-wakeru-text-secondary)] mt-2">
          The business you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-primary)] transition-colors"
        >
          <AppIcon name="arrow-left" size={14} />
          <span>Back to Discover</span>
        </Link>
        <span className="text-xs text-[var(--color-wakeru-text-tertiary)] uppercase tracking-wider font-bold">
          Verified Destination
        </span>
      </div>

      {/* Header & Identity */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge variant="default" className="capitalize">{business.category}</Badge>
            {business.verificationStatus === 'VERIFIED' && <Badge variant="verified">✓ Verified Host</Badge>}
            {business.rating && (
              <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                ★ {business.rating.toFixed(1)} ({business.reviewCount ?? reviews.length} reviews)
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            {business.businessName}
          </h1>
          <p className="text-[var(--color-wakeru-text-secondary)] mt-2 text-base md:text-lg flex items-center gap-2">
            <span>📍 {business.address}, {business.city}, {business.country}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <Button
            size="lg"
            onClick={() => handleOpenBooking()}
            className="shadow-md flex items-center gap-2"
          >
            <span>Request Booking</span>
          </Button>

          {myTrips.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setAddToTripModalOpen(true)}
              className="flex items-center gap-2"
            >
              <AppIcon name="plane" size={16} />
              <span>Add to Trip</span>
            </Button>
          )}

          <Link href={`/discover/business/${businessId}/review`}>
            <Button variant="ghost" size="lg" className="text-xs">
              Write Review
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-wakeru-text-primary)]">About</h2>
            <p className="text-[var(--color-wakeru-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {business.description || 'No description provided.'}
            </p>
          </section>

          {/* Available Services */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
                Available Services &amp; Offerings
              </h2>
              <span className="text-xs text-[var(--color-wakeru-text-secondary)] font-medium">
                {services.length} option{services.length === 1 ? '' : 's'} available
              </span>
            </div>

            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map(s => {
                  const sName = s.serviceName || s.name || 'Unnamed Option';
                  const price = ((s.basePriceMinor ?? s.priceMinor ?? 0) / 100);
                  const facilitiesList = Array.isArray(s.facilities) ? s.facilities : [];

                  return (
                    <Card key={s.id} className="overflow-hidden border border-[var(--color-wakeru-border)] hover:border-emerald-500/50 transition-colors">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                          {s.imageUrl ? (
                            <img
                              src={s.imageUrl}
                              alt={sName}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-800 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-wakeru-surface-muted)] flex items-center justify-center text-xl shrink-0">
                              ✨
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-base text-[var(--color-wakeru-text-primary)]">{sName}</h3>
                              {s.serviceType && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {s.serviceType.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            {s.description && (
                              <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1 line-clamp-2">
                                {s.description}
                              </p>
                            )}
                            {facilitiesList.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {facilitiesList.map((fac, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50"
                                  >
                                    ✓ {fac}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right sm:text-right shrink-0 self-end sm:self-center">
                          <div className="text-lg font-extrabold text-[var(--color-wakeru-text-primary)]">
                            ₹{price.toFixed(2)}
                          </div>
                          <div className="text-xs text-[var(--color-wakeru-text-muted)] font-medium">
                            {s.priceUnit || 'per unit'}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleOpenBooking(s)}
                            className="mt-2 text-xs"
                          >
                            Book This
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-[var(--color-wakeru-text-muted)] italic">No services listed yet.</p>
            )}
          </section>

          {/* Luxury Location & Navigation Map Card */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
                Venue Location &amp; Arrival
              </h2>
              <p className="text-sm text-[var(--color-wakeru-text-secondary)]">
                Interactive navigation map, direct GPS coordinates, and arrival directions.
              </p>
            </div>

            <VenueLocationMapCard
              venueName={business.businessName}
              category={business.category}
              address={business.address}
              city={business.city}
              country={business.country}
              latitude={business.latitude}
              longitude={business.longitude}
              googleMapsUrl={business.googleMapsUrl}
              phone={business.phone}
              rating={business.rating}
              reviewCount={business.reviewCount ?? reviews.length}
            />
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
                Traveler Reviews
              </h2>
              <Link href={`/discover/business/${businessId}/review`}>
                <span className="text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline">
                  + Add Your Review
                </span>
              </Link>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-amber-500">★ {r.rating} / 5</span>
                        <Badge variant="outline">Verified Booking</Badge>
                      </div>
                      <p className="text-[var(--color-wakeru-text-primary)]">{r.comment}</p>
                      {r.vendorReply && (
                        <div className="mt-4 p-3 bg-[var(--color-wakeru-surface-muted)] rounded-md border-l-2 border-emerald-500">
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-1">
                            Response from host
                          </p>
                          <p className="text-sm text-[var(--color-wakeru-text-secondary)]">{r.vendorReply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-wakeru-text-muted)]">No reviews yet. Be the first to review after your stay!</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Host &amp; Trust Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${business.verificationStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <span>Government identity {business.verificationStatus.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                <span>{reviews.length} authenticated reviews</span>
              </div>
              {business.phone && (
                <div className="pt-2 border-t text-xs space-y-1">
                  <span className="font-semibold block text-[var(--color-wakeru-text-primary)]">Verified Contact:</span>
                  <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline block font-mono">
                    📞 {business.phone}
                  </a>
                </div>
              )}
              {business.whatsapp && (
                <div className="text-xs">
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition-colors"
                  >
                    💬 WhatsApp Host
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST BOOKING MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={confirmedBooking ? 'Booking Request Submitted!' : `Reserve at ${business.businessName}`}
        description={
          confirmedBooking
            ? `Your booking code is ${confirmedBooking.bookingReference}. The host has been notified.`
            : 'Fill in your arrival date and preferences to request confirmation.'
        }
        maxWidth="md"
        footer={
          confirmedBooking ? (
            <div className="flex items-center justify-between w-full">
              <Link href="/bookings">
                <Button variant="primary">View My Bookings</Button>
              </Link>
              <Button variant="ghost" onClick={() => setBookingModalOpen(false)}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={submittingBooking}
                onClick={handleSubmitBooking}
              >
                Submit Booking Request
              </Button>
            </>
          )
        }
      >
        {confirmedBooking ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-[var(--color-wakeru-text-secondary)]">
                Booking Reference Code
              </div>
              <div className="text-2xl font-mono font-black text-amber-500 tracking-wider mt-1">
                {confirmedBooking.bookingReference}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-wakeru-surface-muted)] text-xs text-[var(--color-wakeru-text-secondary)]">
              🛡️ Cached in your offline vault. You will receive real-time notification once the host accepts.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
            {selectedService && (
              <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[var(--color-wakeru-text-primary)] block">
                    {selectedService.serviceName || selectedService.name}
                  </span>
                  <span className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    {selectedService.serviceType || 'Standard offering'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-[var(--color-wakeru-primary)]">
                    ₹{((selectedService.basePriceMinor ?? selectedService.priceMinor ?? 0) / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[var(--color-wakeru-text-tertiary)] block">
                    {selectedService.priceUnit || 'per unit'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                  Guests / Party Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guestsCount}
                  onChange={e => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            {myTrips.length > 0 && (
              <div>
                <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                  Link to Trip (Optional)
                </label>
                <select
                  value={selectedTripId}
                  onChange={e => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-medium"
                >
                  <option value="">Independent Reservation (No Trip)</option>
                  {myTrips.map(t => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.emoji} {t.title} ({t.destination})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--color-wakeru-text-tertiary)] mt-1">
                  Linking automatically adds this venue to your group trip ledger.
                </p>
              </div>
            )}

            <div>
              <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1">
                Special Requests / Notes to Host
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Late check-in around 8 PM, high-floor quiet room preferred..."
                value={bookingNotes}
                onChange={e => setBookingNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD TO TRIP ITINERARY MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addToTripModalOpen}
        onClose={() => setAddToTripModalOpen(false)}
        title={`Add ${business.businessName} to Trip Itinerary`}
        description="Choose which trip to integrate this venue into as a planned activity or stop."
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddToTripModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={addingToTrip}
              onClick={handleConfirmAddToTrip}
            >
              {addedSuccess ? '✓ Added to Itinerary!' : 'Confirm & Add to Trip'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1.5">
              Select Trip
            </label>
            <select
              value={targetTripId}
              onChange={e => setTargetTripId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-semibold"
            >
              {myTrips.map(t => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.emoji} {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[var(--color-wakeru-text-primary)] mb-1.5">
              Itinerary Day Headline / Theme
            </label>
            <input
              type="text"
              placeholder={`e.g. Afternoon at ${business.businessName}`}
              value={itineraryDayTheme}
              onChange={e => setItineraryDayTheme(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded text-xs font-medium"
            />
          </div>

          <p className="text-[11px] text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] p-3 rounded-lg">
            💡 This will append a new day and stop to your trip&apos;s collaborative schedule and sync with all companions.
          </p>
        </div>
      </Modal>
    </div>
  );
}
