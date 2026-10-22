'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { INITIAL_TRIPS } from '@/lib/mockTripsData';
import { formatCurrency, formatDateRange, getInitials } from '@/lib/formatters';

export default function TravelerHome() {
  // Interactive Live Demo Calculator State
  const [billAmount, setBillAmount] = useState<number>(6000);
  const [travelerCount, setTravelerCount] = useState<number>(4);

  const perPerson = Math.round(billAmount / Math.max(1, travelerCount));
  const rawTransfers = travelerCount * (travelerCount - 1);
  const minimizedTransfers = Math.max(1, travelerCount - 1);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-wakeru-surface-muted)] to-[var(--color-wakeru-bg)] border-b border-[var(--color-wakeru-border)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-wakeru-primary)]/10 text-[var(--color-wakeru-primary)] text-xs font-bold tracking-wide uppercase">
              <span>⚡ All-in-One Group Travel &amp; Expense Hub</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[var(--color-wakeru-text-primary)] tracking-tight leading-[1.1]">
              Travel Together. <br className="hidden sm:inline" />
              Split Fairly. <br className="hidden sm:inline" />
              <span className="text-[var(--color-wakeru-primary)]">Zero Awkward Math.</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-wakeru-text-secondary)] leading-relaxed max-w-2xl mx-auto">
              The modern platform for group vacations: penny-exact receipt OCR, mathematically minimized UPI debt settlements, and day-by-day collaborative itineraries.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/trips/create" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto py-3 px-8 text-base font-bold shadow-lg flex items-center justify-center gap-2">
                  <AppIcon name="plane" size={18} />
                  <span>Plan a New Trip</span>
                </Button>
              </Link>
              <Link href="/trips" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto py-3 px-6 text-base font-semibold flex items-center justify-center gap-2">
                  <AppIcon name="compass" size={18} />
                  <span>My Trip Portfolio</span>
                </Button>
              </Link>
              <Link href="/discover" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto py-3 px-4 text-sm font-semibold text-[var(--color-wakeru-text-secondary)]">
                  Explore Venues →
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Badge */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-wakeru-text-tertiary)] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Greedy Min-Cash-Flow Debt Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>5 Split Modes (Equal, Exact, Itemized)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>1-Click UPI &amp; QR Code Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE QUICK-SPLIT DEMO WIDGET */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--color-wakeru-border)]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/10 px-2 py-0.5 rounded-full">
                Interactive Simulator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--color-wakeru-text-primary)] mt-1">
                See How TripSplit Minimizes Debts
              </h2>
              <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
                Slide the amount and companions to see our graph algorithm in action.
              </p>
            </div>
            <Link href="/trips">
              <Button variant="outline" size="sm" className="text-xs shrink-0">
                Open Full Hub →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-[var(--color-wakeru-text-primary)] mb-2">
                  <span>Group Expense Amount</span>
                  <span className="font-mono text-base text-[var(--color-wakeru-primary)]">
                    {formatCurrency(billAmount, 'INR')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={billAmount}
                  onChange={e => setBillAmount(Number(e.target.value))}
                  className="w-full accent-[var(--color-wakeru-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--color-wakeru-text-tertiary)] mt-1 font-mono">
                  <span>₹1,000</span>
                  <span>₹25,000</span>
                  <span>₹50,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[var(--color-wakeru-text-primary)] mb-2">
                  <span>Companions on Trip</span>
                  <span className="font-mono text-base text-[var(--color-wakeru-primary)]">
                    {travelerCount} people
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={travelerCount}
                  onChange={e => setTravelerCount(Number(e.target.value))}
                  className="w-full accent-[var(--color-wakeru-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--color-wakeru-text-tertiary)] mt-1 font-mono">
                  <span>2 people</span>
                  <span>6 people</span>
                  <span>12 people</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-[var(--color-wakeru-surface-muted)] to-emerald-500/10 border border-blue-500/20 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-[var(--color-wakeru-surface)] rounded-xl border border-[var(--color-wakeru-border)] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-wakeru-text-secondary)] block">
                    Fair Share Each
                  </span>
                  <span className="text-xl font-mono font-black text-[var(--color-wakeru-primary)]">
                    {formatCurrency(perPerson, 'INR')}
                  </span>
                </div>
                <div className="p-3 bg-[var(--color-wakeru-surface)] rounded-xl border border-[var(--color-wakeru-border)] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-wakeru-text-secondary)] block">
                    Optimized Transfers
                  </span>
                  <span className="text-xl font-mono font-black text-emerald-600">
                    {minimizedTransfers} only
                  </span>
                </div>
              </div>

              <div className="text-xs text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface)] p-3.5 rounded-xl border border-[var(--color-wakeru-border)] space-y-1">
                <div className="flex justify-between">
                  <span>Unoptimized Peer-to-Peer Transfers:</span>
                  <span className="line-through text-red-500 font-mono font-bold">{rawTransfers} payments</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>TripSplit Graph Min-Cash-Flow:</span>
                  <span className="font-mono">{minimizedTransfers} direct settlement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR PILLARS FEATURE MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-[var(--color-wakeru-text-primary)]">
            Engineered for Real Vacations
          </h2>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Everything your travel group needs from first departure to final debt settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[var(--color-wakeru-primary)] flex items-center justify-center text-xl">
              ⚡
            </div>
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Min-Cash-Flow Debt Simplifier
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Greedy bipartite graph algorithms condense dozens of messy group IOUs into the minimum possible direct UPI transfers.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              🧾
            </div>
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Itemized Receipt OCR
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Snap a photo of any restaurant bill. Automatically parse menu line items, allocate dishes to companions, and split tax &amp; tips.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
              🗓️
            </div>
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Day-by-Day Travel Planner
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Morning, afternoon, and sunset timelines with collaborative packing checklists, emergency contacts, and AI concierge advice.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs hover:border-[var(--color-wakeru-primary)] transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl">
              🔑
            </div>
            <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)]">
              Digital Key &amp; Offline Vouchers
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] leading-relaxed">
              Tap-to-unlock keycard for verified villas, guest Wi-Fi credentials, and offline-cached vouchers for zero-connectivity check-ins.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE EXPEDITIONS PORTFOLIO PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--color-wakeru-text-primary)]">
              Popular Expedition Blueprints
            </h2>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Explore live trip setups or launch your own group vacation in seconds.
            </p>
          </div>
          <Link href="/trips">
            <Button variant="outline" size="sm" className="text-xs">
              View All Trips Portfolio →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_TRIPS.map(trip => (
            <Link
              key={trip._id || trip.id}
              href={`/trips/${trip._id || trip.id}`}
              className="group flex flex-col sm:flex-row rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] overflow-hidden shadow-xs hover:shadow-xl hover:border-[var(--color-wakeru-primary)] transition-all"
            >
              <div className="relative h-48 sm:h-auto sm:w-56 bg-slate-900 shrink-0 overflow-hidden">
                <img
                  src={trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 text-lg p-1 bg-white/20 backdrop-blur-md rounded-lg">
                  {trip.emoji}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[var(--color-wakeru-text-secondary)] mb-1 flex items-center gap-1.5">
                    <AppIcon name="map-pin" size={13} className="text-[var(--color-wakeru-primary)]" />
                    <span>{trip.destination}</span>
                    <span>•</span>
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)] group-hover:text-[var(--color-wakeru-primary)] transition-colors">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)] line-clamp-2 mt-1">
                    {trip.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-wakeru-border)] mt-4 text-xs font-medium">
                  <div>
                    <span className="text-[var(--color-wakeru-text-tertiary)] block text-[10px]">Budget</span>
                    <span className="font-bold font-mono text-[var(--color-wakeru-text-primary)]">
                      {formatCurrency(trip.budget || 0, trip.currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--color-wakeru-text-tertiary)] block text-[10px]">Companions</span>
                    <span className="font-bold text-[var(--color-wakeru-text-primary)]">
                      {trip.members.length} travelers
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800 text-center space-y-6">
          <span className="text-3xl">🌴</span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready for your next getaway?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Create a trip, invite your travel companions, and let TripSplit handle all the group expenses, debt simplification, and day-by-day plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/trips/create">
              <Button variant="primary" className="py-3 px-8 text-base font-bold shadow-lg">
                Create Trip in 60 Seconds
              </Button>
            </Link>
            <Link href="/trips">
              <Button variant="outline" className="py-3 px-6 text-sm text-slate-200 border-white/20 hover:bg-white/10">
                Explore Trips Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
