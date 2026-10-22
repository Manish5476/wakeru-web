import { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { BusinessReview } from '@/types/api';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const business = db.businesses.find(b => b.id === id);

  if (!business) {
    return jsonError('NOT_FOUND', `Business with ID "${id}" was not found`, 404);
  }

  try {
    const body = await req.json();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

    const newReview: BusinessReview = {
      id: `rev_${Date.now()}`,
      businessId: id,
      travelerHash: 'usr_me',
      rating,
      comment: body.comment || '',
      provenance: body.provenance || 'VERIFIED_BOOKING',
      createdAt: new Date().toISOString(),
    };

    if (!business.reviews) business.reviews = [];
    business.reviews.unshift(newReview);

    // Update business overall rating
    const totalRev = business.reviews.length;
    const avgRating = business.reviews.reduce((s, r) => s + r.rating, 0) / totalRev;
    business.rating = Number(avgRating.toFixed(1));
    business.reviewCount = totalRev;

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'REVIEW_SUBMIT',
      actorId: 'usr_me',
      actorRole: 'TRAVELER',
      targetId: newReview.id,
      details: `Traveler left ${rating}-star review for "${business.businessName}"`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess(newReview, 201);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to submit review', 400);
  }
}
