'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ITrip } from '@/types/trip.types';
import { tripsApi } from '@/api/trips';
import { formatDateRange, formatCurrency, getInitials } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';

export default function JoinTripPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const code = (resolvedParams.code || '').toUpperCase();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [error, setError] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(false);

  // User input
  const [name, setName] = useState('Alex Traveler');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    findTrip();
  }, [code]);

  const findTrip = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await tripsApi.getMyTrips();
      const match = res.trips.find(t => t.inviteCode?.toUpperCase() === code);
      if (match) {
        setTrip(match);
      } else {
        setError(`No trip found matching invite code "${code}". Please verify with the host.`);
      }
    } catch (err) {
      console.error('Failed to look up trip:', err);
      setError('An error occurred while finding this trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    try {
      setJoining(true);
      const tripId = trip._id || trip.id;
      if (!tripId) {
        throw new Error('Trip ID is missing');
      }
      await tripsApi.addMember(tripId, {
        name: name.trim(),
        email: email.trim() || undefined,
        upiId: upiId.trim() || undefined,
        role: 'member',
      });
      router.push(`/trips/${tripId}`);
    } catch (err: any) {
      console.error('Failed to join trip:', err);
      alert('Failed to join trip. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-[var(--color-wakeru-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
          Searching for trip #{code}...
        </h2>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AppIcon name="alert-circle" size={32} />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-wakeru-text-primary)] mb-2">
          Trip Invitation Not Found
        </h2>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mb-6">
          {error || 'Invalid invite link.'}
        </p>
        <Link href="/trips">
          <Button variant="primary">Return to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] overflow-hidden shadow-xl">
        {/* Header Cover */}
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-white">
            Code: #{trip.inviteCode}
          </div>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-2xl mb-1 block">{trip.emoji}</span>
            <h1 className="text-2xl font-black drop-shadow-sm">{trip.title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
              <AppIcon name="map-pin" size={13} className="text-[var(--color-wakeru-primary)]" />
              <span>{trip.destination}</span>
              <span>•</span>
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] text-xs">
            <div>
              <span className="text-[var(--color-wakeru-text-secondary)] block">Trip Companions</span>
              <span className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                {trip.members.length} members
              </span>
            </div>
            <div>
              <span className="text-[var(--color-wakeru-text-secondary)] block">Group Budget</span>
              <span className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                {formatCurrency(trip.budget || 0, trip.currency)}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-wakeru-text-secondary)] block">Currency</span>
              <span className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                {trip.currency}
              </span>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
              Your Companion Profile
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maya Patel"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="maya@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-wakeru-text-primary)] mb-1.5">
                UPI ID (for one-tap settlement payments)
              </label>
              <input
                type="text"
                placeholder="maya@okaxis"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              isLoading={joining}
              className="w-full py-3 mt-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <AppIcon name="users" size={18} />
              <span>Join Trip &amp; Split Debts</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
