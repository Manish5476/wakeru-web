'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ITrip, ITripMember } from '@/types/trip.types';
import { tripsApi } from '@/api/trips';
import { formatCurrency } from '@/lib/formatters';
import { AppIcon } from '@/design-system/components/AppIcon';
import { Button } from '@/design-system/components/Button';

const EMOJI_OPTIONS = ['🌴', '🏔️', '🏖️', '✈️', '⛵', '🏕️', '🌆', '🚗', '🍣', '🏰', '🍹', '🏄'];

const COVER_PRESETS = [
  {
    name: 'Tropical Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Snowy Alpine',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Metropolis Skyline',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Heritage Palace',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Lush Forest & Camping',
    url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1200&auto=format&fit=crop&q=80',
  },
];

export default function CreateTripWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌴');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
  );
  const [currency, setCurrency] = useState('INR');
  const [budget, setBudget] = useState('50000');

  const [companions, setCompanions] = useState<Array<{ name: string; email: string; upiId: string }>>([
    { name: '', email: '', upiId: '' },
  ]);

  const handleAddCompanionRow = () => {
    setCompanions(prev => [...prev, { name: '', email: '', upiId: '' }]);
  };

  const handleUpdateCompanion = (index: number, field: string, val: string) => {
    setCompanions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveCompanion = (index: number) => {
    setCompanions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const parsedMembers: ITripMember[] = [
        {
          id: 'mem_owner',
          userId: 'usr_me',
          name: 'You (Alex)',
          email: 'alex@example.com',
          role: 'owner',
          joinedAt: new Date().toISOString(),
          upiId: 'alex@okhdfcbank',
        },
        ...companions
          .filter(c => c.name.trim().length > 0)
          .map((c, i) => ({
            id: `mem_comp_${i + 1}`,
            userId: `usr_comp_${i + 1}`,
            name: c.name.trim(),
            email: c.email.trim() || undefined,
            upiId: c.upiId.trim() || undefined,
            role: 'member' as const,
            joinedAt: new Date().toISOString(),
          })),
      ];

      const res = await tripsApi.create({
        title: title || `${destination} Adventure`,
        destination: destination || 'Exotic Getaway',
        description,
        emoji,
        coverImage,
        startDate,
        endDate,
        currency,
        budget: parseFloat(budget) || 50000,
        members: parsedMembers,
        visibility: 'shared',
        status: 'planning',
      });

      const newTripId = (res as any)?.data?.trip?._id || (res as any)?.data?.trip?.id || (res as any)?.trip?._id || (res as any)?.trip?.id || '';
      router.push(`/trips/${newTripId}`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      alert('Failed to create trip. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-primary)] transition-colors"
        >
          <AppIcon name="arrow-left" size={14} />
          <span>Back to Trips Portfolio</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-wakeru-text-primary)]">
          Plan a New Trip
        </h1>
        <p className="text-sm text-[var(--color-wakeru-text-secondary)] mt-1">
          Set up your destination, budget, and invite companions to start tracking shared expenses and itinerary.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Destination' },
          { num: 2, label: 'Dates & Budget' },
          { num: 3, label: 'Companions' },
          { num: 4, label: 'Review & Launch' },
        ].map(s => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`cursor-pointer rounded-lg p-3 border text-center transition-all ${
              step === s.num
                ? 'bg-[var(--color-wakeru-primary)]/10 border-[var(--color-wakeru-primary)] text-[var(--color-wakeru-primary)] font-bold'
                : step > s.num
                ? 'bg-[var(--color-wakeru-surface-muted)] border-[var(--color-wakeru-border-strong)] text-[var(--color-wakeru-text-primary)]'
                : 'bg-[var(--color-wakeru-surface)] border-[var(--color-wakeru-border)] text-[var(--color-wakeru-text-tertiary)]'
            }`}
          >
            <div className="text-xs uppercase tracking-wider">Step {s.num}</div>
            <div className="text-sm font-semibold truncate mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Wizard Card Body */}
      <div className="bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm">
        {/* Step 1: Destination & Identity */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-[var(--color-wakeru-text-tertiary)]">
                  <AppIcon name="map-pin" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Goa, India or Bali, Indonesia"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Trip Title
              </label>
              <input
                type="text"
                placeholder="e.g. Goa Coastal Sunset Villa Retreat"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              />
              <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1.5">
                Leave blank to automatically generate from destination.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Choose Trip Emoji Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-11 h-11 text-xl rounded-xl border flex items-center justify-center transition-all ${
                      emoji === em
                        ? 'border-[var(--color-wakeru-primary)] bg-[var(--color-wakeru-primary)]/15 scale-110 shadow-xs'
                        : 'border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] hover:scale-105'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Trip Notes / Vacation Vibe Description
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Annual group getaway. Roadtrip across North & South beaches, luxury cliffside dinners, and kayaking."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Dates & Financial Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (د.إ - UAE Dirham)</option>
                  <option value="THB">THB (฿ - Thai Baht)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                  Estimated Group Budget
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-sm font-bold text-[var(--color-wakeru-text-secondary)]">
                    {currency}
                  </div>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    placeholder="50000"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full pl-16 pr-4 py-3 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-[var(--color-wakeru-text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
              <AppIcon name="info" size={16} className="shrink-0 mt-0.5" />
              <span>
                TripSplit automatically converts multi-currency expenses into this primary currency using real-time rates and tracks budget health in real-time.
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Companions */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Trip Companions
                </label>
                <button
                  type="button"
                  onClick={handleAddCompanionRow}
                  className="text-xs font-bold text-[var(--color-wakeru-primary)] hover:underline flex items-center gap-1"
                >
                  <AppIcon name="plus" size={14} />
                  <span>Add Another Companion</span>
                </button>
              </div>
              <p className="text-xs text-[var(--color-wakeru-text-secondary)] mb-4">
                You will automatically be added as the trip Owner. Add friends now or invite them later via the 6-character trip invite code.
              </p>

              {/* Owner card */}
              <div className="p-3.5 rounded-xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-wakeru-primary)] text-white text-xs font-bold flex items-center justify-center">
                    AL
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">
                      You (Alex)
                    </div>
                    <div className="text-xs text-[var(--color-wakeru-text-secondary)]">
                      alex@example.com • alex@okhdfcbank
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-wakeru-primary)]/15 text-[var(--color-wakeru-primary)]">
                  Owner
                </span>
              </div>

              {/* Companion rows */}
              <div className="space-y-3">
                {companions.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Friend's Name *"
                        value={comp.name}
                        onChange={e => handleUpdateCompanion(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={comp.email}
                        onChange={e => handleUpdateCompanion(idx, 'email', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="UPI ID (e.g. name@upi)"
                        value={comp.upiId}
                        onChange={e => handleUpdateCompanion(idx, 'upiId', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-wakeru-primary)]"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(idx)}
                        className="text-[var(--color-wakeru-text-tertiary)] hover:text-red-500 p-1 transition-colors"
                      >
                        <AppIcon name="trash" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Cover Image */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)] mb-2">
                Select Cover Photo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {COVER_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverImage(preset.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 relative h-24 group transition-all ${
                      coverImage === preset.url
                        ? 'border-[var(--color-wakeru-primary)] ring-2 ring-[var(--color-wakeru-primary)]/30 scale-102'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span className="text-[11px] font-bold text-white drop-shadow-sm truncate">
                        {preset.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border-strong)] rounded-[var(--radius-control)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                />
              </div>
            </div>

            {/* Trip Preview Summary */}
            <div className="p-5 rounded-2xl bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
                    {title || `${destination} Adventure`}
                  </h3>
                  <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
                    {destination} • {startDate} to {endDate}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--color-wakeru-border)] text-xs">
                <div>
                  <span className="text-[var(--color-wakeru-text-secondary)]">Group Budget:</span>
                  <div className="font-bold text-[var(--color-wakeru-text-primary)]">
                    {formatCurrency(parseFloat(budget) || 0, currency)}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--color-wakeru-text-secondary)]">Companions:</span>
                  <div className="font-bold text-[var(--color-wakeru-text-primary)]">
                    1 + {companions.filter(c => c.name.trim()).length} members
                  </div>
                </div>
                <div>
                  <span className="text-[var(--color-wakeru-text-secondary)]">Debt Engine:</span>
                  <div className="font-bold text-emerald-600">
                    Min-Cash-Flow ON
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-[var(--color-wakeru-border)] mt-8">
          {step > 1 ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2"
            >
              <AppIcon name="arrow-left" size={16} />
              <span>Previous</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                if (step === 1 && !destination.trim()) {
                  alert('Please enter a destination.');
                  return;
                }
                setStep(s => s + 1);
              }}
              className="flex items-center gap-2"
            >
              <span>Continue</span>
              <AppIcon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              isLoading={submitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8"
            >
              <AppIcon name="plane" size={18} />
              <span>Launch Trip Hub</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
