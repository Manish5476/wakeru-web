"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { vendorApi } from "@/api/vendor";
import { Card, CardHeader, CardTitle, CardContent } from "@/design-system/components/Card";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { BusinessNavTabs } from "@/features/vendor/BusinessNavTabs";

export default function OverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [overview, setOverview] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [overviewRes, completenessRes] = await Promise.all([
          vendorApi.getBusinessOverview(id).catch(() => ({})),
          vendorApi.checkCompleteness(id).catch(() => ({}))
        ]);
        setOverview((overviewRes as any)?.data || overviewRes || {});
        setCompleteness((completenessRes as any)?.data || completenessRes || {});
      } catch (error) {
        console.error("Error fetching overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading business overview...</div>;
  }

  const score = completeness?.score ?? completeness?.completenessScore ?? 80;
  const isVerified = overview?.verificationStatus === 'VERIFIED';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/vendor')}>
            &larr; Businesses
          </Button>
          <h1 className="text-3xl font-bold text-[var(--color-wakeru-text-primary)]">
            Business Overview
          </h1>
        </div>
        <Button variant="secondary" onClick={() => window.open(`/discover/business/${id}`, '_blank')}>
          View Traveler Page ↗
        </Button>
      </div>

      <BusinessNavTabs businessId={id} activeTab="overview" />

      {/* Verification Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isVerified
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-900 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 text-amber-900 dark:text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isVerified ? '🛡️' : '⏳'}</span>
          <div>
            <h3 className="font-bold text-sm">
              {isVerified ? 'Verified Local Partner' : 'Verification Under Review'}
            </h3>
            <p className="text-xs opacity-90">
              {isVerified
                ? 'Your business is officially verified and actively prioritized in traveler trip search and concierge alerts.'
                : 'Our operations team reviews submissions within 24 hours. Keep your services and photos up to date!'}
            </p>
          </div>
        </div>
        <Badge variant={isVerified ? 'default' : 'secondary'}>
          {overview?.verificationStatus || 'PENDING'}
        </Badge>
      </div>

      {/* Profile Completeness & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completeness Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Strength</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[var(--color-wakeru-primary)]">{score}%</span>
              <span className="text-xs text-gray-500">{score >= 80 ? 'Ready for Bookings' : 'Needs Polish'}</span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--color-wakeru-primary)] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
              />
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center gap-2">
                <span>{overview?.hasServices ? '✓' : '○'}</span>
                <span>Services Catalogue Added</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{overview?.hasMedia ? '✓' : '○'}</span>
                <span>Cover & Gallery Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{overview?.hasContact ? '✓' : '○'}</span>
                <span>WhatsApp / Phone Provided</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{overview?.hasCoords ? '✓' : '○'}</span>
                <span>GPS Location Pinned</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <span className="text-2xl block mb-1">📅</span>
              <span className="text-sm font-medium text-gray-500">Booking Requests</span>
              <p className="text-2xl font-bold mt-1 text-[var(--color-wakeru-text-primary)]">
                {overview?.bookingCount ?? overview?.metrics?.bookings ?? 0}
              </p>
              <button
                onClick={() => router.push(`/vendor/businesses/${id}/bookings`)}
                className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-2 inline-block font-medium"
              >
                Manage bookings &rarr;
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <span className="text-2xl block mb-1">🎫</span>
              <span className="text-sm font-medium text-gray-500">Active Reservations</span>
              <p className="text-2xl font-bold mt-1 text-[var(--color-wakeru-text-primary)]">
                {overview?.reservationCount ?? overview?.metrics?.reservations ?? 0}
              </p>
              <button
                onClick={() => router.push(`/vendor/businesses/${id}/reservations`)}
                className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-2 inline-block font-medium"
              >
                View check-in passes &rarr;
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <span className="text-2xl block mb-1">📞</span>
              <span className="text-sm font-medium text-gray-500">Traveler Inquiries</span>
              <p className="text-2xl font-bold mt-1 text-[var(--color-wakeru-text-primary)]">
                {overview?.leadCount ?? overview?.metrics?.leads ?? 0}
              </p>
              <button
                onClick={() => router.push(`/vendor/businesses/${id}/leads`)}
                className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-2 inline-block font-medium"
              >
                View direct leads &rarr;
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <span className="text-2xl block mb-1">⭐</span>
              <span className="text-sm font-medium text-gray-500">Average Rating</span>
              <p className="text-2xl font-bold mt-1 text-[var(--color-wakeru-text-primary)]">
                {overview?.rating ? `${overview.rating.toFixed(1)} ★` : 'No reviews yet'}
              </p>
              <button
                onClick={() => router.push(`/vendor/businesses/${id}/reviews`)}
                className="text-xs text-[var(--color-wakeru-primary)] hover:underline mt-2 inline-block font-medium"
              >
                View traveler reviews &rarr;
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Catalogue & Business Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => router.push(`/vendor/businesses/${id}/services`)}>
            + Add Service or Room
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/vendor/businesses/${id}/media`)}>
            Upload Venue Photos
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/vendor/businesses/${id}/offers`)}>
            Create Discount Offer
          </Button>
          <Button variant="secondary" onClick={() => router.push(`/vendor/businesses/${id}/campaigns`)}>
            Launch Boost Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
