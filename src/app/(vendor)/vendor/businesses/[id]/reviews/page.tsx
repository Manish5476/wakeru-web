'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/api/vendor';
import { BusinessReview } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { BusinessNavTabs } from '@/features/vendor/BusinessNavTabs';

export default function VendorReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReviews(id);
      setReviews(res.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;

    try {
      setReplyingId(reviewId);
      await vendorApi.replyToReview(reviewId, text);
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, vendorReply: text } : r))
      );
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    } catch (error) {
      console.error('Error replying to review:', error);
    } finally {
      setReplyingId(null);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
              Traveler Reviews &amp; Host Replies
            </h1>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-0.5">
              Verified customer feedback and transparent host communication.
            </p>
          </div>
        </div>

        {/* Rating Meter */}
        <div className="flex items-center gap-2 bg-[var(--color-wakeru-surface-muted)] px-3 py-1.5 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border)]">
          <span className="text-amber-400 text-base">★</span>
          <span className="text-sm font-bold text-[var(--color-wakeru-text-primary)]">{avgRating} / 5.0</span>
          <span className="text-xs text-[var(--color-wakeru-text-muted)]">({reviews.length} reviews)</span>
        </div>
      </div>

      <BusinessNavTabs businessId={id} activeTab="reviews" />

      {loading ? (
        <Card className="animate-pulse h-48 bg-[var(--color-wakeru-surface-muted)]" />
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20 space-y-3">
            <span className="text-4xl block">⭐</span>
            <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)]">
              No reviews recorded yet
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)] max-w-sm mx-auto">
              When guests complete their stay and submit verified reviews, they will appear here for public reply.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-bold">
                      {'★'.repeat(review.rating || 5)}{'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}
                    </span>
                    <Badge variant="verified" className="text-[10px]">
                      {review.provenance || 'VERIFIED_BOOKING'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--color-wakeru-text-muted)]">
                    Traveler: {review.travelerHash || 'Guest'} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--color-wakeru-text-primary)] leading-relaxed">
                {review.comment}
              </p>

              {/* Host Reply */}
              {review.vendorReply ? (
                <div className="p-3.5 rounded-[var(--radius-control)] bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--color-wakeru-primary)]">
                    <span>💬</span>
                    <span>Host Official Response:</span>
                  </div>
                  <p className="text-[var(--color-wakeru-text-secondary)] leading-relaxed">
                    {review.vendorReply}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-[var(--color-wakeru-border)]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-wakeru-text-secondary)]">
                    Respond to Traveler
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Thank the traveler or offer clarification..."
                      value={replyText[review.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      className="flex-1 h-9 px-3 rounded-[var(--radius-control)] border border-[var(--color-wakeru-border-strong)] bg-[var(--color-wakeru-bg)] text-xs text-[var(--color-wakeru-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wakeru-primary)]"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleReply(review.id)}
                      disabled={!replyText[review.id]?.trim() || replyingId === review.id}
                      className="text-xs font-semibold"
                    >
                      {replyingId === review.id ? 'Posting...' : 'Post Reply'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
