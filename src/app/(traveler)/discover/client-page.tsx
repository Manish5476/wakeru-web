'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Input } from '@/design-system/components/Input';
import { discoveryApi } from '@/api/discover';
import { Business } from '@/types/api';

type CategoryFilter = 'ALL' | 'STAY' | 'DINING' | 'EXPERIENCE' | 'RENTAL';
type SortOption = 'recommended' | 'rating' | 'price_asc' | 'price_desc';

const CATEGORIES: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All Experiences', icon: '✨' },
  { key: 'STAY', label: 'Stays & Villas', icon: '🏨' },
  { key: 'DINING', label: 'Dining & Lounges', icon: '🍽️' },
  { key: 'EXPERIENCE', label: 'Activities & Adventures', icon: '🏄' },
  { key: 'RENTAL', label: 'Rentals & Transit', icon: '🚗' },
];

const POPULAR_DESTINATIONS = ['All', 'Goa', 'Siolim', 'Anjuna', 'Assagao', 'Palolem'];

export default function DiscoverClientPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  // Bookmark & Compare
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    // Load initial businesses & saved bookmarks
    discoveryApi.getNearbyBusinesses(15.2993, 74.1240)
      .then(res => {
        const list = (res as any).data || res;
        setBusinesses(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    const saved = discoveryApi.getSavedVenueIds();
    setSavedIds(new Set(saved));
  }, []);

  const handleToggleSave = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = discoveryApi.toggleSaveVenue(id);
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isNowSaved) {
        next.add(id);
        setSaveToast(`Saved "${name}" to your Wishlist! 🔖`);
      } else {
        next.delete(id);
        setSaveToast(`Removed from Wishlist`);
      }
      return next;
    });

    setTimeout(() => {
      setSaveToast(null);
    }, 2800);
  };

  const handleToggleCompare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 venues simultaneously.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Helper to extract lowest price
  const getMinPrice = (b: Business): number => {
    if (!b.services || b.services.length === 0) return 0;
    const prices = b.services.map(s => s.basePriceMinor || 0);
    return Math.min(...prices);
  };

  // Filtered & Sorted list
  const filteredBusinesses = useMemo(() => {
    let result = [...businesses];

    // Category
    if (selectedCategory !== 'ALL') {
      result = result.filter(b => b.category?.toUpperCase() === selectedCategory);
    }

    // City tag
    if (selectedCity !== 'All') {
      result = result.filter(b =>
        b.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
        b.address?.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.businessName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.services?.some(s => s.serviceName?.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'price_asc') {
        return getMinPrice(a) - getMinPrice(b);
      }
      if (sortBy === 'price_desc') {
        return getMinPrice(b) - getMinPrice(a);
      }
      // recommended default
      return (b.rating || 0) * (b.reviewCount || 1) - (a.rating || 0) * (a.reviewCount || 1);
    });

    return result;
  }, [businesses, selectedCategory, selectedCity, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--color-wakeru-surface-elevated)] border border-[var(--color-wakeru-border)] shadow-[var(--shadow-floating)] px-4 py-3 rounded-[var(--radius-card)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-[var(--color-wakeru-text-primary)]">{saveToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900/10 via-[var(--color-wakeru-primary)]/10 to-emerald-900/10 border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-wakeru-primary)]/15 text-[var(--color-wakeru-primary)] text-xs font-bold uppercase tracking-wider">
            Verified Partner Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            Curated Stays, Dining &amp; Group Experiences
          </h1>
          <p className="text-[var(--color-wakeru-text-secondary)] text-sm sm:text-base leading-relaxed">
            Discover verified local retreats, sunset tavernas, and ocean adventures with seamless group booking and split billing.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-wakeru-text-muted)] text-base">🔍</span>
            <Input
              type="text"
              placeholder="Search by venue, city, or experience (e.g. Villa, Siolim, Scuba)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-[var(--color-wakeru-surface)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-wakeru-text-muted)] hover:text-[var(--color-wakeru-text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-11 px-3 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] text-sm font-medium text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top Rated ★</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Popular Destination Quick Chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-[var(--color-wakeru-text-secondary)]">
          <span className="font-semibold text-[var(--color-wakeru-text-muted)] shrink-0">Popular:</span>
          {POPULAR_DESTINATIONS.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-full shrink-0 font-medium transition-colors ${
                selectedCity === city
                  ? 'bg-[var(--color-wakeru-primary)] text-white'
                  : 'bg-[var(--color-wakeru-surface)] hover:bg-[var(--color-wakeru-surface-hover)] border border-[var(--color-wakeru-border)] text-[var(--color-wakeru-text-primary)]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--color-wakeru-border)]">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-control)] text-sm font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-[var(--color-wakeru-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-wakeru-surface)] text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-surface-hover)] border border-[var(--color-wakeru-border)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-[var(--color-wakeru-danger)] bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 text-sm text-[var(--color-wakeru-danger)]">
            Failed to connect to Discovery Service: {error}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse h-80 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]" />
          ))}
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] space-y-4">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
            No venues match your search criteria
          </h3>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-md mx-auto">
            Try adjusting your search keywords, switching categories, or clearing destination filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
              setSelectedCity('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => {
            const isSaved = savedIds.has(business.id);
            const isCompared = compareIds.includes(business.id);
            const minPriceMinor = getMinPrice(business);
            const coverImage = business.media?.[0]?.url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80';
            const primaryService = business.services?.[0];

            return (
              <div
                key={business.id}
                className="group flex flex-col bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-sm hover:shadow-[var(--shadow-floating)] transition-all duration-200"
              >
                {/* Visual Cover */}
                <div className="relative h-48 bg-[var(--color-wakeru-surface-muted)] overflow-hidden">
                  <img
                    src={coverImage}
                    alt={business.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Badges */}
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

                  {/* Action Icons (Bookmark + Compare Checkbox) */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {/* Compare Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(e, business.id)}
                      title={isCompared ? 'Remove from compare' : 'Select to compare'}
                      className={`h-8 px-2.5 rounded-full text-xs font-bold backdrop-blur-md flex items-center gap-1 transition-all ${
                        isCompared
                          ? 'bg-[var(--color-wakeru-primary)] text-white shadow-md'
                          : 'bg-black/40 text-white/90 hover:bg-black/60'
                      }`}
                    >
                      <span>⚖️</span>
                      <span>{isCompared ? 'Added' : 'Compare'}</span>
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(e, business.id, business.businessName)}
                      title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                      className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        isSaved
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-black/40 text-white/90 hover:bg-black/60'
                      }`}
                    >
                      <span className="text-sm">{isSaved ? '❤️' : '🤍'}</span>
                    </button>
                  </div>

                  {/* Location & Rating overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div className="flex items-center gap-1 text-xs font-medium drop-shadow-sm">
                      <span>📍</span>
                      <span className="truncate max-w-[180px]">{business.city}, {business.country}</span>
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

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link href={`/discover/business/${business.id}`}>
                      <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)] hover:text-[var(--color-wakeru-primary)] transition-colors line-clamp-1">
                        {business.businessName}
                      </h3>
                    </Link>
                    <p className="text-xs text-[var(--color-wakeru-text-secondary)] line-clamp-2 leading-relaxed">
                      {business.description || 'Experience authentic coastal hospitality and curated local amenities.'}
                    </p>

                    {/* Facility Chips */}
                    {primaryService?.facilities && primaryService.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {primaryService.facilities.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 rounded bg-[var(--color-wakeru-surface-muted)] text-[11px] text-[var(--color-wakeru-text-secondary)] font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-3 border-t border-[var(--color-wakeru-border)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-wakeru-text-muted)]">
                        {primaryService?.priceUnit ? `Starting ${primaryService.priceUnit}` : 'Starting from'}
                      </p>
                      <p className="text-sm font-extrabold text-[var(--color-wakeru-text-primary)]">
                        {minPriceMinor > 0
                          ? `₹${(minPriceMinor / 100).toLocaleString('en-IN')}`
                          : 'Direct inquiry'}
                      </p>
                    </div>

                    <Link href={`/discover/business/${business.id}`}>
                      <Button variant="primary" className="text-xs font-semibold px-3.5 py-1.5 h-8">
                        View &amp; Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Action Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-wakeru-surface-elevated)] border-2 border-[var(--color-wakeru-primary)] shadow-2xl rounded-full px-5 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span className="text-xs font-bold text-[var(--color-wakeru-text-primary)]">
              {compareIds.length} {compareIds.length === 1 ? 'venue' : 'venues'} selected to compare
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/compare?ids=${compareIds.join(',')}`}>
              <Button variant="primary" className="text-xs font-bold rounded-full px-4 h-8 shadow-sm">
                Compare Side-by-Side ➔
              </Button>
            </Link>

            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-[var(--color-wakeru-text-muted)] hover:text-[var(--color-wakeru-danger)] font-medium px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
