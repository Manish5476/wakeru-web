'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ITrip, TripStatus } from '@/types/trip.types';
import { tripsApi } from '@/api/trips';
import { formatCurrency, formatDateRange, getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { Modal } from '@/design-system/components/Modal';

export default function TripsPortfolioPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [inviteCodeInput, setInviteCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsApi.getMyTrips();
      setTrips(res.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a 6-character trip code.');
      return;
    }
    const found = trips.find(t => t.inviteCode?.toUpperCase() === cleanCode);
    if (found) {
      setJoinModalOpen(false);
      router.push(`/trips/${found._id || found.id || ''}`);
    } else {
      router.push(`/trips/join/${cleanCode}`);
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  // Calculate metrics
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalSpent = trips.reduce((acc, t) => acc + (t.spentBase || 0), 0);
  const activeCount = trips.filter(t => t.status === 'active').length;
  const totalTravelers = new Set(trips.flatMap(t => t.members.map(m => m.userId))).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-primary)] mb-1">
            <span>🏖️ Real-time Travel &amp; Expense Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            My Trip Portfolio
          </h1>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Seamlessly split group expenses, minimize bank transfers, and coordinate day-by-day itineraries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setJoinError('');
              setInviteCodeInput('');
              setJoinModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <AppIcon name="users" size={16} />
            <span>Join with Code</span>
          </Button>

          <Link href="/trips/create">
            <Button variant="primary" className="flex items-center gap-2 shadow-md">
              <AppIcon name="plus" size={16} />
              <span>Create New Trip</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-wakeru-text-tertiary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Trips</span>
            <AppIcon name="plane" size={18} className="text-[var(--color-wakeru-primary)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
            {activeCount}
          </div>
          <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
            {trips.length} total expeditions
          </div>
        </div>

        <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-wakeru-text-tertiary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Group Spend</span>
            <AppIcon name="receipt" size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
            {formatCurrency(totalSpent, 'INR')}
          </div>
          <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
            Budget: {formatCurrency(totalBudget, 'INR')}
          </div>
        </div>

        <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-wakeru-text-tertiary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Group Companions</span>
            <AppIcon name="users" size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--color-wakeru-text-primary)]">
            {totalTravelers}
          </div>
          <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
            Across your trips
          </div>
        </div>

        <div className="p-5 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-wakeru-text-tertiary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Net Settlement</span>
            <AppIcon name="wallet" size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            +₹4,200
          </div>
          <div className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
            You are owed across all trips
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-wakeru-border)] pb-3 mb-6">
        {(['all', 'active', 'planning', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-[var(--radius-control)] transition-all capitalize ${
              filter === tab
                ? 'bg-[var(--color-wakeru-primary)] text-white shadow-xs'
                : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-surface-muted)]'
            }`}
          >
            {tab === 'all' ? 'All Trips' : tab}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-72 rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface-muted)] animate-pulse"
            />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)]">
          <div className="w-16 h-16 rounded-full bg-[var(--color-wakeru-surface-muted)] flex items-center justify-center mx-auto mb-4 text-2xl">
            ✈️
          </div>
          <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)] mb-1">
            No trips found in this view
          </h3>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-md mx-auto mb-6">
            Ready to embark on an adventure? Plan a getaway with friends or join an existing trip with an invite code.
          </p>
          <Link href="/trips/create">
            <Button variant="primary">Create Your First Trip</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => {
            const tripId = trip._id || trip.id || '';
            const spent = trip.spentBase || 0;
            const budget = trip.budget || 1;
            const pct = Math.min(100, Math.round((spent / budget) * 100));
            const isOverBudget = spent > budget;

            return (
              <Link
                key={tripId}
                href={`/trips/${tripId}`}
                className="group flex flex-col rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] overflow-hidden shadow-xs hover:shadow-xl hover:border-[var(--color-wakeru-primary)] transition-all duration-300"
              >
                {/* Image Cover */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-xl p-1 bg-white/20 backdrop-blur-md rounded-lg shadow-xs">
                      {trip.emoji || '🌴'}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                        trip.status === 'active'
                          ? 'bg-emerald-500/90 text-white'
                          : trip.status === 'planning'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-700/90 text-white'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 text-xs font-mono font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-md">
                    #{trip.inviteCode}
                  </div>

                  {/* Destination on bottom of cover */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                      <AppIcon name="map-pin" size={13} className="text-[var(--color-wakeru-primary)]" />
                      <span>{trip.destination}</span>
                    </div>
                    <h2 className="text-lg font-bold truncate mt-0.5 drop-shadow-sm">
                      {trip.title}
                    </h2>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Dates & Stops */}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-wakeru-text-secondary)] mb-3">
                      <AppIcon name="calendar" size={14} />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>

                    {trip.description && (
                      <p className="text-xs text-[var(--color-wakeru-text-secondary)] line-clamp-2 mb-4">
                        {trip.description}
                      </p>
                    )}

                    {/* Budget Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-[var(--color-wakeru-text-secondary)]">Group Spend</span>
                        <span className={isOverBudget ? 'text-red-500 font-bold' : 'text-[var(--color-wakeru-text-primary)]'}>
                          {formatCurrency(spent, trip.currency)} / {formatCurrency(trip.budget || 0, trip.currency)}
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-wakeru-surface-muted)] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-red-500'
                              : pct > 80
                              ? 'bg-amber-500'
                              : 'bg-[var(--color-wakeru-primary)]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer: Companions & Arrow */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-wakeru-border)]">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {trip.members.slice(0, 4).map((member, idx) => (
                        <div
                          key={member.id || idx}
                          title={member.name}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white bg-[var(--color-wakeru-primary)] ring-2 ring-[var(--color-wakeru-surface)] shadow-xs"
                        >
                          {getInitials(member.name)}
                        </div>
                      ))}
                      {trip.members.length > 4 && (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] ring-2 ring-[var(--color-wakeru-surface)]">
                          +{trip.members.length - 4}
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-[var(--color-wakeru-primary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>View Trip Hub</span>
                      <AppIcon name="chevron-right" size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Join Trip with Code Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join an Existing Trip"
        description="Enter the 6-character invite code shared by the trip organizer."
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleJoinTrip}>
              Join Trip
            </Button>
          </>
        }
      >
        <form onSubmit={handleJoinTrip} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
              Trip Invite Code
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. GOA2026"
              value={inviteCodeInput}
              onChange={e => setInviteCodeInput(e.target.value)}
              className="w-full text-center text-xl tracking-widest uppercase font-mono font-bold px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              autoFocus
            />
            {joinError && <p className="text-xs text-red-500 mt-2">{joinError}</p>}
          </div>
          <div className="text-xs text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] p-3 rounded-md">
            💡 Joining adds this trip to your portfolio and allows you to view balances, add expenses, and settle debts instantly.
          </div>
        </form>
      </Modal>
    </div>
  );
}
