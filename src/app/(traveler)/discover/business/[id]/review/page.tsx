'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { discoveryApi } from '@/api/discover';
import { Business } from '@/types/api';

const HIGHLIGHT_TAGS = [
  'Spotless & Clean 🧹',
  'Stunning Sunset Deck 🌅',
  'Private Plunge Pool 🏊',
  'Fast 5G Wi-Fi ⚡',
  'Exceptional Hospitality 🤝',
  'Delicious Food 🍽️',
  'Seamless Digital Key 🔑',
  'Great for Groups 👥',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Exceptional — Exceeded all expectations!',
  4: 'Very Good — Great stay with minor notes.',
  3: 'Average — Met baseline standards.',
  2: 'Disappointing — Needs noticeable improvement.',
  1: 'Unsatisfactory — Would not recommend.',
};

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter();
  const unwrappedParams = React.use(params as any) as { id: string };
  const businessId = unwrappedParams?.id;

  const [business, setBusiness] = useState<Business | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [provenance, setProvenance] = useState('VERIFIED_BOOKING');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessId) {
      discoveryApi.getBusinessDetail(businessId)
        .then(b => setBusiness(b))
        .catch(() => {});
    }
  }, [businessId]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a brief written summary of your experience.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const idempotencyKey = crypto.randomUUID();
      const combinedComment = selectedTags.length > 0
        ? `${comment.trim()}\n\nHighlights: ${selectedTags.join(', ')}`
        : comment.trim();

      const payload = {
        rating,
        comment: combinedComment,
        provenance,
      };

      await discoveryApi.createReview(businessId, payload, idempotencyKey);
      setSubmitted(true);
      setTimeout(() => {
        router.push(`/discover/business/${businessId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit review', err);
      setError('Failed to publish review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarCount = hoverRating ?? rating;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-wakeru-text-secondary)]">
        <Link href="/discover" className="hover:text-[var(--color-wakeru-primary)]">
          Discover
        </Link>
        <span>/</span>
        <Link href={`/discover/business/${businessId}`} className="hover:text-[var(--color-wakeru-primary)] truncate max-w-[200px]">
          {business?.businessName || 'Venue'}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-wakeru-text-primary)] font-semibold">Write Review</span>
      </div>

      <Card className="border-[var(--color-wakeru-border)]">
        <CardHeader className="border-b border-[var(--color-wakeru-border)] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-wakeru-primary)] uppercase tracking-wider">
                Traveler Feedback
              </span>
              <CardTitle className="text-2xl mt-1">
                Review {business?.businessName || 'Venue'}
              </CardTitle>
              <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1">
                Help fellow travelers plan their group getaways with verified, honest impressions.
              </p>
            </div>
            {business?.verificationStatus === 'VERIFIED' && (
              <Badge variant="verified">✓ Verified Partner</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-5xl block animate-bounce">🌟</span>
              <h3 className="text-xl font-bold text-[var(--color-wakeru-text-primary)]">
                Thank you for your review!
              </h3>
              <p className="text-sm text-[var(--color-wakeru-text-secondary)]">
                Your experience has been verified and recorded. Redirecting back to the venue...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-[var(--radius-control)] bg-red-50 dark:bg-red-950/20 border border-[var(--color-wakeru-danger)] text-xs text-[var(--color-wakeru-danger)] font-medium">
                  {error}
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={star <= activeStarCount ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-semibold text-[var(--color-wakeru-text-primary)]">
                    {RATING_DESCRIPTIONS[activeStarCount]}
                  </span>
                </div>
              </div>

              {/* Experience Highlights */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  What made it stand out? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {HIGHLIGHT_TAGS.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-[var(--color-wakeru-primary)] text-white border-[var(--color-wakeru-primary)] shadow-sm'
                            : 'bg-[var(--color-wakeru-surface)] text-[var(--color-wakeru-text-secondary)] border-[var(--color-wakeru-border)] hover:bg-[var(--color-wakeru-surface-hover)]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                    Written Review
                  </label>
                  <span className="text-[11px] text-[var(--color-wakeru-text-muted)]">
                    {comment.length} / 500
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Share details about the ambiance, location convenience, pool cleaniness, check-in ease, and group dining highlights..."
                  className="w-full h-32 p-3 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] text-sm text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)] leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Booking Provenance */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                  Trip Provenance
                </label>
                <select
                  value={provenance}
                  onChange={(e) => setProvenance(e.target.value)}
                  className="w-full h-10 px-3 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] text-xs font-medium text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                >
                  <option value="VERIFIED_BOOKING">Verified Booking (App Reservation / Digital Keyholder)</option>
                  <option value="LOCAL">Local Experience (Visited In-Person)</option>
                  <option value="TOURIST">Tourist Visit</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[var(--color-wakeru-border)] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !comment.trim()}
                  className="gap-2"
                >
                  {submitting ? 'Publishing...' : 'Publish Verified Review ★'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
