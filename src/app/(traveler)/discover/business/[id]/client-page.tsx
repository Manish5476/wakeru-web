'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/components/Table';
import { VenueLocationMapCard } from '@/design-system/components/VenueLocationMapCard';
import { discoveryApi } from '@/api/discover';
import { Business, BusinessService, BusinessReview } from '@/types/api';
import { useParams } from 'next/navigation';

export default function BusinessDetailClientPage() {
  const params = useParams();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      discoveryApi.getBusinessDetail(businessId).catch(() => null),
      discoveryApi.getBusinessServices(businessId).catch(() => []),
      discoveryApi.getBusinessReviews(businessId).catch(() => [])
    ]).then(([b, s, r]) => {
      if (b) {
        setBusiness((b as any).data || b);
      }
      setServices((s as any).data || s);
      setReviews((r as any).data || r);
      setLoading(false);
    });
  }, [businessId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-6 animate-pulse bg-[var(--color-wakeru-surface-muted)] h-96 rounded-xl mt-8"></div>;
  }

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-24">
        <h2 className="text-xl font-bold">Business not found</h2>
        <p className="text-[var(--color-wakeru-text-secondary)] mt-2">The business you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
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
        <div className="flex flex-row md:flex-col gap-2 shrink-0">
          <Button size="lg" className="shadow-md">Request Booking</Button>
          <Button variant="outline" size="sm">Report Issue</Button>
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
              <h2 className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">Available Services & Offerings</h2>
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
                          <Button size="sm" className="mt-2 text-xs">
                            Select Option
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
              <h2 className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">Venue Location & Arrival</h2>
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
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-wakeru-text-primary)]">Traveler Reviews</h2>
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
              <CardTitle>Host & Trust Information</CardTitle>
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
    </div>
  );
}
