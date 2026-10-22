'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { discoveryApi, MOCK_BUSINESSES } from '@/api/discover';
import { Business } from '@/types/api';

export default function SavedPage() {
  const [savedVenues, setSavedVenues] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = () => {
    const ids = discoveryApi.getSavedVenueIds();
    const matched = MOCK_BUSINESSES.filter(b => ids.includes(b.id));
    setSavedVenues(matched);
    setLoading(false);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    discoveryApi.toggleSaveVenue(id);
    setSavedVenues(prev => prev.filter(v => v.id !== id));
  };

  const getMinPrice = (b: Business): number => {
    if (!b.services || b.services.length === 0) return 0;
    const prices = b.services.map(s => s.basePriceMinor || 0);
    return Math.min(...prices);
  };

  const compareUrl = savedVenues.length >= 2 
    ? `/compare?ids=${savedVenues.map(v => v.id).join(',')}` 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-wakeru-border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">
            Wishlist &amp; Bookmarks
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
            Saved Venues &amp; Experiences
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Your curated collection of stays, dining retreats, and adventure blueprints.
          </p>
        </div>

        {compareUrl && (
          <Link href={compareUrl}>
            <Button variant="outline" className="text-xs font-bold gap-2">
              <span>⚖️</span>
              <span>Compare All Saved ({savedVenues.length})</span>
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="animate-pulse h-72 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]"
            />
          ))}
        </div>
      ) : savedVenues.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] space-y-4">
          <div className="w-16 h-16 mx-auto mb-2 text-4xl flex items-center justify-center bg-rose-500/10 rounded-full text-rose-500">
            🔖
          </div>
          <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
            Your Wishlist is Empty
          </h3>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto leading-relaxed">
            Tap the heart or bookmark icon on any villa, beach club, or activity in Discover to save it for your next group expedition.
          </p>
          <div className="pt-2">
            <Link href="/discover">
              <Button variant="primary">Explore Discover Catalog</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVenues.map(venue => {
            const minPrice = getMinPrice(venue);
            const coverImage = venue.media?.[0]?.url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80';
            const primaryService = venue.services?.[0];

            return (
              <div
                key={venue.id}
                className="group flex flex-col bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-sm hover:shadow-[var(--shadow-floating)] transition-all duration-200"
              >
                {/* Visual Header */}
                <div className="relative h-48 bg-[var(--color-wakeru-surface-muted)] overflow-hidden">
                  <img
                    src={coverImage}
                    alt={venue.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="default" className="bg-black/60 backdrop-blur-md text-white border-none text-[11px] font-semibold uppercase">
                      {venue.category}
                    </Badge>
                    {venue.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(e, venue.id)}
                    title="Remove from saved"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-md flex items-center justify-center transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>

                  {/* Location & Rating */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div className="flex items-center gap-1 text-xs font-medium drop-shadow-sm">
                      <span>📍</span>
                      <span className="truncate max-w-[180px]">{venue.city}, {venue.country}</span>
                    </div>

                    {venue.rating && (
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
                        <span>★</span>
                        <span>{venue.rating.toFixed(1)}</span>
                        <span className="text-white/70 font-normal">({venue.reviewCount || 1})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <Link href={`/discover/business/${venue.id}`}>
                      <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)] hover:text-[var(--color-wakeru-primary)] transition-colors line-clamp-1">
                        {venue.businessName}
                      </h3>
                    </Link>
                    <p className="text-xs text-[var(--color-wakeru-text-secondary)] line-clamp-2 leading-relaxed">
                      {venue.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-[var(--color-wakeru-border)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-wakeru-text-muted)]">
                        {primaryService?.priceUnit ? `Starting ${primaryService.priceUnit}` : 'Starting from'}
                      </p>
                      <p className="text-sm font-extrabold text-[var(--color-wakeru-text-primary)]">
                        {minPrice > 0 ? `₹${(minPrice / 100).toLocaleString('en-IN')}` : 'Direct inquiry'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/discover/business/${venue.id}`}>
                        <Button variant="primary" className="text-xs font-semibold px-3.5 py-1.5 h-8">
                          View &amp; Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
