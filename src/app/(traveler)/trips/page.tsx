'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ITrip } from '@/types/trip.types';
import { tripsApi } from '@/api/trips';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';
import { StatCard } from '@/design-system/components/StatCard';
import { TripCard } from '@/design-system/components/TripCard';
import { GlassCard } from '@/design-system/components/GlassCard';
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
      const tripsData = (res as any)?.data?.trips || (res as any)?.trips || [];
      setTrips(tripsData);
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
  const totalTravelers = new Set(trips.flatMap(t => (t.members || []).map(m => m.userId))).size;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>🏖️ Real-time Travel &amp; Expense Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-wakeru-text-primary)] tracking-tight">
            My Trip Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
            Split group accommodations, minimize peer-to-peer transfers, and synchronize collaborative stops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
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
            <Button variant="gold" className="flex items-center gap-2 shadow-md">
              <AppIcon name="plus" size={16} />
              <span>Create New Trip</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Banner with StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Journeys"
          amount={activeCount}
          currency=""
          variant="default"
          subtitle={`${trips.length} total recorded`}
          icon={<AppIcon name="plane" size={18} />}
        />

        <StatCard
          title="Total Group Spend"
          amount={totalSpent}
          currency="INR"
          variant="warning"
          subtitle={`Budget cap: ₹${totalBudget.toLocaleString()}`}
          icon={<AppIcon name="receipt" size={18} />}
        />

        <StatCard
          title="Companions"
          amount={totalTravelers}
          currency=""
          variant="success"
          subtitle="Across your expeditions"
          icon={<AppIcon name="users" size={18} />}
        />

        <StatCard
          title="Settlements"
          amount={4200}
          currency="INR"
          variant="success"
          subtitle="Net receivable across trips"
          icon={<AppIcon name="wallet" size={18} />}
        />
      </div>

      {/* Filter Tabs (Frosted Pills) */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
        {(['all', 'active', 'planning', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 capitalize cursor-pointer ${
              filter === tab
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                : 'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
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
              className="h-80 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <GlassCard variant="soft" padding="xl" className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            ✈️
          </div>
          <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)] mb-1">
            No trips found in this view
          </h3>
          <p className="text-sm text-[var(--color-wakeru-text-secondary)] max-w-md mx-auto mb-6">
            Ready to embark on an adventure? Plan a getaway with friends or join an existing trip with an invite code.
          </p>
          <Link href="/trips/create">
            <Button variant="gold">Create Your First Trip</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => (
            <TripCard
              key={trip._id || trip.id}
              trip={{
                id: trip._id || trip.id,
                title: trip.name || trip.title,
                coverImage: trip.coverImage,
                startDate: trip.startDate,
                endDate: trip.endDate,
                status: trip.status,
                baseCurrency: trip.currency || 'INR',
                totalBudget: trip.budget,
                totalSpentBase: trip.spentBase,
                members: trip.members?.map(m => ({
                  userId: m.userId,
                  displayName: m.name,
                  photoURL: m.avatar,
                })),
              }}
            />
          ))}
        </div>
      )}

      {/* Join Trip Modal */}
      {joinModalOpen && (
        <Modal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
          title="Join a Trip with Code"
        >
          <form onSubmit={handleJoinTrip} className="space-y-4">
            <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
              Ask your trip organizer for the 6-character code (e.g. <code>GOA123</code>) to join the expedition and split bills.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-tertiary)] mb-1.5">
                Trip Invite Code
              </label>
              <input
                type="text"
                maxLength={8}
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. GOA26"
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md text-center font-mono text-xl tracking-widest font-black uppercase text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {joinError && (
                <p className="text-xs text-rose-500 font-semibold mt-1.5">{joinError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setJoinModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" type="submit">
                Join Trip
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
