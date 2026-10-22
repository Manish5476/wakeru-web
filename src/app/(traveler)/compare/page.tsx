'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { discoveryApi } from '@/api/discover';
import { Business } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids) {
      discoveryApi.compareBusinesses(ids)
        .then(response => {
          const data = (response as any).data ? (response as any).data : response;
          setBusinesses(Array.isArray(data) ? data : []);
        })
        .catch(error => {
          console.error('Failed to compare businesses:', error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [ids]);

  const handleRemove = (removeId: string) => {
    const updated = businesses.filter(b => b.id !== removeId);
    setBusinesses(updated);
    if (updated.length > 0) {
      router.replace(`/compare?ids=${updated.map(b => b.id).join(',')}`);
    } else {
      router.replace('/compare');
    }
  };

  const getMinPrice = (b: Business): number => {
    if (!b.services || b.services.length === 0) return 0;
    const prices = b.services.map(s => s.basePriceMinor || 0);
    return Math.min(...prices);
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-wakeru-text-secondary)]">Analyzing and aligning venue specifications...</p>
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="p-12 text-center bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] space-y-4">
        <span className="text-4xl block">⚖️</span>
        <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">No venues selected to compare</h2>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto">
          Explore stays and dining in Discover, or check the boxes on any card to compare amenities, pricing, and guest capacities side-by-side.
        </p>
        <Link href="/discover">
          <Button variant="primary">Browse Discover Catalog</Button>
        </Link>
      </div>
    );
  }

  const allFacilities = Array.from(
    new Set(businesses.flatMap(b => b.services?.flatMap(s => s.facilities || []) || []))
  );

  return (
    <div className="space-y-8">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => {
          const coverImage = business.media?.[0]?.url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80';
          const minPrice = getMinPrice(business);
          const primaryService = business.services?.[0];

          return (
            <Card key={business.id} className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-[var(--shadow-floating)] transition-all">
              <div>
                {/* Visual Header */}
                <div className="relative h-44 bg-[var(--color-wakeru-surface-muted)] overflow-hidden">
                  <img src={coverImage} alt={business.businessName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="default" className="bg-black/60 backdrop-blur-md text-white border-none text-[11px] font-semibold uppercase">
                      {business.category}
                    </Badge>
                    {business.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(business.id)}
                    title="Remove from comparison"
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-colors"
                  >
                    ✕
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div className="text-xs font-medium drop-shadow-sm flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate max-w-[170px]">{business.city}, {business.country}</span>
                    </div>

                    {business.rating && (
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-amber-400">
                        <span>★</span>
                        <span>{business.rating.toFixed(1)}</span>
                        <span className="text-white/70 font-normal">({business.reviewCount || 1})</span>
                      </div>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{business.businessName}</CardTitle>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] line-clamp-2 mt-1">
                    {business.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 text-xs pt-0">
                  <div className="p-3 bg-[var(--color-wakeru-surface-muted)] rounded-[var(--radius-control)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-wakeru-text-muted)]">
                      {primaryService?.priceUnit ? `Starting ${primaryService.priceUnit}` : 'Pricing'}
                    </p>
                    <p className="text-base font-extrabold text-[var(--color-wakeru-text-primary)] mt-0.5">
                      {minPrice > 0 ? `₹${(minPrice / 100).toLocaleString('en-IN')}` : 'Direct inquiry'}
                    </p>
                    {primaryService?.maxCapacity && (
                      <p className="text-[11px] text-[var(--color-wakeru-text-secondary)] mt-0.5">
                        Accommodates up to <strong className="text-[var(--color-wakeru-text-primary)]">{primaryService.maxCapacity} guests</strong>
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  {primaryService?.facilities && primaryService.facilities.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--color-wakeru-text-secondary)] uppercase tracking-wider text-[10px]">
                        Included Features
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {primaryService.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] text-[10px] text-[var(--color-wakeru-text-secondary)] font-medium"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                <Link href={`/discover/business/${business.id}`}>
                  <Button variant="primary" className="w-full text-xs font-bold h-9">
                    View Details &amp; Book ➔
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Matrix if 2 or more businesses */}
      {businesses.length >= 2 && allFacilities.length > 0 && (
        <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
              Feature &amp; Amenity Comparison Matrix
            </h3>
            <span className="text-xs text-[var(--color-wakeru-text-muted)]">
              {businesses.length} venues compared
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)]">
                  <th className="p-3 text-[var(--color-wakeru-text-secondary)] font-semibold w-1/3">Feature</th>
                  {businesses.map(b => (
                    <th key={b.id} className="p-3 text-[var(--color-wakeru-text-primary)] font-bold truncate max-w-[180px]">
                      {b.businessName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-wakeru-border)]">
                {allFacilities.map(feature => (
                  <tr key={feature} className="hover:bg-[var(--color-wakeru-surface-hover)]">
                    <td className="p-3 font-medium text-[var(--color-wakeru-text-primary)]">{feature}</td>
                    {businesses.map(b => {
                      const hasFeature = b.services?.some(s => s.facilities?.includes(feature));
                      return (
                        <td key={b.id} className="p-3 text-center sm:text-left">
                          {hasFeature ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Included
                            </span>
                          ) : (
                            <span className="text-[var(--color-wakeru-text-muted)]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompareBusinessesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-wakeru-primary)]/10 text-[var(--color-wakeru-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            Side-by-Side Evaluation
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
            Compare Venues &amp; Experiences
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Evaluate guest capacities, amenities, verified ratings, and pricing before locking in your reservation.
          </p>
        </div>

        <Link href="/discover">
          <Button variant="outline" className="text-xs font-semibold">
            ← Back to Discover
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-[var(--color-wakeru-text-secondary)]">Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
